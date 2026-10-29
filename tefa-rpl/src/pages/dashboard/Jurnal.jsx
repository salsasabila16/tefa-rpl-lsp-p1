import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import html2canvas from 'html2canvas'
import {
  CheckCircle, Clock, Users, TrendingUp,
  AlertTriangle, ChevronLeft, ChevronRight,
  ArrowLeft, Download, Receipt,
} from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { matchesMonth } from '../../utils/date'
import StrukModal from '../../components/dashboard/StrukModal'
import './Jurnal.css'

const ROWS_PER_PAGE = 10

const STATUS_CONFIG = {
  Lunas: { cls: 'jbadge--lunas', icon: CheckCircle },
  'Pending Verifikasi': { cls: 'jbadge--verif', icon: Clock },
  Pending: { cls: 'jbadge--pending', icon: Clock },
  Ditolak: { cls: 'jbadge--ditolak', icon: AlertTriangle },
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function parsePembayar(str = '') {
  const match = str.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/)
  return { parent: match?.[1]?.trim() ?? str, student: match?.[2] ?? '' }
}

function deriveStatus(payments) {
  if (payments.every(p => p.status === 'Lunas')) return 'Lunas'
  if (payments.some(p => p.status === 'Pending Verifikasi')) return 'Pending Verifikasi'
  if (payments.some(p => p.status === 'Ditolak')) return 'Ditolak'
  return 'Pending'
}

function buildJurnal(payments) {
  const map = {}
  for (const p of payments) {
    const raw = p.pembayar || '-'
    const key = raw.trim().toLowerCase()
    if (!map[key]) map[key] = { pembayar: raw.trim(), items: [] }
    map[key].items.push(p)
  }

  return Object.values(map).map((entry, idx) => {
    const { pembayar, items } = entry
    const { parent, student } = parsePembayar(pembayar)
    const sudahBayar = items.filter(p => p.status === 'Lunas').length
    const belumBayar = items.filter(p => p.status !== 'Lunas').length
    const totalRaw = items.reduce((sum, p) =>
      sum + (p.jumlahRaw != null ? Number(p.jumlahRaw) : parseInt(String(p.jumlah || '0').replace(/\D/g, ''), 10) || 0), 0)
    const sudahBayarRaw = items
      .filter(p => p.status === 'Lunas')
      .reduce((sum, p) =>
        sum + (p.jumlahRaw != null ? Number(p.jumlahRaw) : parseInt(String(p.jumlah || '0').replace(/\D/g, ''), 10) || 0), 0)
    const lastMetode = items.slice().sort((a, b) =>
      new Date(b.tanggal) - new Date(a.tanggal))[0]?.metode ?? '-'

    return {
      no: idx + 1,
      pembayar,
      displayName: parent,
      student,
      nis: '',
      totalTagihan: `Rp ${totalRaw.toLocaleString('id-ID')}`,
      totalRaw,
      sudahBayarRaw,
      sudahBayar,
      belumBayar,
      jumlahTransaksi: items.length,
      status: deriveStatus(items),
      lastMetode,
      produkList: items
        .filter(i => i.produk)
        .map(i => ({ produk: i.produk, jumlah: i.jumlah, status: i.status })),
      items,
    }
  })
}

// ── Detail View ───────────────────────────────────────────────────────────────

