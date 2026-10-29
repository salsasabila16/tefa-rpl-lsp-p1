import { useState, useMemo } from 'react'
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { matchesMonth, displayDate, todayISO, toInputDate } from '../../utils/date'
import api from '../../services/api'
import './Order.css'
import '../../components/dashboard/PaymentModal.css'

const STATUS_OPTIONS = ['Proses', 'Selesai', 'Dibatalkan']
const ROWS_PER_PAGE = 10
const EMPTY_FORM = { tanggal: todayISO(), produk: '', pembeli: '', total: '', status: 'Proses' }

const STATUS_CLS = {
  Selesai: 'ord-badge--selesai',
  Proses: 'ord-badge--proses',
  Dibatalkan: 'ord-badge--batal',
}

export default function Order() {
  const { order: rows, refetchOrder } = useData()
  const [search, setSearch] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false) // eslint-disable-line no-unused-vars

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
    if (!form.total.trim()) e.total = 'Total wajib diisi'
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
    setForm({ tanggal: toInputDate(row.tanggal), produk: row.produk, pembeli: row.pembeli, total: row.total, status: row.status })
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
        await api.put(`/order/${editItem.id}`, entry)
      } else {
        await api.post('/order', entry)
      }
      await refetchOrder()
      setModalOpen(false); setEditItem(null); setForm(EMPTY_FORM); setErrors({})
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Gagal menyimpan' })
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await api.delete(`/order/${deleteItem.id}`)
      await refetchOrder()
    } catch (err) { console.error('Delete order error:', err.message) }
    setDeleteItem(null)
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  return (
    <div className="page">
      <div className="ord__heading">
        <div>
          <h2 className="ord__title">Daftar Order</h2>
          <p className="ord__subtitle">Kelola data order dari pelanggan TEFA RPL.</p>
        </div>
        <button className="ord__add-btn" onClick={openAdd}>
          <Plus size={15} />
          Tambah Order
        </button>
      </div>

      <div className="ord-card">
        <div className="ord-card__header">
          <h3 className="ord-card__title">Data Order</h3>
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
              className="ord-search"
              placeholder="Cari produk, pembeli, status..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        <div className="ord-table-wrap">
          <table className="ord-table">
            <thead>
              <tr>
                <th className="ord-table__th ord-table__th--no">No</th>
                <th className="ord-table__th">Tanggal</th>
                <th className="ord-table__th">Produk/Jasa</th>
                <th className="ord-table__th">Pembeli</th>
                <th className="ord-table__th">Total</th>
                <th className="ord-table__th">Status</th>
                <th className="ord-table__th ord-table__th--action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="ord-table__empty">Belum ada data order.</td></tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={i} className="ord-table__row">
                    <td className="ord-table__td ord-table__td--no">{(page - 1) * ROWS_PER_PAGE + i + 1}</td>
                    <td className="ord-table__td ord-table__td--muted">{displayDate(row.tanggal)}</td>
                    <td className="ord-table__td">{row.produk}</td>
                    <td className="ord-table__td ord-table__td--muted">{row.pembeli}</td>
                    <td className="ord-table__td ord-table__td--amount">{row.total}</td>
                    <td className="ord-table__td">
                      <span className={`ord-badge ${STATUS_CLS[row.status] ?? 'ord-badge--proses'}`}>{row.status}</span>
                    </td>
                    <td className="ord-table__td ord-table__td--action">
                      <div className="ord-actions">
                        <button className="ord-action-btn ord-action-btn--edit" onClick={() => openEdit(row)} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button className="ord-action-btn ord-action-btn--delete" onClick={() => setDeleteItem(row)} title="Hapus">
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

        <div className="ord-footer">
          <span className="ord-footer__count">Menampilkan {paginated.length} dari {filtered.length} data</span>
          <div className="ord-footer__pages">
            <button className="ord-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Sebelumnya"><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(n => (
              <button key={n} className={`ord-page-btn${page === n ? ' ord-page-btn--active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="ord-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Berikutnya"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{editItem ? 'Edit Order' : 'Tambah Order'}</h3>
              <button className="modal__close" onClick={() => setModalOpen(false)} aria-label="Tutup">✕</button>
            </div>
            <form className="modal__body" onSubmit={handleSave} noValidate>
              <div className="modal__field">
                <label className="modal__label" htmlFor="ord-tanggal">Tanggal</label>
                <input id="ord-tanggal" type="date" className={`modal__input${errors.tanggal ? ' modal__input--error' : ''}`} value={form.tanggal} onChange={e => handleChange('tanggal', e.target.value)} />
                {errors.tanggal && <span className="modal__error">{errors.tanggal}</span>}
              </div>
              {[
                { id: 'produk', label: 'Produk/Jasa', placeholder: 'contoh: Jasa Desain Web' },
                { id: 'pembeli', label: 'Pembeli', placeholder: 'contoh: PT Maju Jaya' },
                { id: 'total', label: 'Total', placeholder: 'contoh: Rp 250.000' },
              ].map(({ id, label, placeholder }) => (
                <div className="modal__field" key={id}>
                  <label className="modal__label" htmlFor={`ord-${id}`}>{label}</label>
                  <input id={`ord-${id}`} type="text" className={`modal__input${errors[id] ? ' modal__input--error' : ''}`} placeholder={placeholder} value={form[id]} onChange={e => handleChange(id, e.target.value)} />
                  {errors[id] && <span className="modal__error">{errors[id]}</span>}
                </div>
              ))}
              <div className="modal__field">
                <label className="modal__label" htmlFor="ord-status">Status</label>
                <select id="ord-status" className="modal__select" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="modal__footer">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="modal__btn modal__btn--primary">{editItem ? 'Simpan Perubahan' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal modal--sm">
            <div className="modal__header">
              <h3 className="modal__title">Hapus Order</h3>
            </div>
            <div className="modal__body">
              <p className="pembayaran__confirm-text">Hapus order <strong>{deleteItem.produk}</strong> dari <strong>{deleteItem.pembeli}</strong>? Data tidak bisa dikembalikan.</p>
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

