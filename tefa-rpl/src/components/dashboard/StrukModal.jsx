import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import api from '../../services/api'
import './StrukModal.css'

const TEFA_NAME = 'Tefa PPLG'
const SCHOOL_NAME = 'SMKN 1 Banjar'
const SEP = '─ '.repeat(17).trim()

function formatRp(val) {
  if (val === null || val === undefined || val === '') return '0'
  const n = Number(val)
  if (!isNaN(n)) return Math.round(n).toLocaleString('id-ID')
  const stripped = parseInt(String(val).replace(/\D/g, ''), 10)
  return isNaN(stripped) ? '0' : stripped.toLocaleString('id-ID')
}

export default function StrukModal({ payment, onClose, canEditKet = true, onKeteranganSaved }) {
  const strukRef = useRef(null)
  const [editKet, setEditKet] = useState(payment.keterangan || '')
  const [editMode, setEditMode] = useState(false)

  async function handleToggleEdit() {
    if (editMode) {
      try {
        await api.put(`/pembayaran/${payment.id}`, { keterangan: editKet })
        onKeteranganSaved?.()
      } catch (e) {
        console.error('Gagal simpan keterangan', e)
      }
    }
    setEditMode(v => !v)
  }

  function parseAmount(val) {
    if (val === null || val === undefined || val === '') return 0
    const n = Number(val)
    if (!isNaN(n)) return Math.round(n)
    return parseInt(String(val).replace(/\D/g, ''), 10) || 0
  }

  const bayar = (payment.bayar != null && payment.bayar !== '') ? parseAmount(payment.bayar) : null
  const total = payment.jumlah ? parseAmount(payment.jumlah) : parseAmount(payment.jumlahRaw)
  const kembali = bayar !== null ? Math.max(0, bayar - total) : 0

  async function handleSavePng() {
    if (!strukRef.current) return
    setEditMode(false)
    await document.fonts.ready
    await new Promise(r => setTimeout(r, 80))
    try {
      const canvas = await html2canvas(strukRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: 360,
        windowWidth: 360,
        onclone: (clonedDoc) => {
          const cssVars = clonedDoc.createElement('style')
          cssVars.textContent = `
            :root {
              --color-primary:#123C72;--color-primary-dark:#0e2d57;
              --color-blue-light:#EFF6FF;--color-bg:#F8FAFC;
              --color-white:#FFFFFF;--color-text:#172B4D;
              --color-muted:#64748B;--color-border:#E2E8F0;
              --color-border-light:#F1F5F9;
              --font-sans:'Inter',system-ui,-apple-system,sans-serif;
              --text-xs:12px;--text-sm:13px;--text-base:15px;
              --text-md:16px;--text-lg:18px;
              --space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;
              --space-5:20px;--space-6:24px;
              --radius-sm:4px;--radius-md:8px;--radius-lg:10px;
            }
          `
          clonedDoc.head.appendChild(cssVars)
          clonedDoc.querySelectorAll('.no-print').forEach(el => {
            el.style.display = 'none'
          })
        },
      })
      const link = document.createElement('a')
      link.download = `struk-${payment.strukNo || 'tefa'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Gagal menyimpan PNG', e)
    }
  }

  return (
    <div className="modal-overlay struk-overlay" role="dialog" aria-modal="true">
      <div className="modal struk-modal">
        <div className="struk-actions no-print">
          {canEditKet && (
            <button className="modal__btn modal__btn--ghost struk-btn-edit" onClick={handleToggleEdit}>
              {editMode ? 'Selesai Edit' : 'Edit Keterangan'}
            </button>
          )}
          <button className="modal__btn modal__btn--primary" onClick={handleSavePng}>Simpan PNG</button>
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Tutup</button>
        </div>

        <div className="struk" ref={strukRef}>
          <div className="struk__header">
            <p className="struk__nama">{TEFA_NAME}</p>
            <p className="struk__sekolah">{SCHOOL_NAME}</p>
          </div>

          <div className="struk__info">
            {[
              ['Customer',   payment.pembayar],
              ['Pembayaran', payment.metode],
              ['Tanggal',    payment.tanggal],
              ['No Struk',   payment.strukNo || '-'],
              ['Kasir',      TEFA_NAME],
            ].map(([key, val]) => (
              <div key={key} className="struk__info-row">
                <span className="struk__info-key">{key}</span>
                <span className="struk__info-val">{val}</span>
              </div>
            ))}
          </div>

          <p className="struk__sep">{SEP}</p>

          <div className="struk__items">
            <p className="struk__item-name">{payment.produk || '-'}</p>
            <div className="struk__item-detail">
              <span>{formatRp(total)} × 1</span>
              <span>{formatRp(total)}</span>
            </div>
          </div>

          <p className="struk__sep">{SEP}</p>

          <div className="struk__totals">
            <div className="struk__total-row">
              <span>TOTAL 1 QTY</span>
              <span>{formatRp(total)}</span>
            </div>
            <div className="struk__total-row">
              <span>Bayar</span>
              <span>{bayar !== null ? formatRp(bayar) : formatRp(total)}</span>
            </div>
            <div className="struk__total-row">
              <span>Kembali</span>
              <span>{formatRp(kembali)}</span>
            </div>
          </div>

          {(editKet || editMode) && (
            <>
              <p className="struk__sep">{SEP}</p>
              <div className="struk__keterangan">
                <p className="struk__ket-label">Keterangan</p>
                {editMode ? (
                  <textarea
                    className="struk__ket-input no-print"
                    value={editKet}
                    onChange={e => setEditKet(e.target.value)}
                    rows={3}
                    placeholder="Tulis keterangan..."
                    autoFocus
                  />
                ) : (
                  <p className="struk__ket-text">{editKet}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
