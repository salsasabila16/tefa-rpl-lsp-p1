import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CheckCircle, Clock, CreditCard, BookOpen, ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { todayISO, toInputDate } from '../../utils/date'
import api from '../../services/api'
import './Siswa.css'
import '../../components/dashboard/PaymentModal.css'

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function parseRupiah(str) {
  return parseInt(String(str).replace(/\D/g, ''), 10) || 0
}

// Merge siswa rows with the same name into one entry, summing their tagihan
// and combining their produk labels.
function consolidateSiswa(siswaList, pembayaran) {
  const byNama = {}
  for (const s of siswaList) {
    const key = (s.nama || '').toLowerCase().trim()
    if (!byNama[key]) {
      byNama[key] = {
        ...s,
        _tagihanTotal: parseRupiah(s.tagihan),
        _produkSet: new Set([s.produk].filter(Boolean)),
      }
    } else {
      byNama[key]._tagihanTotal += parseRupiah(s.tagihan)
      if (s.produk) byNama[key]._produkSet.add(s.produk)
    }
  }
  // Resolve merged produk into a single string
  for (const entry of Object.values(byNama)) {
    entry.produk = [...entry._produkSet].join(', ') || entry.produk || '-'
  }

  return Object.values(byNama).map(s => {
    const nama = (s.nama || '').toLowerCase()
    const payments = pembayaran.filter(p => {
      const baseName = (p.pembayar || '').split('(')[0].trim().toLowerCase()
      return baseName === nama
    })
    const sudahBayarRaw = payments
      .filter(p => p.status === 'Lunas')
      .reduce((sum, p) => sum + (Number(p.jumlahRaw) || parseRupiah(p.jumlah)), 0)
    const tagihanRaw = s._tagihanTotal
    const sisaRaw = Math.max(0, tagihanRaw - sudahBayarRaw)
    const hasLunas = payments.some(p => p.status === 'Lunas')
    const status = hasLunas && sisaRaw === 0 ? 'Lunas' : 'Belum Bayar'

    return {
      ...s,
      tagihan: tagihanRaw > 0 ? `Rp ${tagihanRaw.toLocaleString('id-ID')}` : s.tagihan,
      sudahBayar: sudahBayarRaw > 0 ? `Rp ${sudahBayarRaw.toLocaleString('id-ID')}` : null,
      sisa: sisaRaw > 0 ? `Rp ${sisaRaw.toLocaleString('id-ID')}` : null,
      status,
    }
  })
}

const STATUS_OPTIONS = ['Semua', 'Lunas', 'Belum Bayar']

