import { useMemo, useState } from 'react'
import { CheckCircle, Clock, TrendingUp, TrendingDown, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import './Histori.css'

const ROWS_PER_PAGE = 15

function parseRupiah(str) {
  return parseInt(String(str || '0').replace(/\D/g, ''), 10) || 0
}

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function parseTanggalMs(tanggal = '') {
  const parts = String(tanggal).trim().split(' ')
  const day = parseInt(parts[0]) || 1
  const mIdx = MONTHS_ID.indexOf(parts[1])
  const year = parseInt(parts[2]) || 2000
  const [h = 0, m = 0] = (parts[3] || '00:00').split(':').map(Number)
  if (mIdx < 0) return 0
  return new Date(year, mIdx, day, h, m).getTime()
}

function buildAktivitas({ pembayaran, pendapatan, pengeluaran, penjualan, order }) {
  const entries = []

  for (const p of pembayaran) {
    entries.push({
      tanggal: p.tanggal || '-',
      ts: parseTanggalMs(p.tanggal),
      tipe: 'Pembayaran',
      deskripsi: `${p.pembayar || '-'} — ${p.produk || '-'}`,
      jumlah: p.jumlah || '-',
      jumlahRaw: p.jumlahRaw || parseRupiah(p.jumlah),
      status: p.status || 'Pending',
      arah: 'masuk',
    })
  }

  for (const p of pendapatan) {
    if (p.struk_no) continue // sudah masuk via pembayaran
    entries.push({
      tanggal: p.tanggal || '-',
      ts: parseTanggalMs(p.tanggal),
      tipe: 'Pendapatan',
      deskripsi: p.keterangan || '-',
      jumlah: p.jumlah || '-',
      jumlahRaw: parseRupiah(p.jumlah),
      status: p.status || 'Lunas',
      arah: 'masuk',
    })
  }

  for (const p of pengeluaran) {
    entries.push({
      tanggal: p.tanggal || '-',
      ts: parseTanggalMs(p.tanggal),
      tipe: 'Pengeluaran',
      deskripsi: p.keterangan || '-',
      jumlah: p.jumlah || '-',
      jumlahRaw: parseRupiah(p.jumlah),
      status: p.status || 'Lunas',
      arah: 'keluar',
    })
  }

  for (const p of penjualan) {
    entries.push({
      tanggal: p.tanggal || '-',
      ts: parseTanggalMs(p.tanggal),
      tipe: 'Penjualan',
      deskripsi: `${p.produk || '-'} — ${p.pembeli || '-'}`,
      jumlah: p.jumlah || '-',
      jumlahRaw: parseRupiah(p.jumlah),
      status: p.status || '-',
      arah: 'masuk',
    })
  }

  for (const p of order) {
    entries.push({
      tanggal: p.tanggal || '-',
      ts: parseTanggalMs(p.tanggal),
      tipe: 'Order',
      deskripsi: `${p.produk || '-'} — ${p.pembeli || '-'}`,
      jumlah: p.total || '-',
      jumlahRaw: parseRupiah(p.total),
      status: p.status || '-',
      arah: 'masuk',
    })
  }

  return entries.sort((a, b) => b.ts - a.ts)
}

const TIPE_CONFIG = {
  Pembayaran: { bg: '#EAF3FF', color: '#1769E0', icon: CheckCircle },
  Pendapatan: { bg: '#DCFCE7', color: '#15803D', icon: TrendingUp },
  Pengeluaran: { bg: '#FEE2E2', color: '#B91C1C', icon: TrendingDown },
  Penjualan:  { bg: '#FEF3C7', color: '#B45309', icon: ShoppingCart },
  Order:      { bg: '#F3E8FF', color: '#7C3AED', icon: Clock },
}

const STATUS_CLS = {
  Lunas:   'hist-badge--lunas',
  Pending: 'hist-badge--pending',
  'Pending Verifikasi': 'hist-badge--verif',
  Ditolak: 'hist-badge--ditolak',
  Selesai: 'hist-badge--lunas',
  Proses:  'hist-badge--verif',
  Dibatalkan: 'hist-badge--ditolak',
}

export default function Histori() {
  const { pembayaran, pendapatan, pengeluaran, penjualan, order } = useData()
  const [search, setSearch] = useState('')
  const [filterTipe, setFilterTipe] = useState('Semua')
  const [page, setPage] = useState(1)

  const semua = useMemo(() =>
    buildAktivitas({ pembayaran, pendapatan, pengeluaran, penjualan, order }),
    [pembayaran, pendapatan, pengeluaran, penjualan, order]
  )

  const filtered = useMemo(() => {
    return semua.filter(r => {
      const matchTipe = filterTipe === 'Semua' || r.tipe === filterTipe
      const matchSearch = !search || r.deskripsi.toLowerCase().includes(search.toLowerCase()) || r.tipe.toLowerCase().includes(search.toLowerCase())
      return matchTipe && matchSearch
    })
  }, [semua, filterTipe, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  // Penjualan dan Order tidak dihitung di totalMasuk karena sudah tercakup dalam Pembayaran/Pendapatan
  const totalMasuk = semua
    .filter(r => r.arah === 'masuk' && r.status === 'Lunas' && r.tipe !== 'Penjualan' && r.tipe !== 'Order')
    .reduce((s, r) => s + r.jumlahRaw, 0)
  const totalKeluar = semua.filter(r => r.arah === 'keluar').reduce((s, r) => s + r.jumlahRaw, 0)

  return (
    <div className="page">
      <div className="hist__heading">
        <div>
          <h2 className="hist__title">Histori Aktivitas</h2>
          <p className="hist__subtitle">Rekap seluruh transaksi dan aktivitas keuangan TEFA RPL.</p>
        </div>
        <span className="hist-live"><span className="hist-live__dot" />Live</span>
      </div>

      {/* Summary */}
      <div className="hist__stats">
        <div className="histstat histstat--masuk">
          <p className="histstat__label">Total Pemasukan (Lunas)</p>
          <p className="histstat__value">Rp {totalMasuk.toLocaleString('id-ID')}</p>
        </div>
        <div className="histstat histstat--keluar">
          <p className="histstat__label">Total Pengeluaran</p>
          <p className="histstat__value">Rp {totalKeluar.toLocaleString('id-ID')}</p>
        </div>
        <div className="histstat histstat--saldo">
          <p className="histstat__label">Saldo Bersih</p>
          <p className={`histstat__value ${totalMasuk - totalKeluar >= 0 ? '' : 'histstat__value--minus'}`}>
            Rp {Math.abs(totalMasuk - totalKeluar).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="histstat">
          <p className="histstat__label">Total Aktivitas</p>
          <p className="histstat__value">{semua.length}</p>
        </div>
      </div>

      {/* Table card */}
      <div className="hist-card">
        <div className="hist-card__header">
          <h3 className="hist-card__title">Semua Aktivitas</h3>
          <div className="hist-card__controls">
            <select
              className="hist-filter"
              value={filterTipe}
              onChange={e => { setFilterTipe(e.target.value); setPage(1) }}
            >
              {['Semua', 'Pembayaran', 'Pendapatan', 'Pengeluaran', 'Penjualan', 'Order'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input
              type="search"
              className="hist-search"
              placeholder="Cari aktivitas..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        <div className="hist-table-wrap">
          <table className="hist-table">
            <thead>
              <tr>
                <th className="hist-table__th hist-table__th--no">No</th>
                <th className="hist-table__th">Tanggal</th>
                <th className="hist-table__th">Tipe</th>
                <th className="hist-table__th">Deskripsi</th>
                <th className="hist-table__th">Jumlah</th>
                <th className="hist-table__th">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="hist-table__empty">Belum ada aktivitas.</td></tr>
              ) : (
                paginated.map((row, i) => {
                  const cfg = TIPE_CONFIG[row.tipe] ?? TIPE_CONFIG['Order']
                  const Icon = cfg.icon
                  return (
                    <tr key={i} className="hist-table__row">
                      <td className="hist-table__td hist-table__td--no">{(page - 1) * ROWS_PER_PAGE + i + 1}</td>
                      <td className="hist-table__td hist-table__td--muted">{row.tanggal}</td>
                      <td className="hist-table__td">
                        <span className="hist-tipe" style={{ background: cfg.bg, color: cfg.color }}>
                          <Icon size={11} />
                          {row.tipe}
                        </span>
                      </td>
                      <td className="hist-table__td hist-table__td--desc">{row.deskripsi}</td>
                      <td className={`hist-table__td hist-table__td--amount ${row.arah === 'keluar' ? 'hist-table__td--keluar' : ''}`}>
                        {row.arah === 'keluar' ? '−' : '+'} {row.jumlah}
                      </td>
                      <td className="hist-table__td">
                        <span className={`hist-badge ${STATUS_CLS[row.status] ?? 'hist-badge--pending'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="hist-footer">
          <span className="hist-footer__count">Menampilkan {paginated.length} dari {filtered.length} aktivitas</span>
          <div className="hist-footer__pages">
            <button className="hist-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(n => (
              <button key={n} className={`hist-page-btn${page === n ? ' hist-page-btn--active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="hist-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
