import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Plus, TrendingUp, CheckCircle, Clock, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { matchesMonth, displayDate, todayISO, toInputDate } from '../../utils/date'
import api from '../../services/api'
import './Pendapatan.css'
import '../../components/dashboard/PaymentModal.css'

const KATEGORI_OPTIONS = ['Jasa', 'Produk', 'Kursus', 'Lainnya']
const STATUS_OPTIONS = ['Pending', 'Lunas']
const ROWS_PER_PAGE = 10
const EMPTY_FORM = { tanggal: todayISO(), keterangan: '', kategori: 'Jasa', jumlah: '', status: 'Pending' }

function nextStrukNo() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `SR${ts}${rand}`
}

function parseRupiah(str) {
  return parseInt(String(str).replace(/\D/g, ''), 10) || 0
}

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

const STATUS_CLS = {
  Lunas: 'pdt-badge--lunas',
  Pending: 'pdt-badge--pending',
}

export default function Pendapatan() {
  const navigate = useNavigate()
  const { pendapatan: rows, refetchPendapatan } = useData()
  const [search, setSearch] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (!matchesMonth(r.tanggal, filterBulan)) return false
      if (filterStatus !== 'Semua' && r.status !== filterStatus) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        (r.keterangan || '').toLowerCase().includes(q) ||
        (r.kategori || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q)
      )
    })
  }, [rows, search, filterBulan, filterStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const totalLunas = useMemo(() => rows.filter(r => r.status === 'Lunas').reduce((s, r) => s + parseRupiah(r.jumlah), 0), [rows])
  const totalPending = useMemo(() => rows.filter(r => r.status === 'Pending').reduce((s, r) => s + parseRupiah(r.jumlah), 0), [rows])
  const totalPendapatan = useMemo(() => rows.reduce((s, r) => s + parseRupiah(r.jumlah), 0), [rows])
  const lunasCount = rows.filter(r => r.status === 'Lunas').length

  function validate() {
    const e = {}
    if (!form.tanggal) e.tanggal = 'Tanggal wajib diisi'
    if (!form.keterangan.trim()) e.keterangan = 'Keterangan wajib diisi'
    if (!form.jumlah.trim()) e.jumlah = 'Jumlah wajib diisi'
    return e
  }

  function openAdd() { setEditItem(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  function openEdit(row) { setEditItem(row); setForm({ tanggal: toInputDate(row.tanggal), keterangan: row.keterangan, kategori: row.kategori, jumlah: row.jumlah, status: row.status }); setErrors({}); setModalOpen(true) }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const jumlahNum = parseRupiah(form.jumlah)
    const entry = {
      ...form,
      tanggal: displayDate(form.tanggal),
      jumlah: `Rp ${jumlahNum.toLocaleString('id-ID')}`,
      // Generate struk_no baru hanya saat tambah, pertahankan yang ada saat edit
      struk_no: editItem ? (editItem.struk_no || undefined) : nextStrukNo(),
    }
    setSaving(true)
    try {
      if (editItem) {
        await api.put(`/pendapatan/${editItem.id}`, entry)
      } else {
        await api.post('/pendapatan', entry)
      }
      await refetchPendapatan()
      setModalOpen(false); setEditItem(null); setForm(EMPTY_FORM); setErrors({})
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Gagal menyimpan' })
    } finally { setSaving(false) }
  }

  function handleCatatPembayaran(row) {
    navigate('/dashboard/pembayaran', {
      state: {
        fromPendapatan: {
          strukNo: row.struk_no,
          keterangan: row.keterangan,
          jumlah: String(parseRupiah(row.jumlah)),
        },
      },
    })
  }

  async function handleDelete() {
    try {
      await api.delete(`/pendapatan/${deleteItem.id}`)
      await refetchPendapatan()
    } catch (err) { console.error('Delete pendapatan error:', err.message) }
    setDeleteItem(null)
  }
  function handleChange(field, value) { setForm(f => ({ ...f, [field]: value })); setErrors(er => ({ ...er, [field]: undefined })) }

  const STAT_CARDS = [
    { label: 'Total Pendapatan', value: formatRupiah(totalPendapatan), desc: `${lunasCount} transaksi lunas`, icon: TrendingUp, iconBg: '#EAF3FF', iconColor: '#1769E0' },
    { label: 'Lunas', value: formatRupiah(totalLunas), desc: `${lunasCount} transaksi`, icon: CheckCircle, iconBg: '#DCFCE7', iconColor: '#15803D' },
    { label: 'Pending', value: formatRupiah(totalPending), desc: `${rows.filter(r => r.status === 'Pending').length} transaksi`, icon: Clock, iconBg: '#FEF3C7', iconColor: '#B45309' },
  ]

  return (
    <div className="page">
      <div className="pdt__heading">
        <div>
          <h2 className="pdt__title">Pendapatan</h2>
          <p className="pdt__subtitle">Kelola data pendapatan TEFA RPL secara realtime.</p>
        </div>
        <div className="pdt__head-right">
          <span className="pdt-live"><span className="pdt-live__dot" />Live</span>
          <button className="pdt__add-btn" onClick={openAdd}><Plus size={15} />Tambah Pendapatan</button>
        </div>
      </div>

      <div className="pdt__stats">
        {STAT_CARDS.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="pdtstat">
              <div className="pdtstat__left">
                <p className="pdtstat__label">{card.label}</p>
                <p className="pdtstat__value">{card.value}</p>
                <p className="pdtstat__desc">{card.desc}</p>
              </div>
              <div className="pdtstat__icon" style={{ background: card.iconBg }}>
                <Icon size={20} color={card.iconColor} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="pdt-card">
        <div className="pdt-card__header">
          <h3 className="pdt-card__title">Daftar Pendapatan</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="month" className="pdt-search" style={{ width: 'auto' }} value={filterBulan} onChange={e => { setFilterBulan(e.target.value); setPage(1) }} />
            <select className="pdt-search" style={{ width: 'auto' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
              <option value="Semua">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Lunas">Lunas</option>
            </select>
            <input type="search" className="pdt-search" placeholder="Cari keterangan, kategori..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
        </div>
        <div className="pdt-table-wrap">
          <table className="pdt-table">
            <thead>
              <tr>
                <th className="pdt-table__th pdt-table__th--no">No</th>
                <th className="pdt-table__th">Tanggal</th>
                <th className="pdt-table__th">Keterangan</th>
                <th className="pdt-table__th">Kategori</th>
                <th className="pdt-table__th">Jumlah</th>
                <th className="pdt-table__th">Status</th>
                <th className="pdt-table__th pdt-table__th--action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="pdt-table__empty">Belum ada data pendapatan.</td></tr>
              ) : paginated.map((row, i) => (
                <tr key={i} className="pdt-table__row">
                  <td className="pdt-table__td pdt-table__td--no">{(page - 1) * ROWS_PER_PAGE + i + 1}</td>
                  <td className="pdt-table__td pdt-table__td--muted">{displayDate(row.tanggal)}</td>
                  <td className="pdt-table__td">{row.keterangan}</td>
                  <td className="pdt-table__td pdt-table__td--muted">{row.kategori}</td>
                  <td className="pdt-table__td pdt-table__td--amount">{row.jumlah}</td>
                  <td className="pdt-table__td">
                    <span className={`pdt-badge ${STATUS_CLS[row.status] ?? 'pdt-badge--pending'}`}>{row.status}</span>
                  </td>
                  <td className="pdt-table__td pdt-table__td--action">
                    <div className="pdt-actions">
                      {row.status === 'Pending' && (
                        <button className="pdt-action-btn pdt-action-btn--pay" onClick={() => handleCatatPembayaran(row)} title="Catat Pembayaran">
                          <CreditCard size={13} />
                        </button>
                      )}
                      <button className="pdt-action-btn pdt-action-btn--edit" onClick={() => openEdit(row)}><Pencil size={13} /></button>
                      <button className="pdt-action-btn pdt-action-btn--delete" onClick={() => setDeleteItem(row)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pdt-footer">
          <span className="pdt-footer__count">Menampilkan {paginated.length} dari {filtered.length} data</span>
          <div className="pdt-footer__pages">
            <button className="pdt-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(n => (
              <button key={n} className={`pdt-page-btn${page === n ? ' pdt-page-btn--active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="pdt-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{editItem ? 'Edit Pendapatan' : 'Tambah Pendapatan'}</h3>
              <button className="modal__close" onClick={() => setModalOpen(false)} aria-label="Tutup">✕</button>
            </div>
            <form className="modal__body" onSubmit={handleSave} noValidate>
              <div className="modal__field">
                <label className="modal__label" htmlFor="pdt-tanggal">Tanggal</label>
                <input id="pdt-tanggal" type="date" className={`modal__input${errors.tanggal ? ' modal__input--error' : ''}`} value={form.tanggal} onChange={e => handleChange('tanggal', e.target.value)} />
                {errors.tanggal && <span className="modal__error">{errors.tanggal}</span>}
              </div>
              {[
                { id: 'keterangan', label: 'Keterangan', placeholder: 'contoh: Jasa Desain Web — PT Maju Jaya' },
                { id: 'jumlah', label: 'Jumlah', placeholder: 'contoh: Rp 250.000' },
              ].map(({ id, label, placeholder }) => (
                <div className="modal__field" key={id}>
                  <label className="modal__label" htmlFor={`pdt-${id}`}>{label}</label>
                  <input id={`pdt-${id}`} type="text" className={`modal__input${errors[id] ? ' modal__input--error' : ''}`} placeholder={placeholder} value={form[id]} onChange={e => handleChange(id, e.target.value)} />
                  {errors[id] && <span className="modal__error">{errors[id]}</span>}
                </div>
              ))}
              <div className="modal__field">
                <label className="modal__label" htmlFor="pdt-kategori">Kategori</label>
                <select id="pdt-kategori" className="modal__select" value={form.kategori} onChange={e => handleChange('kategori', e.target.value)}>
                  {KATEGORI_OPTIONS.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="modal__field">
                <label className="modal__label" htmlFor="pdt-status">Status</label>
                <select id="pdt-status" className="modal__select" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="modal__footer">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="modal__btn modal__btn--primary" disabled={saving}>{saving ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal modal--sm">
            <div className="modal__header"><h3 className="modal__title">Hapus Pendapatan</h3></div>
            <div className="modal__body">
              <p className="pembayaran__confirm-text">Hapus pendapatan <strong>{deleteItem.keterangan}</strong>? Data tidak bisa dikembalikan.</p>
              <div className="modal__footer">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => setDeleteItem(null)}>Batal</button>
                <button type="button" className="modal__btn modal__btn--danger" onClick={handleDelete}>Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