function JurnalDetail({ row, onBack }) {
  const rekapRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [strukRow, setStrukRow] = useState(null)
  const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['Pending']
  const StatusIcon = statusCfg.icon
  const initials = getInitials(row.displayName)
  const sisaRaw = row.totalRaw - row.sudahBayarRaw
  const sisaTagihan = `Rp ${Math.max(0, sisaRaw).toLocaleString('id-ID')}`
  const sudahBayarFmt = `Rp ${row.sudahBayarRaw.toLocaleString('id-ID')}`

  async function handleDownloadPng() {
    if (!rekapRef.current) return
    setDownloading(true)
    // Wait for fonts to be fully loaded before capture
    await document.fonts.ready
    await new Promise(r => setTimeout(r, 80))
    try {
      const canvas = await html2canvas(rekapRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        // Fix capture width so layout doesn't depend on screen size
        width: 1100,
        windowWidth: 1100,
        onclone: (clonedDoc, el) => {
          // Inject CSS variables as a hardcoded <style> tag.
          // Iterating getComputedStyle() to copy --vars is unreliable on
          // Windows Chrome — it silently returns zero custom properties,
          // so every var() resolves to empty and all styling disappears.
          const cssVars = clonedDoc.createElement('style')
          cssVars.textContent = `
            :root {
              --color-primary:#123C72;--color-primary-dark:#0e2d57;
              --color-primary-light:#2563EB;--color-navy:#123C72;
              --color-navy-muted:#1e4d8c;--color-blue-mid:#2563EB;
              --color-blue-light:#EFF6FF;--color-bg:#F8FAFC;
              --color-white:#FFFFFF;--color-text:#172B4D;
              --color-muted:#64748B;--color-border:#E2E8F0;
              --color-border-light:#F1F5F9;--color-surface:#F0F4F9;
              --color-success:#16A34A;--color-warning:#D97706;
              --color-accent:#3E4096;--color-accent-light:#EDEDF7;
              --font-sans:'Inter',system-ui,-apple-system,sans-serif;
              --font-display:'Inter',system-ui,-apple-system,sans-serif;
              --text-xs:12px;--text-sm:13px;--text-base:15px;
              --text-md:16px;--text-lg:18px;--text-xl:22px;
              --text-2xl:28px;--text-3xl:36px;
              --space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;
              --space-5:20px;--space-6:24px;--space-8:32px;--space-10:40px;
              --space-12:48px;
              --radius-sm:4px;--radius-md:8px;--radius-lg:10px;--radius-xl:14px;
              --shadow-sm:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.03);
              --shadow-md:0 4px 16px rgba(0,0,0,0.07),0 1px 4px rgba(0,0,0,0.04);
              --transition-fast:120ms ease;--transition-base:200ms ease;
            }
          `
          clonedDoc.head.appendChild(cssVars)

          // Fix capture container dimensions
          el.style.width = '1100px'
          el.style.maxWidth = '1100px'
          el.style.overflow = 'visible'
          el.style.boxSizing = 'border-box'

          // position:sticky is not handled by html2canvas — collapses sidebar
          const sidebar = el.querySelector('.jdetail__sidebar')
          if (sidebar) sidebar.style.position = 'static'

          // overflow-x:auto clips table content in html2canvas
          el.querySelectorAll('.jtable-wrap').forEach(tw => {
            tw.style.overflow = 'visible'
          })

          // Hide action buttons from the exported image
          el.querySelectorAll('.jdetail-dl-btn, .jdetail-struk-btn, .jdetail__back--sidebar').forEach(b => {
            b.style.display = 'none'
          })
        },
      })
      const link = document.createElement('a')
      link.download = `Rekap_${row.displayName.replace(/\s+/g, '_')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Gagal menyimpan PNG', e)
    } finally {
      setDownloading(false)
    }
  }

  const summaryCards = [
    { label: 'Total Tagihan', value: row.totalTagihan, sub: null, color: '#1769E0', bg: '#EAF3FF' },
    { label: 'Sudah Bayar', value: sudahBayarFmt, sub: `${row.sudahBayar} kali transaksi`, color: '#15803D', bg: '#DCFCE7' },
    { label: 'Belum Bayar', value: sisaTagihan, sub: `${row.belumBayar} kali transaksi`, color: '#B45309', bg: '#FEF3C7' },
    { label: 'Jumlah Transaksi', value: `${row.jumlahTransaksi} kali`, sub: null, color: '#1769E0', bg: '#EAF3FF' },
  ]

  return (
    <>
    <div className="jdetail">
      {/* Back button */}
      <button className="jdetail__back" onClick={onBack}>
        <ArrowLeft size={15} />
        Kembali ke Daftar Jurnal
      </button>

      {/* Rekap area yang di-capture jadi PNG */}
      <div ref={rekapRef} style={{ background: '#fff' }}>
      <div className="jdetail__layout">
        {/* ── Left column ─────────────────────────────────── */}
        <div className="jdetail__main">

          {/* Student card */}
          <div className="jdetail-card">
            <div className="jdetail-student">
              <div className="jdetail-avatar">{initials}</div>
              <div className="jdetail-student__info">
                <h3 className="jdetail-student__name">{row.displayName}</h3>
                {row.student && (
                  <p className="jdetail-student__parent">{row.student}</p>
                )}
                <div className="jdetail-student__meta">
                  <span>{row.nis}</span>
                  <span className="jdetail-student__dot">·</span>
                  <span className="jdetail-student__dot">·</span>
                  <span>Metode terakhir: {row.lastMetode}</span>
                </div>
              </div>
            </div>

            {/* Mini stat cards */}
            <div className="jdetail-minicards">
              {summaryCards.map(c => (
                <div key={c.label} className="jdetail-minicard" style={{ borderTopColor: c.color }}>
                  <p className="jdetail-minicard__label">{c.label}</p>
                  <p className="jdetail-minicard__value" style={{ color: c.color }}>{c.value}</p>
                  {c.sub && <p className="jdetail-minicard__sub">{c.sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Produk / Jasa Dipesan */}
          {row.produkList.length > 0 && (
            <div className="jdetail-card">
              <div className="jdetail-section-header">
                <div>
                  <h4 className="jdetail-section-title">Produk / Jasa Dipesan</h4>
                  <p className="jdetail-section-desc">Daftar produk atau jasa yang dipesan oleh siswa ini.</p>
                </div>
              </div>
              <div className="jtable-wrap">
                <table className="jtable">
                  <thead>
                    <tr>
                      <th className="jtable__th jtable__th--no">No</th>
                      <th className="jtable__th">Produk / Jasa</th>
                      <th className="jtable__th">Jumlah</th>
                      <th className="jtable__th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {row.produkList.map((p, i) => {
                      const sc = STATUS_CONFIG[p.status] ?? STATUS_CONFIG['Pending']
                      const SI = sc.icon
                      return (
                        <tr key={i} className="jtable__row">
                          <td className="jtable__td jtable__td--no">{i + 1}</td>
                          <td className="jtable__td">{p.produk}</td>
                          <td className="jtable__td jtable__td--amount">{p.jumlah}</td>
                          <td className="jtable__td">
                            <span className={`jbadge ${sc.cls}`}>
                              <SI size={11} />
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment history */}
          <div className="jdetail-card">
            <div className="jdetail-section-header">
              <div>
                <h4 className="jdetail-section-title">Riwayat Pembayaran</h4>
                <p className="jdetail-section-desc">Semua transaksi yang telah tercatat untuk siswa ini.</p>
              </div>
              <button className="jdetail-dl-btn" onClick={handleDownloadPng} disabled={downloading}>
                <Download size={13} />
                {downloading ? 'Menyimpan...' : 'Download PNG'}
              </button>
            </div>
            <div className="jtable-wrap">
              <table className="jtable">
                <thead>
                  <tr>
                    <th className="jtable__th jtable__th--no">No</th>
                    <th className="jtable__th">Tanggal</th>
                    <th className="jtable__th">Produk / Jasa</th>
                    <th className="jtable__th">Metode</th>
                    <th className="jtable__th">Jumlah</th>
                    <th className="jtable__th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {row.items.map((item, i) => {
                    const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG['Pending']
                    const SI = sc.icon
                    return (
                      <tr key={i} className="jtable__row">
                        <td className="jtable__td jtable__td--no">{i + 1}</td>
                        <td className="jtable__td">{item.tanggal}</td>
                        <td className="jtable__td jtable__td--muted">{item.produk || '—'}</td>
                        <td className="jtable__td jtable__td--muted">{item.metode}</td>
                        <td className="jtable__td jtable__td--amount">{item.jumlah}</td>
                        <td className="jtable__td">
                          <span className={`jbadge ${sc.cls}`}>
                            <SI size={11} />
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing breakdown */}
          <div className="jdetail-card">
            <div className="jdetail-section-header">
              <div>
                <h4 className="jdetail-section-title">Rincian Tagihan</h4>
                <p className="jdetail-section-desc">Rekap tagihan dan sisa pembayaran.</p>
              </div>
            </div>
            <div className="jtable-wrap">
              <table className="jtable">
                <thead>
                  <tr>
                    <th className="jtable__th">Keterangan</th>
                    <th className="jtable__th">Jumlah</th>
                    <th className="jtable__th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="jtable__row">
                    <td className="jtable__td">Total Tagihan</td>
                    <td className="jtable__td jtable__td--amount">{row.totalTagihan}</td>
                    <td className="jtable__td jtable__td--muted">—</td>
                  </tr>
                  <tr className="jtable__row">
                    <td className="jtable__td">Jumlah Pembayaran</td>
                    <td className="jtable__td jtable__td--amount">{row.jumlahTransaksi} kali</td>
                    <td className="jtable__td jtable__td--muted">—</td>
                  </tr>
                  <tr className="jtable__row">
                    <td className="jtable__td">Sudah Dibayar</td>
                    <td className="jtable__td jtable__td--amount">{sudahBayarFmt}</td>
                    <td className="jtable__td">
                      <span className="jbadge jbadge--lunas">
                        <CheckCircle size={11} />
                        Lunas
                      </span>
                    </td>
                  </tr>
                  <tr className="jtable__row">
                    <td className="jtable__td" style={{ fontWeight: 600 }}>Sisa Tagihan</td>
                    <td className="jtable__td jtable__td--amount" style={{ fontWeight: 700 }}>{sisaTagihan}</td>
                    <td className="jtable__td jtable__td--muted">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── Right sidebar ────────────────────────────────── */}
        <aside className="jdetail__sidebar">

          {/* Ringkasan */}
          <div className="jdetail-card">
            <h4 className="jdetail-section-title" style={{ marginBottom: 16 }}>Ringkasan Jurnal</h4>
            <div className="jdetail-summary-list">
              {[
                { label: 'Total Tagihan', value: row.totalTagihan },
                { label: 'Sudah Bayar', value: sudahBayarFmt, sub: `${row.sudahBayar} kali transaksi` },
                { label: 'Belum Bayar', value: sisaTagihan, sub: `${row.belumBayar} kali transaksi` },
                { label: 'Jumlah Transaksi', value: `${row.jumlahTransaksi} kali` },
              ].map(item => (
                <div key={item.label} className="jdetail-summary-row">
                  <p className="jdetail-summary-label">{item.label}</p>
                  <p className="jdetail-summary-value">{item.value}</p>
                  {item.sub && <p className="jdetail-summary-sub">{item.sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="jdetail-card">
            <h4 className="jdetail-section-title" style={{ marginBottom: 16 }}>Status Pembayaran</h4>
            <div className={`jdetail-status-badge jdetail-status-badge--${row.status === 'Lunas' ? 'lunas' : row.status === 'Ditolak' ? 'ditolak' : 'pending'}`}>
              <StatusIcon size={22} />
              <span className="jdetail-status-badge__label">{row.status}</span>
              <span className="jdetail-status-badge__desc">
                {row.status === 'Lunas'
                  ? 'Semua tagihan telah dibayar'
                  : row.status === 'Ditolak'
                  ? 'Pembayaran ditolak, harap ulangi'
                  : 'Menunggu konfirmasi pembayaran'}
              </span>
            </div>
          </div>

          {row.status === 'Lunas' && (
            <button className="jdetail-struk-btn" onClick={() => {
              const lunas = row.items.find(i => i.status === 'Lunas') ?? row.items[0]
              setStrukRow(lunas)
            }}>
              <Receipt size={14} />
              Lihat Struk
            </button>
          )}

          <button className="jdetail__back jdetail__back--sidebar" onClick={onBack}>
            <ArrowLeft size={14} />
            Kembali ke Daftar Jurnal
          </button>
        </aside>
      </div>
      </div> {/* end rekapRef */}
    </div>

    {strukRow && (
      <StrukModal payment={strukRow} onClose={() => setStrukRow(null)} canEditKet={false} />
    )}
  </>
  )
}

// ── List View ─────────────────────────────────────────────────────────────────

export default function Jurnal() {
  const { pembayaran } = useData()
  const location = useLocation()
  const navigate = useNavigate()
  const didApplyFilter = useRef(false)
  const [search, setSearch] = useState(() => location.state?.filterNama ?? '')
  const [filterBulan, setFilterBulan] = useState('')
  const [page, setPage] = useState(1)
  const [detailRow, setDetailRow] = useState(null)

  const rekap = useMemo(() => buildJurnal(pembayaran), [pembayaran])

  // Clear location state after reading
  useEffect(() => {
    if (!location.state?.filterNama || didApplyFilter.current) return
    didApplyFilter.current = true
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  // Auto-open detail once if exactly 1 match — guarded by ref so closing detail
  // doesn't re-trigger it.
  const didAutoOpen = useRef(false)
  useEffect(() => {
    if (didAutoOpen.current || !search || !rekap.length) return
    const q = search.toLowerCase()
    const matches = rekap.filter(r => r.displayName.toLowerCase().includes(q))
    if (matches.length === 1) {
      didAutoOpen.current = true
      setDetailRow(matches[0])
    }
  }, [rekap, search])

  if (detailRow) {
    return <JurnalDetail row={detailRow} onBack={() => setDetailRow(null)} />
  }

  const filtered = rekap.filter(r => {
    const matchBulan = !filterBulan || r.items.some(item => matchesMonth(item.tanggal, filterBulan))
    if (!matchBulan) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.displayName.toLowerCase().includes(q) ||
      r.student.toLowerCase().includes(q) ||
      r.nis.toLowerCase().includes(q) ||
r.produkList.some(p => p.produk?.toLowerCase().includes(q))
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const totalAmount = rekap.reduce((s, r) => s + r.totalRaw, 0)
  const lunasCount = rekap.filter(r => r.status === 'Lunas').length
  const belumCount = rekap.filter(r => r.status !== 'Lunas').length

  const STAT_CARDS = [
    {
      label: 'Total Siswa',
      value: rekap.length,
      desc: 'Siswa terdaftar',
      icon: Users,
      iconBg: '#EAF3FF',
      iconColor: '#1769E0',
    },
    {
      label: 'Total Pembayaran',
      value: `Rp ${totalAmount.toLocaleString('id-ID')}`,
      desc: `Dari ${rekap.length} siswa`,
      icon: TrendingUp,
      iconBg: '#EAF3FF',
      iconColor: '#1769E0',
    },
    {
      label: 'Pembayaran Lunas',
      value: lunasCount,
      desc: `${rekap.length ? Math.round((lunasCount / rekap.length) * 100) : 0}% dari total siswa`,
      icon: CheckCircle,
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
    },
    {
      label: 'Belum Bayar',
      value: belumCount,
      desc: `${rekap.length ? Math.round((belumCount / rekap.length) * 100) : 0}% dari total siswa`,
      icon: Clock,
      iconBg: '#FEF3C7',
      iconColor: '#B45309',
    },
  ]

  return (
    <div className="page">
      {/* Heading */}
      <div className="jrn__heading">
        <div>
          <h2 className="jrn__title">Jurnal</h2>
          <p className="jrn__subtitle">
            Rekap transaksi pembayaran siswa. Lihat riwayat pembayaran, jumlah transaksi, dan sisa tagihan setiap siswa.
          </p>
        </div>
        <input
          type="month"
          className="jrn__period-select"
          value={filterBulan}
          onChange={e => { setFilterBulan(e.target.value); setPage(1) }}
          title="Filter periode"
        />
      </div>

      {/* Stat cards */}
      <div className="jrn__stats">
        {STAT_CARDS.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="jstat">
              <div className="jstat__left">
                <p className="jstat__label">{card.label}</p>
                <p className="jstat__value">{card.value}</p>
                <p className="jstat__desc">{card.desc}</p>
              </div>
              <div className="jstat__icon" style={{ background: card.iconBg }}>
                <Icon size={20} color={card.iconColor} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Table card */}
      <div className="jlist-card">
        <div className="jlist-card__header">
          <div>
            <h3 className="jlist-card__title">Rekap Jurnal per Siswa</h3>
            <p className="jlist-card__desc">Informasi jumlah pembayaran, sisa tagihan, dan status transaksi setiap siswa.</p>
          </div>
          <input
            type="search"
            className="jlist-search"
            placeholder="Cari nama siswa..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="jtable-wrap">
          <table className="jtable">
            <thead>
              <tr>
                <th className="jtable__th jtable__th--no">No</th>
                <th className="jtable__th">Nama Siswa</th>
                <th className="jtable__th">Total Tagihan</th>
                <th className="jtable__th jtable__th--center">Sudah Bayar</th>
                <th className="jtable__th jtable__th--center">Belum Bayar</th>
                <th className="jtable__th jtable__th--center">Jml Transaksi</th>
                <th className="jtable__th">Status</th>
                <th className="jtable__th jtable__th--action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="jtable__empty">Belum ada data jurnal.</td>
                </tr>
              ) : (
                paginated.map((row, i) => {
                  const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['Pending']
                  const StatusIcon = statusCfg.icon
                  const initials = getInitials(row.displayName)
                  return (
                    <tr key={i} className="jtable__row">
                      <td className="jtable__td jtable__td--no">{row.no}</td>
                      <td className="jtable__td">
                        <div className="jtable__student">
                          <div className="jtable__avatar">{initials}</div>
                          <div className="jtable__student-info">
                            <span className="jtable__student-name">{row.displayName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="jtable__td jtable__td--amount">{row.totalTagihan}</td>
                      <td className="jtable__td jtable__td--center">
                        <span className="jtable__count jtable__count--lunas">{row.sudahBayar}</span>
                      </td>
                      <td className="jtable__td jtable__td--center">
                        <span className="jtable__count jtable__count--belum">{row.belumBayar}</span>
                      </td>
                      <td className="jtable__td jtable__td--center">{row.jumlahTransaksi}</td>
                      <td className="jtable__td">
                        <span className={`jbadge ${statusCfg.cls}`}>
                          <StatusIcon size={11} />
                          {row.status}
                        </span>
                      </td>
                      <td className="jtable__td jtable__td--action">
                        <button className="jact__btn" onClick={() => setDetailRow(row)}>
                          Lihat Detail
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="jlist-footer">
          <span className="jlist-footer__count">
            Menampilkan {paginated.length} dari {filtered.length} data
          </span>
          <div className="jlist-footer__pages">
            <button
              className="jpage-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(n => (
              <button
                key={n}
                className={`jpage-btn${page === n ? ' jpage-btn--active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="jpage-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
