import { useState, useMemo } from 'react'
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { matchesMonth, displayDate, todayISO, toInputDate } from '../../utils/date'
import api from '../../services/api'
import './Penjualan.css'
import '../../components/dashboard/PaymentModal.css'

const STATUS_OPTIONS = ['Lunas', 'Pending', 'Dibatalkan']
const ROWS_PER_PAGE = 10
const EMPTY_FORM = { tanggal: todayISO(), produk: '', pembeli: '', jumlah: '', status: 'Lunas' }

const STATUS_CLS = {
  Lunas: 'pjl-badge--lunas',
  Pending: 'pjl-badge--pending',
  Dibatalkan: 'pjl-badge--batal',
}

export default function Penjualan() {
  const { penjualan: rows, refetchPenjualan } = useData()
  const [search, setSearch] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
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
      if (!search) return true
      const q = search.toLowerCase()
      return (
        (r.produk || '').toLowerCase().includes(q) ||
        (r.pembeli || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q)
      )
    })
  }, [rows, search, filterBulan])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  function validate() {
    const e = {}
    if (!form.tanggal) e.tanggal = 'Tanggal wajib diisi'
    if (!form.produk.trim()) e.produk = 'Produk wajib diisi'
    if (!form.pembeli.trim()) e.pembeli = 'Pembeli wajib diisi'
    if (!form.jumlah.trim()) e.jumlah = 'Jumlah wajib diisi'
    return e
  }

  function openAdd() {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditItem(row)
    setForm({ tanggal: toInputDate(row.tanggal), produk: row.produk, pembeli: row.pembeli, jumlah: row.jumlah, status: row.status })
    setErrors({})
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const entry = { ...form, tanggal: displayDate(form.tanggal) }
    setSaving(true)
    try {
      if (editItem) {
        await api.put(`/penjualan/${editItem.id}`, entry)
      } else {
        const maxNum = rows.reduce((max, row) => {
          const num = parseInt((row.kode_id || '').replace('PJL-', ''), 10)
          return Number.isFinite(num) && num > max ? num : max
        }, 0)
        const newId = `PJL-${String(maxNum + 1).padStart(3, '0')}`
        await api.post('/penjualan', { kode_id: newId, ...entry })
      }
      await refetchPenjualan()
      setModalOpen(false); setEditItem(null); setForm(EMPTY_FORM); setErrors({})
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Gagal menyimpan' })
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await api.delete(`/penjualan/${deleteItem.id}`)
      await refetchPenjualan()
    } catch (err) { console.error('Delete penjualan error:', err.message) }
    setDeleteItem(null)
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  return (
    <div className="page">
      <div className="pjl__heading">
        <div>
          <h2 className="pjl__title">Daftar Penjualan</h2>
          <p className="pjl__subtitle">Kelola data penjualan produk dan jasa TEFA RPL.</p>
        </div>
        <button className="pjl__add-btn" onClick={openAdd}>
          <Plus size={15} />
          Tambah Penjualan
        </button>
      </div>

      <div className="pjl-card">
        <div className="pjl-card__header">
          <h3 className="pjl-card__title">Transaksi Penjualan</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="month"
              className="ord-search"
              style={{ width: 'auto' }}
              value={filterBulan}
              onChange={e => { setFilterBulan(e.target.value); setPage(1) }}
            />
            <input
              type="search"
              className="pjl-search"
              placeholder="Cari produk, pembeli, status..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        <div className="pjl-table-wrap">
          <table className="pjl-table">
            <thead>
              <tr>
                <th className="pjl-table__th pjl-table__th--no">No</th>
                <th className="pjl-table__th">ID</th>
                <th className="pjl-table__th">Tanggal</th>
                <th className="pjl-table__th">Produk/Jasa</th>
                <th className="pjl-table__th">Pembeli</th>
                <th className="pjl-table__th">Jumlah</th>
                <th className="pjl-table__th">Status</th>
                <th className="pjl-table__th pjl-table__th--action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="pjl-table__empty">Belum ada data penjualan.</td></tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={i} className="pjl-table__row">
                    <td className="pjl-table__td pjl-table__td--no">{(page - 1) * ROWS_PER_PAGE + i + 1}</td>
                    <td className="pjl-table__td"><span className="pjl-id">{row.id || '—'}</span></td>
                    <td className="pjl-table__td pjl-table__td--muted">{displayDate(row.tanggal)}</td>
                    <td className="pjl-table__td">{row.produk}</td>
                    <td className="pjl-table__td pjl-table__td--muted">{row.pembeli}</td>
                    <td className="pjl-table__td pjl-table__td--amount">{row.jumlah}</td>
                    <td className="pjl-table__td">
                      <span className={`pjl-badge ${STATUS_CLS[row.status] ?? 'pjl-badge--pending'}`}>{row.status}</span>
                    </td>
                    <td className="pjl-table__td pjl-table__td--action">
                      <div className="pjl-actions">
                        <button className="pjl-action-btn pjl-action-btn--edit" onClick={() => openEdit(row)} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button className="pjl-action-btn pjl-action-btn--delete" onClick={() => setDeleteItem(row)} title="Hapus">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pjl-footer">
          <span className="pjl-footer__count">Menampilkan {paginated.length} dari {filtered.length} data</span>
          <div className="pjl-footer__pages">
            <button className="pjl-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Sebelumnya"><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(n => (
              <button key={n} className={`pjl-page-btn${page === n ? ' pjl-page-btn--active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="pjl-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Berikutnya"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{editItem ? 'Edit Penjualan' : 'Tambah Penjualan'}</h3>
              <button className="modal__close" onClick={() => setModalOpen(false)} aria-label="Tutup">✕</button>
            </div>
            <form className="modal__body" onSubmit={handleSave} noValidate>
              <div className="modal__field">
                <label className="modal__label" htmlFor="pjl-tanggal">Tanggal</label>
                <input id="pjl-tanggal" type="date" className={`modal__input${errors.tanggal ? ' modal__input--error' : ''}`} value={form.tanggal} onChange={e => handleChange('tanggal', e.target.value)} />
                {errors.tanggal && <span className="modal__error">{errors.tanggal}</span>}
              </div>
              {[
                { id: 'produk', label: 'Produk/Jasa', placeholder: 'contoh: Jasa Desain Web' },
                { id: 'pembeli', label: 'Pembeli', placeholder: 'contoh: PT Maju Jaya' },
                { id: 'jumlah', label: 'Jumlah', placeholder: 'contoh: Rp 250.000' },
              ].map(({ id, label, placeholder }) => (
                <div className="modal__field" key={id}>
                  <label className="modal__label" htmlFor={`pjl-${id}`}>{label}</label>
                  <input id={`pjl-${id}`} type="text" className={`modal__input${errors[id] ? ' modal__input--error' : ''}`} placeholder={placeholder} value={form[id]} onChange={e => handleChange(id, e.target.value)} />
                  {errors[id] && <span className="modal__error">{errors[id]}</span>}
                </div>
              ))}
              <div className="modal__field">
                <label className="modal__label" htmlFor="pjl-status">Status</label>
                <select id="pjl-status" className="modal__select" value={form.status} onChange={e => handleChange('status', e.target.value)}>
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
            <div className="modal__header">
              <h3 className="modal__title">Hapus Penjualan</h3>
            </div>
            <div className="modal__body">
              <p className="pembayaran__confirm-text">Hapus penjualan <strong>{deleteItem.produk}</strong> ke <strong>{deleteItem.pembeli}</strong>? Data tidak bisa dikembalikan.</p>
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

