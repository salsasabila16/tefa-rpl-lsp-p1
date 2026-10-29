import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import api from '../../services/api'
import './Produk.css'

const KATEGORI_OPTIONS = ['Coding Course', 'Web', 'Aplikasi', 'Running Task', 'Scoring Board']
const EMPTY_FORM = { nama: '', kategori: 'Coding Course', harga: '', deskripsi: '' }

function formatHarga(val) {
  if (val === '' || val === null || val === undefined) return '-'
  const num = Math.round(Number(val))
  if (!isNaN(num)) return `Rp ${num.toLocaleString('id-ID')}`
  return String(val)
}

function hargaToInput(val) {
  if (val === '' || val === null || val === undefined) return ''
  const num = Math.round(Number(val))
  return isNaN(num) ? '' : String(num)
}

export default function Produk() {
  const { produk: produkList, refetchProduk } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function validate() {
    const e = {}
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi'
    if (!form.harga.trim()) e.harga = 'Harga wajib diisi'
    if (!form.deskripsi.trim()) e.deskripsi = 'Deskripsi wajib diisi'
    return e
  }

  function openAdd() { setEditItem(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  function openEdit(p) { setEditItem(p); setForm({ nama: p.nama, kategori: p.kategori, harga: hargaToInput(p.harga), deskripsi: p.deskripsi }); setErrors({}); setModalOpen(true) }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    // Kirim harga sebagai angka murni — strip semua karakter non-digit sebelum dikirim
    const hargaNum = parseInt(String(form.harga).replace(/\D/g, ''), 10) || 0
    const payload = { ...form, harga: hargaNum }
    setSaving(true)
    try {
      if (editItem) {
        await api.put(`/produk/${editItem.id}`, payload)
      } else {
        await api.post('/produk', payload)
      }
      await refetchProduk()
      setModalOpen(false); setForm(EMPTY_FORM); setErrors({}); setEditItem(null)
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Gagal menyimpan' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/produk/${deleteItem.id}`)
      await refetchProduk()
    } catch (err) {
      console.error('Delete produk error:', err.message)
    }
    setDeleteItem(null)
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  return (
    <div className="page">
      <div className="pk__heading">
        <div>
          <h2 className="pk__title">Produk &amp; Jasa</h2>
          <p className="pk__subtitle">Kelola daftar produk dan jasa yang ditawarkan TEFA RPL.</p>
        </div>
        <button className="pk__add-btn" onClick={openAdd}>
          <Plus size={15} />
          Tambah Produk
        </button>
      </div>

      <div className="pk-grid">
        {produkList.map((p) => (
          <div key={p.id} className="pk-card">
            <div className="pk-card__top">
              <span className="pk-card__kategori">{p.kategori}</span>
              <div className="pk-card__actions">
                <button className="pk-card__action-btn pk-card__action-btn--edit" onClick={() => openEdit(p)} title="Edit"><Pencil size={13} /></button>
                <button className="pk-card__action-btn pk-card__action-btn--delete" onClick={() => setDeleteItem(p)} title="Hapus"><Trash2 size={13} /></button>
              </div>
            </div>
            <h3 className="pk-card__nama">{p.nama}</h3>
            <p className="pk-card__deskripsi">{p.deskripsi}</p>
            <div className="pk-card__footer">
              <span className="pk-card__harga">{formatHarga(p.harga)}</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">{editItem ? 'Edit Produk' : 'Tambah Produk'}</h3>
              <button className="modal__close" onClick={() => setModalOpen(false)} aria-label="Tutup">✕</button>
            </div>
            <form className="modal__body" onSubmit={handleSave} noValidate>
              {errors.form && <p className="modal__error">{errors.form}</p>}
              <div className="modal__field">
                <label className="modal__label" htmlFor="p-nama">Nama Produk/Jasa</label>
                <input id="p-nama" type="text" className={`modal__input${errors.nama ? ' modal__input--error' : ''}`} placeholder="contoh: Jasa Desain Web" value={form.nama} onChange={e => handleChange('nama', e.target.value)} />
                {errors.nama && <span className="modal__error">{errors.nama}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label" htmlFor="p-kategori">Kategori</label>
                <select id="p-kategori" className="modal__select" value={form.kategori} onChange={e => handleChange('kategori', e.target.value)}>
                  {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="modal__field">
                <label className="modal__label" htmlFor="p-harga">Harga</label>
                <input id="p-harga" type="text" className={`modal__input${errors.harga ? ' modal__input--error' : ''}`} placeholder="contoh: Rp 250.000" value={form.harga} onChange={e => handleChange('harga', e.target.value)} />
                {errors.harga && <span className="modal__error">{errors.harga}</span>}
              </div>
              <div className="modal__field">
                <label className="modal__label" htmlFor="p-deskripsi">Deskripsi</label>
                <input id="p-deskripsi" type="text" className={`modal__input${errors.deskripsi ? ' modal__input--error' : ''}`} placeholder="Deskripsi singkat produk" value={form.deskripsi} onChange={e => handleChange('deskripsi', e.target.value)} />
                {errors.deskripsi && <span className="modal__error">{errors.deskripsi}</span>}
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
            <div className="modal__header"><h3 className="modal__title">Hapus Produk</h3></div>
            <div className="modal__body">
              <p className="pembayaran__confirm-text">Hapus produk <strong>{deleteItem.nama}</strong>? Data tidak bisa dikembalikan.</p>
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

