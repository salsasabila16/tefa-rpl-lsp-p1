import { useState, useMemo } from 'react'
import { Pencil, Trash2, Plus, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { matchesMonth, displayDate, todayISO, toInputDate } from '../../utils/date'
import api from '../../services/api'
import './Pengeluaran.css'
import '../../components/dashboard/PaymentModal.css'

const KATEGORI_OPTIONS = ['Operasional', 'Infrastruktur', 'Perlengkapan', 'Lainnya']
const ROWS_PER_PAGE = 10
const EMPTY_FORM = { tanggal: todayISO(), keterangan: '', kategori: 'Operasional', jumlah: '', status: 'Lunas' }

function parseRupiah(str) {
  return parseInt(String(str).replace(/\D/g, ''), 10) || 0
}

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

export default function Pengeluaran() {
  const { pengeluaran: rows, refetchPengeluaran } = useData()
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
        (r.keterangan || '').toLowerCase().includes(q) ||
        (r.kategori || '').toLowerCase().includes(q)
      )
    })
  }, [rows, search, filterBulan])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)
  const total = useMemo(() => rows.reduce((s, r) => s + parseRupiah(r.jumlah), 0), [rows])

  function validate() {
    const e = {}
    if (!form.tanggal) e.tanggal = 'Tanggal wajib diisi'
    if (!form.keterangan.trim()) e.keterangan = 'Keterangan wajib diisi'
    if (!form.jumlah.trim()) e.jumlah = 'Jumlah wajib diisi'
    return e
  }

  function openAdd() { setEditItem(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  function openEdit(row) { setEditItem(row); setForm({ tanggal: toInputDate(row.tanggal), keterangan: row.keterangan, kategori: row.kategori, jumlah: row.jumlah, status: row.status || 'Lunas' }); setErrors({}); setModalOpen(true) }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const jumlahNum = parseRupiah(form.jumlah)
    const entry = { ...form, tanggal: displayDate(form.tanggal), jumlah: `Rp ${jumlahNum.toLocaleString('id-ID')}` }
    setSaving(true)
    try {
      if (editItem) {
        await api.put(`/pengeluaran/${editItem.id}`, entry)
      } else {
        await api.post('/pengeluaran', entry)
      }
      await refetchPengeluaran()
      setModalOpen(false); setEditItem(null); setForm(EMPTY_FORM); setErrors({})
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Gagal menyimpan' })
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await api.delete(`/pengeluaran/${deleteItem.id}`)
      await refetchPengeluaran()
    } catch (err) { console.error('Delete pengeluaran error:', err.message) }
    setDeleteItem(null)
  }
  function handleChange(field, value) { setForm(f => ({ ...f, [field]: value })); setErrors(er => ({ ...er, [field]: undefined })) }

  return (
    <div className="page">
      <div className="pgl__heading">
        <div>
          <h2 className="pgl__title">Pengeluaran</h2>
          <p className="pgl__subtitle">Kelola data pengeluaran TEFA RPL secara realtime.</p>
        </div>
        <div className="pgl__head-right">
          <span className="pgl-live"><span className="pgl-live__dot" />Live</span>
          <button className="pgl__add-btn" onClick={openAdd}><Plus size={15} />Tambah Pengeluaran</button>
        </div>
      </div>

      <div className="pgl__stats">
        <div className="pglstat">
          <div className="pglstat__left">
            <p className="pglstat__label">Total Pengeluaran</p>
            <p className="pglstat__value">{formatRupiah(total)}</p>
            <p className="pglstat__desc">{rows.length} transaksi</p>
          </div>
          <div className="pglstat__icon" style={{ background: '#FEE2E2' }}>
            <TrendingDown size={20} color="#B91C1C" />
          </div>
        </div>
      </div>

      <div className="pgl-card">
        <div className="pgl-card__header">
          <h3 className="pgl-card__title">Daftar Pengeluaran</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="month" className="pgl-search" style={{ width: 'auto' }} value={filterBulan} onChange={e => { setFilterBulan(e.target.value); setPage(1) }} />
            <input type="search" className="pgl-search" placeholder="Cari keterangan, kategori..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
        </div>
        <div className="pgl-table-wrap">
          <table className="pgl-table">
            <thead>
              <tr>
                <th className="pgl-table__th pgl-table__th--no">No</th>
                <th className="pgl-table__th">Tanggal</th>
                <th className="pgl-table__th">Keterangan</th>
                <th className="pgl-table__th">Kategori</th>
                <th className="pgl-table__th">Jumlah</th>
                <th className="pgl-table__th">Status</th>
                <th className="pgl-table__th pgl-table__th--action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="pgl-table__empty">Belum ada data pengeluaran.</td></tr>
              ) : paginated.map((row, i) => (
                <tr key={i} className="pgl-table__row">
                  <td className="pgl-table__td pgl-table__td--no">{(page - 1) * ROWS_PER_PAGE + i + 1}</td>
                  <td className="pgl-table__td pgl-table__td--muted">{displayDate(row.tanggal)}</td>
                  <td className="pgl-table__td">{row.keterangan}</td>
                  <td className="pgl-table__td pgl-table__td--muted">{row.kategori}</td>
                  <td className="pgl-table__td pgl-table__td--amount">{row.jumlah}</td>
                  <td className="pgl-table__td">
                    <span className="pgl-badge pgl-badge--lunas">{row.status || 'Lunas'}</span>
                  </td>
                  <td className="pgl-table__td pgl-table__td--action">
                    <div className="pgl-actions">
                      <button className="pgl-action-btn pgl-action-btn--edit" onClick={() => openEdit(row)}><Pencil size={13} /></button>
                      <button className="pgl-action-btn pgl-action-btn--delete" onClick={() => setDeleteItem(row)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pgl-footer">
          <span className="pgl-footer__count">Menampilkan {paginated.length} dari {filtered.length} data</span>
          <div className="pgl-footer__pages">
            <button className="pgl-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(n => (
              <button key={n} className={`pgl-page-btn${page === n ? ' pgl-page-btn--active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="pgl-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{editItem ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h3>
              <button className="modal__close" onClick={() => setModalOpen(false)} aria-label="Tutup">✕</button>
            </div>
            <form className="modal__body" onSubmit={handleSave} noValidate>
              <div className="modal__field">
                <label className="modal__label" htmlFor="pgl-tanggal">Tanggal</label>
                <input id="pgl-tanggal" type="date" className={`modal__input${errors.tanggal ? ' modal__input--error' : ''}`} value={form.tanggal} onChange={e => handleChange('tanggal', e.target.value)} />
                {errors.tanggal && <span className="modal__error">{errors.tanggal}</span>}
              </div>
              {[
                { id: 'keterangan', label: 'Keterangan', placeholder: 'contoh: Listrik & Internet kantor RPL' },
                { id: 'jumlah', label: 'Jumlah', placeholder: 'contoh: Rp 150.000' },
              ].map(({ id, label, placeholder }) => (
                <div className="modal__field" key={id}>
                  <label className="modal__label" htmlFor={`pgl-${id}`}>{label}</label>
                  <input id={`pgl-${id}`} type="text" className={`modal__input${errors[id] ? ' modal__input--error' : ''}`} placeholder={placeholder} value={form[id]} onChange={e => handleChange(id, e.target.value)} />
                  {errors[id] && <span className="modal__error">{errors[id]}</span>}
                </div>
              ))}
              <div className="modal__field">
                <label className="modal__label" htmlFor="pgl-kategori">Kategori</label>
                <select id="pgl-kategori" className="modal__select" value={form.kategori} onChange={e => handleChange('kategori', e.target.value)}>
                  {KATEGORI_OPTIONS.map(k => <option key={k}>{k}</option>)}
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
            <div className="modal__header"><h3 className="modal__title">Hapus Pengeluaran</h3></div>
            <div className="modal__body">
              <p className="pembayaran__confirm-text">Hapus pengeluaran <strong>{deleteItem.keterangan}</strong>? Data tidak bisa dikembalikan.</p>
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
