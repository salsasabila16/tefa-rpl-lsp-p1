import { useState, useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Eye, Pencil, Trash2, CheckCircle, Clock,
  AlertTriangle, TrendingUp,
  ChevronLeft, ChevronRight, Calendar,
} from 'lucide-react'
import PaymentModal from '../../components/dashboard/PaymentModal'
import StrukModal from '../../components/dashboard/StrukModal'
import { AuthContext } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { useSocket } from '../../contexts/SocketContext'
import { matchesMonth } from '../../utils/date'
import api from '../../services/api'
import useDebounce from '../../hooks/useDebounce'
import './Pembayaran.css'

const METODE_OPTIONS = ['Transfer Bank', 'QRIS', 'Tunai']
const STATUS_EDIT_OPTIONS = ['Lunas', 'Pending', 'Pending Verifikasi', 'Ditolak']
const ROWS_PER_PAGE = 10

const STATUS_CONFIG = {
  Lunas: { cls: 'pbadge--lunas', icon: CheckCircle },
  'Pending Verifikasi': { cls: 'pbadge--verif', icon: Clock },
  Pending: { cls: 'pbadge--pending', icon: Clock },
  Ditolak: { cls: 'pbadge--ditolak', icon: AlertTriangle },
  'Belum Bayar': { cls: 'pbadge--belum', icon: AlertTriangle },
}

const BENDAHARA_PHONE = '6281999042075'

