import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { buildWAMessage, getWALink } from '../../services/paymentService'
import './PaymentModal.css'

const METODE_OPTIONS = ['Transfer Bank', 'QRIS', 'Tunai']

const today = () => new Date().toISOString().slice(0, 10)

function nextStrukNo() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `SR${ts}${rand}`
}

export default function PaymentModal({ onClose, onSave, bendaharaPhone, initialData = {}, onDone }) {
  const [step, setStep] = useState('form')
  const [saved, setSaved] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    pembayar: initialData.pembayar || '',
    produk: initialData.produk || '',
    metode: 'Transfer Bank',
    jumlah: initialData.jumlah || '',
    bayar: '',
    tanggal: today(),
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.pembayar.trim()) e.pembayar = 'Nama pembayar wajib diisi'
    if (!form.produk.trim()) e.produk = 'Produk/kursus wajib diisi'
    if (!form.jumlah.trim()) e.jumlah = 'Jumlah wajib diisi'
    if (!form.tanggal) e.tanggal = 'Tanggal wajib diisi'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setSaving(true)
    try {
      // Gunakan strukNo dari initialData jika ada (dari Pendapatan), generate baru jika tidak ada
      const strukNo = initialData.strukNo || nextStrukNo()
      const payment = await onSave({ ...form, strukNo })
      if (payment) {
        setSaved(payment)
        setStep('done')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  function handleSendWA() {
    const msg = buildWAMessage(saved)
    const url = getWALink(bendaharaPhone, msg)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title" id="modal-title">
            {step === 'form' ? 'Catat Pembayaran' : 'Pembayaran Tersimpan'}
          </h3>
          <button className="modal__close" onClick={onClose} aria-label="Tutup modal">
            <X size={16} />
          </button>
        </div>

        {step === 'form' ? (
          <form className="modal__body" onSubmit={handleSubmit} noValidate>
            <div className="modal__field">
              <label className="modal__label" htmlFor="pm-pembayar">Nama Pembayar</label>
              <input
                id="pm-pembayar"
                type="text"
                className={`modal__input${errors.pembayar ? ' modal__input--error' : ''}`}
                value={form.pembayar}
                onChange={e => handleChange('pembayar', e.target.value)}
                placeholder="contoh: Ahmad Fauzi (Ayah Kinara)"
              />
              {errors.pembayar && <span className="modal__error">{errors.pembayar}</span>}
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="pm-produk">Produk / Kursus</label>
              <input
                id="pm-produk"
                type="text"
                className={`modal__input${errors.produk ? ' modal__input--error' : ''}`}
                value={form.produk}
                onChange={e => handleChange('produk', e.target.value)}
                placeholder="contoh: Coding Course"
              />
              {errors.produk && <span className="modal__error">{errors.produk}</span>}
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="pm-metode">Metode Pembayaran</label>
              <select
                id="pm-metode"
                className="modal__select"
                value={form.metode}
                onChange={e => handleChange('metode', e.target.value)}
              >
                {METODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="pm-jumlah">Jumlah (Rp)</label>
              <input
                id="pm-jumlah"
                type="text"
                className={`modal__input${errors.jumlah ? ' modal__input--error' : ''}`}
                value={form.jumlah}
                onChange={e => handleChange('jumlah', e.target.value)}
                placeholder="contoh: 200.000"
              />
              {errors.jumlah && <span className="modal__error">{errors.jumlah}</span>}
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="pm-bayar">Uang Bayar (Rp) <span style={{fontWeight:400,color:'var(--color-muted)'}}>— opsional</span></label>
              <input
                id="pm-bayar"
                type="text"
                className="modal__input"
                value={form.bayar}
                onChange={e => handleChange('bayar', e.target.value)}
                placeholder="Kosongkan jika sama dengan jumlah"
              />
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="pm-tanggal">Tanggal</label>
              <input
                id="pm-tanggal"
                type="date"
                className={`modal__input${errors.tanggal ? ' modal__input--error' : ''}`}
                value={form.tanggal}
                onChange={e => handleChange('tanggal', e.target.value)}
              />
              {errors.tanggal && <span className="modal__error">{errors.tanggal}</span>}
            </div>

            <div className="modal__footer">
              <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose}>Batal</button>
              <button type="submit" className="modal__btn modal__btn--primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        ) : (
          <div className="modal__body modal__body--done">
            <div className="modal__done-info">
              <div className="modal__done-row"><span>No Struk</span><strong>{saved.strukNo}</strong></div>
              <div className="modal__done-row"><span>Pembayar</span><strong>{saved.pembayar}</strong></div>
              <div className="modal__done-row"><span>Produk</span><strong>{saved.produk}</strong></div>
              <div className="modal__done-row"><span>Metode</span><strong>{saved.metode}</strong></div>
              <div className="modal__done-row"><span>Jumlah</span><strong>{saved.jumlah}</strong></div>
              <div className="modal__done-row"><span>Tanggal</span><strong>{saved.tanggal}</strong></div>
            </div>

            {(saved.metode === 'Transfer Bank' || saved.metode === 'QRIS') && (
              <div className="modal__wa-wrap">
                <p className="modal__wa-hint">
                  Pembayaran via {saved.metode} memerlukan verifikasi oleh Bendahara.
                  Kirim notifikasi WhatsApp agar segera dikonfirmasi.
                </p>
                <button className="modal__btn-wa" onClick={handleSendWA}>
                  <MessageCircle size={16} aria-hidden="true" />
                  Kirim Notifikasi ke Bendahara
                </button>
              </div>
            )}

            <div className="modal__footer">
              <button type="button" className="modal__btn modal__btn--primary" onClick={onDone ?? onClose}>
                {onDone ? 'Lihat Jurnal' : 'Selesai'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