export default function Siswa() {
  const navigate = useNavigate()
  const { siswa: siswaList, refetchSiswa, pembayaran } = useData()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState({ nama: '', tanggal: todayISO(), produk: '', tagihan: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const siswaWithStatus = useMemo(
    () => consolidateSiswa(siswaList, pembayaran),
    [siswaList, pembayaran]
  )

  const filtered = useMemo(() => siswaWithStatus.filter(s => {
    const matchSearch = (s.nama || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'Semua' || s.status === filterStatus
    return matchSearch && matchStatus
  }), [siswaWithStatus, search, filterStatus])

  const lunas = useMemo(() => siswaWithStatus.filter(s => s.status === 'Lunas').length, [siswaWithStatus])
  const belumBayar = useMemo(() => siswaWithStatus.filter(s => s.status === 'Belum Bayar').length, [siswaWithStatus])
  const siapCatat = useMemo(() => {
    const pendingNames = new Set(
      pembayaran.filter(p => p.status === 'Pending').map(p => (p.pembayar || '').split('(')[0].trim().toLowerCase())
    )
    return siswaWithStatus.filter(s => pendingNames.has((s.nama || '').toLowerCase().trim())).length
  }, [siswaWithStatus, pembayaran])

  function validate() {
    const e = {}
  
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi'
    if (!form.produk.trim()) e.produk = 'Produk wajib diisi'
    if (!form.tagihan.trim()) e.tagihan = 'Tagihan wajib diisi'
    return e
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (editItem) {
        const VALID_STATUS = ['Lunas', 'Belum Bayar']
        const safeStatus = VALID_STATUS.includes(editItem.status) ? editItem.status : 'Belum Bayar'
        await api.put(`/siswa/${editItem.id}`, { nama: form.nama, tanggal: form.tanggal, produk: form.produk, tagihan: form.tagihan, status: safeStatus })
      } else {
        await api.post('/siswa', { nama: form.nama, tanggal: form.tanggal, produk: form.produk, tagihan: form.tagihan })
      }
      await refetchSiswa()
      setModalOpen(false)
      setEditItem(null)
      setForm({ nama: '', tanggal: todayISO(), produk: '', tagihan: '' })
      setErrors({})
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Gagal menyimpan' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteItem?.id) return
    try {
      await api.delete(`/siswa/${deleteItem.id}`)
      await refetchSiswa()
    } catch (err) {
      console.error('Delete siswa error:', err.message)
    }
    setDeleteItem(null)
  }

  function openEdit(row) {
    setEditItem(row)
    setForm({ nama: row.nama, tanggal: toInputDate(row.tanggal) || todayISO(), produk: row.produk || '', tagihan: row.tagihan || '' })
    setErrors({})
    setModalOpen(true)
  }

  function openAdd() {
    setEditItem(null)
    setForm({ nama: '', tanggal: todayISO(), produk: '', tagihan: '' })
    setErrors({})
    setModalOpen(true)
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  function handleCatatPembayaran(row) {
    navigate('/dashboard/pembayaran', {
      state: {
        fromSiswa: {
          nama: row.nama,
          produk: row.produk,
          tagihan: (row.tagihan || '').replace(/[^0-9]/g, ''),
        },
      },
    })
  }

  function handleLihatJurnal(row) {
    navigate('/dashboard/jurnal', { state: { filterNama: row.nama } })
  }

  const STAT_CARDS = [
    { label: 'Total Siswa', value: siswaWithStatus.length, desc: 'Terdaftar', icon: Users, iconBg: '#EAF3FF', iconColor: '#1769E0' },
    { label: 'Sudah Bayar', value: lunas, desc: `${siswaWithStatus.length ? Math.round((lunas / siswaWithStatus.length) * 100) : 0}% dari total`, icon: CheckCircle, iconBg: '#DCFCE7', iconColor: '#15803D' },
    { label: 'Belum Bayar', value: belumBayar, desc: `${siswaWithStatus.length ? Math.round((belumBayar / siswaWithStatus.length) * 100) : 0}% dari total`, icon: Clock, iconBg: '#FEF3C7', iconColor: '#B45309' },
    { label: 'Siap Catat', value: siapCatat, desc: 'Perlu dicatat pembayaran', icon: CreditCard, iconBg: '#FEE2E2', iconColor: '#B91C1C' },
  ]

  return (
    <div className="page">
      {/* Heading */}
      <div className="sw__heading">
        <div>
          <h2 className="sw__title">Daftar Siswa</h2>
          <p className="sw__subtitle">
            Kelola data siswa. Klik "Catat Pembayaran" untuk langsung mencatat pembayaran siswa.
          </p>
        </div>
        <button className="sw__add-btn" onClick={openAdd}>
            + Tambah Siswa
          </button>
      </div>

      {/* Stat cards */}
      <div className="sw__stats">
        {STAT_CARDS.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="swstat">
              <div className="swstat__left">
                <p className="swstat__label">{card.label}</p>
                <p className="swstat__value">{card.value}</p>
                <p className="swstat__desc">{card.desc}</p>
              </div>
              <div className="swstat__icon" style={{ background: card.iconBg }}>
                <Icon size={20} color={card.iconColor} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Table card */}
      <div className="sw-card">
        <div className="sw-card__header">
          <div>
            <h3 className="sw-card__title">Data Siswa</h3>
            <p className="sw-card__desc">Klik "Catat Pembayaran" pada baris siswa untuk masuk ke halaman pembayaran.</p>
          </div>
          <div className="sw-card__controls">
            <input
              type="search"
              className="sw-search"
              placeholder="Cari nama siswa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="sw-filter-wrap">
              <select
                className="sw-filter"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="sw-filter-chevron" />
            </div>
          </div>
        </div>

        <div className="sw-table-wrap">
          <table className="sw-table">
            <thead>
              <tr>
                <th className="sw-table__th sw-table__th--no">No</th>
                <th className="sw-table__th">Nama Siswa</th>
                <th className="sw-table__th">Produk / Kursus</th>
                <th className="sw-table__th">Tagihan</th>
                <th className="sw-table__th">Status</th>
                <th className="sw-table__th sw-table__th--action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="sw-table__empty">Tidak ada siswa yang cocok.</td>
                </tr>
              ) : (
                filtered.map((row, i) => {
                  const initials = getInitials(row.nama)
                  const isLunas = row.status === 'Lunas'
                  return (
                    <tr key={i} className="sw-table__row">
                      <td className="sw-table__td sw-table__td--no">{i + 1}</td>
                      <td className="sw-table__td">
                        <div className="sw-table__student">
                          <div className="sw-table__avatar">{initials}</div>
                          <span className="sw-table__student-name">{row.nama}</span>
                        </div>
                      </td>
                      <td className="sw-table__td sw-table__td--muted">{row.produk}</td>
                      <td className="sw-table__td sw-table__td--amount">{row.tagihan}</td>
                      <td className="sw-table__td">
                        <span className={`sw-badge ${isLunas ? 'sw-badge--lunas' : 'sw-badge--belum'}`}>
                          {isLunas ? <CheckCircle size={11} /> : <Clock size={11} />}
                          {row.status}
                        </span>
                      </td>
                      <td className="sw-table__td sw-table__td--action">
                        <div className="sw-action-group">
                          {!isLunas && (
                            <button
                              className="sw-pay-btn"
                              onClick={() => handleCatatPembayaran(row)}
                            >
                              Catat Pembayaran
                              <ChevronRight size={13} />
                            </button>
                          )}
                          <button
                            className="sw-jurnal-btn"
                            onClick={() => handleLihatJurnal(row)}
                          >
                            <BookOpen size={12} />
                            Lihat Jurnal
                          </button>
                          <button
                            className="sw-edit-btn"
                            onClick={() => openEdit(row)}
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            className="sw-delete-btn"
                            onClick={() => setDeleteItem(row)}
                            title="Hapus"
                          >
                            <Trash2 size={12} />
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

        <div className="sw-card__footer">
          <span className="sw-card__count">
            Menampilkan {filtered.length} dari {siswaWithStatus.length} siswa
          </span>
        </div>
      </div>

      {/* Add/Edit student modal */}
      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{editItem ? 'Edit Siswa' : 'Tambah Siswa'}</h3>
              <button className="modal__close" onClick={() => { setModalOpen(false); setEditItem(null) }} aria-label="Tutup">✕</button>
            </div>
            <form className="modal__body" onSubmit={handleSave} noValidate>
              {errors.form && <p className="modal__error">{errors.form}</p>}
              <div className="modal__field">
                <label className="modal__label" htmlFor="siswa-nama">Nama Lengkap</label>
                <input id="siswa-nama" type="text" className={`modal__input${errors.nama ? ' modal__input--error' : ''}`} placeholder="contoh: Muhammad Fatih" value={form.nama} onChange={e => handleChange('nama', e.target.value)} />
                {errors.nama && <span className="modal__error">{errors.nama}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label" htmlFor="siswa-tanggal">Tanggal Daftar</label>
                <input id="siswa-tanggal" type="date" className={`modal__input${errors.tanggal ? ' modal__input--error' : ''}`} value={form.tanggal} onChange={e => handleChange('tanggal', e.target.value)} />
                {errors.tanggal && <span className="modal__error">{errors.tanggal}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label" htmlFor="siswa-produk">Produk/Kursus</label>
                <input id="siswa-produk" type="text" className={`modal__input${errors.produk ? ' modal__input--error' : ''}`} placeholder="contoh: Coding Course" value={form.produk} onChange={e => handleChange('produk', e.target.value)} />
                {errors.produk && <span className="modal__error">{errors.produk}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label" htmlFor="siswa-tagihan">Tagihan</label>
                <input id="siswa-tagihan" type="text" className={`modal__input${errors.tagihan ? ' modal__input--error' : ''}`} placeholder="contoh: Rp 200.000" value={form.tagihan} onChange={e => handleChange('tagihan', e.target.value)} />
                {errors.tagihan && <span className="modal__error">{errors.tagihan}</span>}
              </div>
              <div className="modal__footer">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => { setModalOpen(false); setEditItem(null) }}>Batal</button>
                <button type="submit" className="modal__btn modal__btn--primary" disabled={saving}>{saving ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteItem && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal modal--sm">
            <div className="modal__header">
              <h3 className="modal__title">Hapus Siswa</h3>
            </div>
            <div className="modal__body">
              <p className="pembayaran__confirm-text">
                Hapus siswa <strong>{deleteItem.nama}</strong>? Data tidak bisa dikembalikan.
              </p>
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