function formatTanggal(isoDate) {
  if (!isoDate) return '-'
  const d = new Date(isoDate)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function parseName(pembayar = '') {
  const match = pembayar.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/)
  return { name: match?.[1]?.trim() ?? pembayar, sub: match?.[2] ?? '' }
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function emptyEditForm(row) {
  return {
    pembayar: row.pembayar || '',
    produk: row.produk || '',
    metode: row.metode || 'Transfer Bank',
    jumlah: row.jumlahRaw != null ? String(row.jumlahRaw) : String(row.jumlah || '').replace(/[^0-9]/g, ''),
    tanggal: row.tanggal || '',
    status: row.status || 'Pending',
  }
}

function pct(n, total) {
  if (!total) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

function sumRaw(list) {
  return list.reduce((s, r) => {
    const raw = r.jumlahRaw ?? r.jumlah_raw
    const n = raw != null ? Number(raw) : Number.parseInt(String(r.jumlah || '').replace(/[^0-9]/g, ''), 10)
    return s + (Number.isFinite(n) ? n : 0)
  }, 0)
}

export default function Pembayaran() {
  const { user } = useContext(AuthContext)
  const isBendahara = user?.role === 'bendahara'
  const socket = useSocket()
  const emit = socket?.emit ?? (() => {})

  const { pembayaran: rows = [], refetchPembayaran, refetchPendapatan, refetchPenjualan } = useData()
  const [search, setSearch] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmRow, setConfirmRow] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [strukRow, setStrukRow] = useState(null)
  const [keterangan, setKeterangan] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [detailRow, setDetailRow] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [deleteRow, setDeleteRow] = useState(null)

  const location = useLocation()
  const navigate = useNavigate()
  const [modalInitialData, setModalInitialData] = useState({})

  // Captured once on mount — stable across re-renders so the modal doesn't
  // close when we clear location.state below.
  const [fromSiswa, setFromSiswa] = useState(() => location.state?.fromSiswa ?? null)
  const [fromPendapatan, setFromPendapatan] = useState(() => location.state?.fromPendapatan ?? null)

  const debouncedSearch = useDebounce(search, 250)

  const fromSiswaInitialData = fromSiswa
    ? { pembayar: fromSiswa.nama, produk: fromSiswa.produk, jumlah: fromSiswa.tagihan }
    : {}
  const fromPendapatanInitialData = fromPendapatan
    ? { produk: fromPendapatan.keterangan, jumlah: fromPendapatan.jumlah, strukNo: fromPendapatan.strukNo }
    : {}
  const paymentModalOpen = modalOpen || Boolean(fromSiswa) || Boolean(fromPendapatan)
  const paymentModalInitialData = fromSiswa
    ? fromSiswaInitialData
    : fromPendapatan
    ? fromPendapatanInitialData
    : modalInitialData

  // Bersihkan location state sekali saja agar modal tidak terbuka ulang saat
  // refresh atau navigasi kembali.
  useEffect(() => {
    if (!location.state?.fromSiswa && !location.state?.fromPendapatan) return
    navigate(location.pathname, { replace: true, state: null })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = rows.filter(r => {
    if (!matchesMonth(r.tanggal, filterBulan)) return false
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return (
      (r.pembayar || '').toLowerCase().includes(q) ||
      (r.produk || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q) ||
      String(r.strukNo ?? r.struk_no ?? '').toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)

  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)

  const lunas = rows.filter(r => r.status === 'Lunas').length
  const menunggu = rows.filter(r => r.status === 'Pending Verifikasi').length
  const pending = rows.filter(r => r.status === 'Pending').length
  const ditolak = rows.filter(r => r.status === 'Ditolak').length
  // Total hanya dari transaksi yang sudah terverifikasi (Lunas)
  const totalAmount = rows.filter(r => r.status === 'Lunas').reduce((sum, r) => {
    const raw = r.jumlahRaw ?? r.jumlah_raw
    const amount = raw != null ? Number(raw) : Number.parseInt(String(r.jumlah || '').replace(/[^0-9]/g, ''), 10)
    return sum + (Number.isFinite(amount) ? amount : 0)
  }, 0)

  async function handleSave(form) {
    const isTransfer = form.metode === 'Transfer Bank' || form.metode === 'QRIS'
    const now = new Date()
    const waktu = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const tanggalFormatted = form.tanggal ? formatTanggal(form.tanggal) : formatTanggal(new Date().toISOString())
    const jumlahNum = Number.parseInt(String(form.jumlah ?? '').replace(/\D/g, ''), 10) || 0
    const payload = {
      struk_no: form.strukNo || form.struk_no || undefined,
      pembayar: form.pembayar,
      produk: form.produk,
      tanggal: `${tanggalFormatted} ${waktu}`,
      metode: form.metode,
      jumlah: `Rp ${jumlahNum.toLocaleString('id-ID')}`,
      jumlah_raw: jumlahNum,
      bayar: form.bayar || null,
      status: isTransfer ? 'Pending Verifikasi' : 'Pending',
    }
    try {
      const res = await api.post('/pembayaran', payload)
      const newRow = { ...res.data, jumlahRaw: res.data.jumlah_raw ?? res.data.jumlahRaw, strukNo: res.data.struk_no ?? res.data.strukNo }
      setPage(1)
      setModalInitialData({})
      emit('pembayaran:baru', { pembayar: newRow.pembayar, produk: newRow.produk, strukNo: newRow.strukNo })
      await refetchPembayaran()
      return newRow
    } catch (err) {
      console.error('Save pembayaran error:', err.message)
      return null
    }
  }

  function handleVerify(row, action) {
    setConfirmRow(row)
    setConfirmAction(action)
    setKeterangan('')
    setVerifyError('')
  }

  async function confirmVerify() {
    if (!confirmRow?.id || !confirmAction) return
    const rowId = confirmRow.id
    const action = confirmAction
    setVerifyError('')
    try {
      const res = await api.post(`/pembayaran/${rowId}/verifikasi`, { action, keterangan })
      const verified = { ...res.data, jumlahRaw: res.data.jumlah_raw ?? res.data.jumlahRaw, strukNo: res.data.struk_no ?? res.data.strukNo }

      if (action === 'approve') {
        await refetchPendapatan()
        await refetchPenjualan()
        setStrukRow(verified)
      }

      emit('pembayaran:verifikasi', { strukNo: verified.strukNo, status: verified.status, pembayar: verified.pembayar })
      await refetchPembayaran()
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Verifikasi gagal. Coba lagi.')
      return
    }
    setConfirmRow(null)
    setConfirmAction(null)
    setKeterangan('')
  }

  function openEdit(row) {
    setEditRow(row)
    setEditForm(emptyEditForm(row))
    setEditErrors({})
  }

  function handleEditChange(field, value) {
    setEditForm(f => ({ ...f, [field]: value }))
    setEditErrors(er => ({ ...er, [field]: undefined }))
  }

  function validateEdit() {
    const e = {}
    if (!String(editForm.pembayar ?? '').trim()) e.pembayar = 'Nama pembayar wajib diisi'
    if (!String(editForm.produk ?? '').trim()) e.produk = 'Produk wajib diisi'
    if (!String(editForm.jumlah ?? '').trim()) e.jumlah = 'Jumlah wajib diisi'
    return e
  }

  async function handleEditSave(e) {
    e.preventDefault()
    const errs = validateEdit()
    if (Object.keys(errs).length) { setEditErrors(errs); return }
    const jumlahNum = Number.parseInt(String(editForm.jumlah ?? '').replace(/\D/g, ''), 10) || 0
    try {
      await api.put(`/pembayaran/${editRow.id}`, {
        pembayar: editForm.pembayar,
        produk: editForm.produk,
        metode: editForm.metode,
        jumlah: `Rp ${jumlahNum.toLocaleString('id-ID')}`,
        jumlah_raw: jumlahNum,
        tanggal: editForm.tanggal,
        status: editForm.status,
      })
      await refetchPembayaran()
    } catch (err) {
      console.error('Edit pembayaran error:', err.message)
    }
    setEditRow(null)
  }

  async function handleDelete() {
    if (!deleteRow?.id) return
    try {
      await api.delete(`/pembayaran/${deleteRow.id}`)
      await refetchPembayaran()
    } catch (err) {
      console.error('Delete pembayaran error:', err.message)
    }
    setDeleteRow(null)
  }

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`
  const thisMonthTotal = sumRaw(rows.filter(r => r.status === 'Lunas' && matchesMonth(r.tanggal, thisMonth)))
  const lastMonthTotal = sumRaw(rows.filter(r => r.status === 'Lunas' && matchesMonth(r.tanggal, lastMonth)))
  let growthSub, growthCls
  if (lastMonthTotal === 0 && thisMonthTotal === 0) {
    growthSub = 'Belum ada transaksi'
    growthCls = ''
  } else if (lastMonthTotal === 0) {
    growthSub = 'Transaksi pertama bulan ini'
    growthCls = 'positive'
  } else {
    const diff = Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
    if (diff > 0) { growthSub = `+${diff}% dari bulan lalu`; growthCls = 'positive' }
    else if (diff < 0) { growthSub = `${diff}% dari bulan lalu`; growthCls = '' }
    else { growthSub = 'Sama dengan bulan lalu'; growthCls = '' }
  }

  const STAT_CARDS = [
    {
      label: 'Pendapatan Terkonfirmasi',
      value: `Rp ${totalAmount.toLocaleString('id-ID')}`,
      sub: growthSub,
      subCls: growthCls,
      icon: TrendingUp,
      iconBg: '#EAF3FF',
      iconColor: '#1769E0',
    },
    {
      label: 'Pembayaran Lunas',
      value: lunas,
      sub: `${pct(lunas, rows.length)} dari total transaksi`,
      subCls: '',
      icon: CheckCircle,
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
    },
    {
      label: 'Menunggu Verifikasi',
      value: menunggu,
      sub: `${pct(menunggu, rows.length)} dari total transaksi`,
      subCls: '',
      icon: Clock,
      iconBg: '#FEF3C7',
      iconColor: '#B45309',
    },
    {
      label: 'Belum Dikonfirmasi',
      value: pending + ditolak,
      sub: `${pending} pending · ${ditolak} ditolak`,
      subCls: '',
      icon: AlertTriangle,
      iconBg: '#FEE2E2',
      iconColor: '#B91C1C',
    },
  ]

  return (
    <div className="page">
      {/* Page heading */}
      <div className="pmb__heading">
        <h2 className="pmb__title">Pembayaran</h2>
        <p className="pmb__subtitle">Kelola data pembayaran siswa dan pelanggan TEFA RPL.</p>
      </div>

      {/* Stat cards */}
      <div className="pmb__stats">
        {STAT_CARDS.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="pstat">
              <div className="pstat__left">
                <p className="pstat__label">{card.label}</p>
                <p className="pstat__value">{card.value}</p>
                <p className={`pstat__sub${card.subCls === 'positive' ? ' pstat__sub--positive' : ''}`}>
                  {card.subCls === 'positive' && <span className="pstat__arrow">↑</span>}
                  {card.sub}
                </p>
              </div>
              <div className="pstat__icon-wrap" style={{ background: card.iconBg }}>
                <Icon size={20} color={card.iconColor} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Table card */}
      <div className="plist-card">
        <div className="plist-card__header">
          <div>
            <h3 className="plist-card__title">Daftar Pembayaran</h3>
          </div>
          <div className="plist-card__controls">
            <div className="plist-filter">
              <Calendar size={14} className="plist-filter__icon" />
              <input
                type="month"
                className="plist-filter__select"
                value={filterBulan}
                onChange={e => { setFilterBulan(e.target.value); setPage(1) }}
              />
            </div>
            <input
              type="search"
              className="plist-search"
              placeholder="Cari nama, status..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
            {!isBendahara && (
              <button className="plist-card__add-btn" onClick={() => setModalOpen(true)}>
                + Tambah Pembayaran
              </button>
            )}
          </div>
        </div>

        <div className="ptable-wrap">
          <table className="ptable">
            <thead>
              <tr>
                <th className="ptable__th">Nama Pembayar</th>
                <th className="ptable__th">Tanggal</th>
                <th className="ptable__th">Metode</th>
                <th className="ptable__th">Jumlah</th>
                <th className="ptable__th">Status</th>
                <th className="ptable__th ptable__th--action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ptable__empty">Belum ada data pembayaran.</td>
                </tr>
              ) : (
                paginated.map((row, i) => {
                  const { name } = parseName(row.pembayar)
                  const initials = getInitials(name)
                  const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.Pending
                  const StatusIcon = statusCfg.icon
                  return (
                    <tr key={row.id ?? row.strukNo ?? row.struk_no ?? i} className="ptable__row">
                      <td className="ptable__td">
                        <div className="ptable__payer">
                          <div className="ptable__avatar">{initials}</div>
                          <span className="ptable__payer-name">{name}</span>
                        </div>
                      </td>
                      <td className="ptable__td ptable__td--muted">{row.tanggal}</td>
                      <td className="ptable__td">{row.metode}</td>
                      <td className="ptable__td ptable__td--amount">{row.jumlah}</td>
                      <td className="ptable__td">
                        <span className={`pbadge ${statusCfg.cls}`}>
                          <StatusIcon size={11} />
                          {row.status}
                        </span>
                      </td>
                      <td className="ptable__td ptable__td--action">
                        <div className="pact">
                          <button className="pact__btn pact__btn--detail" onClick={() => setDetailRow(row)} title="Detail">
                            <Eye size={12} />
                            Detail
                          </button>
                          {isBendahara && (row.status === 'Pending Verifikasi' || row.status === 'Pending') && (
                            <>
                              <button className="pact__btn pact__btn--edit" onClick={() => handleVerify(row, 'approve')} title="Setujui">
                                <CheckCircle size={12} />
                                Setujui
                              </button>
                              <button className="pact__btn pact__btn--delete" onClick={() => handleVerify(row, 'reject')} title="Tolak">
                                <AlertTriangle size={12} />
                                Tolak
                              </button>
                            </>
                          )}
                          <button className="pact__btn pact__btn--edit" onClick={() => openEdit(row)} title="Edit">
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button className="pact__btn pact__btn--delete" onClick={() => setDeleteRow(row)} title="Hapus">
                            <Trash2 size={12} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="plist-footer">
          <span className="plist-footer__count">
            Menampilkan {Math.min(paginated.length, filtered.length)} dari {filtered.length} data
          </span>
          <div className="plist-footer__pages">
            <button
              className="plist-page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(n => (
              <button
                key={n}
                className={`plist-page-btn${page === n ? ' plist-page-btn--active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="plist-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add payment modal */}
      {paymentModalOpen && (
        <PaymentModal
          onClose={() => {
            setModalOpen(false)
            setModalInitialData({})
            setFromSiswa(null)
            setFromPendapatan(null)
          }}
          onSave={handleSave}
          bendaharaPhone={BENDAHARA_PHONE}
          initialData={paymentModalInitialData}
          onDone={() => navigate('/dashboard/jurnal')}
        />
      )}

      {/* Detail modal */}
      {detailRow && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal modal--sm">
            <div className="modal__header">
              <h3 className="modal__title">Detail Pembayaran</h3>
              <button className="modal__close" onClick={() => setDetailRow(null)} aria-label="Tutup">✕</button>
            </div>
            <div className="modal__body">
              {[
                ['No Struk', detailRow.strukNo || '-'],
                ['Nama Pembayar', detailRow.pembayar],
                ['Produk', detailRow.produk || '-'],
                ['Metode', detailRow.metode],
                ['Jumlah', detailRow.jumlah],
                ['Tanggal', detailRow.tanggal],
                ['Status', detailRow.status],
                ['Keterangan', detailRow.keterangan || '-'],
              ].map(([label, val]) => (
                <div className="modal__field pembayaran__detail-row" key={label}>
                  <span className="pembayaran__detail-label">{label}</span>
                  <span className="pembayaran__detail-val">{val}</span>
                </div>
              ))}
              <div className="modal__footer">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => setDetailRow(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editRow && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">Edit Pembayaran</h3>
              <button className="modal__close" onClick={() => setEditRow(null)} aria-label="Tutup">✕</button>
            </div>
            <form className="modal__body" onSubmit={handleEditSave} noValidate>
              {[
                { id: 'pembayar', label: 'Nama Pembayar', placeholder: 'Nama pembayar' },
                { id: 'produk', label: 'Produk / Kursus', placeholder: 'Produk atau kursus' },
                { id: 'jumlah', label: 'Jumlah (Rp)', placeholder: 'contoh: 200000' },
                { id: 'tanggal', label: 'Tanggal', placeholder: 'contoh: 28 Sep 2026' },
              ].map(({ id, label, placeholder }) => (
                <div className="modal__field" key={id}>
                  <label className="modal__label" htmlFor={`edit-${id}`}>{label}</label>
                  <input
                    id={`edit-${id}`}
                    type="text"
                    className={`modal__input${editErrors[id] ? ' modal__input--error' : ''}`}
                    placeholder={placeholder}
                    value={editForm[id] ?? ''}
                    onChange={e => handleEditChange(id, e.target.value)}
                  />
                  {editErrors[id] && <span className="modal__error">{editErrors[id]}</span>}
                </div>
              ))}
              <div className="modal__field">
                <label className="modal__label" htmlFor="edit-metode">Metode</label>
                <select id="edit-metode" className="modal__select" value={editForm.metode ?? METODE_OPTIONS[0]} onChange={e => handleEditChange('metode', e.target.value)}>
                  {METODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="modal__field">
                <label className="modal__label" htmlFor="edit-status">Status</label>
                <select id="edit-status" className="modal__select" value={editForm.status ?? STATUS_EDIT_OPTIONS[0]} onChange={e => handleEditChange('status', e.target.value)}>
                  {STATUS_EDIT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="modal__footer">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => setEditRow(null)}>Batal</button>
                <button type="submit" className="modal__btn modal__btn--primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteRow && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal modal--sm">
            <div className="modal__header">
              <h3 className="modal__title">Hapus Pembayaran</h3>
            </div>
            <div className="modal__body">
              <p className="pembayaran__confirm-text">
                Hapus pembayaran dari <strong>{deleteRow.pembayar}</strong> sebesar <strong>{deleteRow.jumlah}</strong>? Data tidak bisa dikembalikan.
              </p>
              <div className="modal__footer">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => setDeleteRow(null)}>Batal</button>
                <button type="button" className="modal__btn modal__btn--danger" onClick={handleDelete}>Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify confirm */}
      {confirmRow && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal modal--sm">
            <div className="modal__header">
              <h3 className="modal__title">
                {confirmAction === 'approve' ? 'Setujui Pembayaran' : 'Tolak Pembayaran'}
              </h3>
            </div>
            <div className="modal__body">
              <p className="pembayaran__confirm-text">
                {confirmAction === 'approve'
                  ? `Setujui pembayaran dari ${confirmRow.pembayar} sebesar ${confirmRow.jumlah}?`
                  : `Tolak pembayaran dari ${confirmRow.pembayar}?`}
              </p>
              <div className="modal__field">
                <label className="modal__label" htmlFor="ket-input">
                  Keterangan {confirmAction === 'approve' ? '(opsional)' : ''}
                </label>
                <textarea
                  id="ket-input"
                  className="modal__textarea"
                  rows={3}
                  placeholder="contoh: Pembayaran kelas private coding course untuk pertemuan 2–5"
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                />
              </div>
              {verifyError && <p className="modal__error" style={{ marginTop: '8px' }}>{verifyError}</p>}
              <div className="modal__footer">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => { setConfirmRow(null); setVerifyError('') }}>Batal</button>
                <button
                  type="button"
                  className={confirmAction === 'approve' ? 'modal__btn modal__btn--primary' : 'modal__btn modal__btn--danger'}
                  onClick={confirmVerify}
                >
                  {confirmAction === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {strukRow && (
        <StrukModal
          payment={strukRow}
          onClose={() => setStrukRow(null)}
          canEditKet={isBendahara}
        />
      )}
    </div>
  )
}
