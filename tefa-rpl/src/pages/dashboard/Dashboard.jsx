import { useContext, useMemo } from 'react'
import { TrendingUp, TrendingDown, ClipboardList, Users, CreditCard, CheckCircle, Clock } from 'lucide-react'
import StatCard from '../../components/dashboard/StatCard'
import SalesChart from '../../components/dashboard/SalesChart'
import TransactionTable from '../../components/dashboard/TransactionTable'
import { AuthContext } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import './Dashboard.css'

// ── helpers ───────────────────────────────────────────────────────────────────

function parseRupiah(str) {
  return parseInt(String(str).replace(/\D/g, ''), 10) || 0
}

function formatRupiahShort(num) {
  return `Rp ${num.toLocaleString('id-ID')}`
}

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function parseMonthYear(tanggal) {
  const parts = String(tanggal).split(' ')
  const mIdx = MONTHS_ID.indexOf(parts[1])
  const year = parseInt(parts[2])
  return mIdx >= 0 && !isNaN(year) ? { month: mIdx, year } : null
}

function parseTanggalMs(tanggal = '') {
  const parts = String(tanggal).trim().split(' ')
  const day = parseInt(parts[0]) || 1
  const mIdx = MONTHS_ID.indexOf(parts[1])
  const year = parseInt(parts[2]) || 2000
  const [h = 0, m = 0] = (parts[3] || '00:00').split(':').map(Number)
  if (mIdx < 0) return 0
  return new Date(year, mIdx, day, h, m).getTime()
}

function sortNewest(arr) {
  return [...arr].sort((a, b) => parseTanggalMs(b.tanggal) - parseTanggalMs(a.tanggal))
}

function buildChartData(pendapatanRows) {
  const now = new Date()
  const buckets = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ month: d.getMonth(), year: d.getFullYear(), label: MONTHS_ID[d.getMonth()], value: 0 })
  }
  for (const row of pendapatanRows) {
    if (row.status !== 'Lunas') continue
    const parsed = parseMonthYear(row.tanggal)
    if (!parsed) continue
    const bucket = buckets.find(b => b.month === parsed.month && b.year === parsed.year)
    if (bucket) bucket.value += parseRupiah(row.jumlah)
  }
  return buckets.map(({ label, value }) => ({ label, value }))
}

// ── hook ──────────────────────────────────────────────────────────────────────

function useDashboardData() {
  const { siswa, order, penjualan, pembayaran, pendapatan, pengeluaran } = useData()

  return useMemo(() => {
    // Derive status from pembayaran — same logic as Siswa.jsx
    const siswaWithStatus = siswa.map(s => {
      const nama = (s.nama || '').toLowerCase()
      const hasLunas = nama && pembayaran.some(
        p => (p.pembayar || '').toLowerCase().includes(nama) && p.status === 'Lunas'
      )
      return { ...s, derivedStatus: hasLunas ? 'Lunas' : 'Belum Bayar' }
    })

    const sudahBayar = siswaWithStatus.filter(s => s.derivedStatus === 'Lunas').length
    const belumBayar = siswaWithStatus.filter(s => s.derivedStatus === 'Belum Bayar').length
    const totalPendapatan = pendapatan.filter(r => r.status === 'Lunas').reduce((sum, r) => sum + parseRupiah(r.jumlah), 0)
    const totalPengeluaran = pengeluaran.reduce((sum, r) => sum + parseRupiah(r.jumlah), 0)
    const saldo = totalPendapatan - totalPengeluaran
    const pendingVerifikasi = pembayaran.filter(r => r.status === 'Pending Verifikasi').length

    return {
      totalSiswa: siswa.length,
      totalOrder: order.length,
      sudahBayar,
      belumBayar,
      recentPenjualan: sortNewest(penjualan).slice(0, 5),
      recentPembayaran: sortNewest(pembayaran).slice(0, 5),
      totalPendapatan,
      totalPengeluaran,
      saldo,
      pendingVerifikasi,
      chartData: buildChartData(pendapatan),
    }
  }, [siswa, order, penjualan, pembayaran, pendapatan, pengeluaran])
}

// ── Live badge ────────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span className="dash-live">
      <span className="dash-live__dot" />
      Live
    </span>
  )
}

// ── columns ───────────────────────────────────────────────────────────────────

const pembayaranColumns = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'pembayar', label: 'Nama Pembayar' },
  { key: 'produk', label: 'Produk' },
  { key: 'metode', label: 'Metode' },
  { key: 'jumlah', label: 'Jumlah' },
  { key: 'status', label: 'Status', badge: true },
]

// ── views ─────────────────────────────────────────────────────────────────────

function DashboardAdmin({ data }) {
  return (
    <div className="page">
      <div className="page__stats">
        <StatCard label="Total Siswa" value={String(data.totalSiswa)} icon={Users} />
        <StatCard label="Total Order" value={String(data.totalOrder)} icon={ClipboardList} />
        <StatCard label="Sudah Bayar" value={String(data.sudahBayar)} icon={CheckCircle} />
        <StatCard label="Belum Bayar" value={String(data.belumBayar)} icon={Clock} />
      </div>
      <div className="page__section">
        <div className="dash-section-header">
          <h2 className="page__section-title">Transaksi Pembayaran Terbaru</h2>
          <LiveBadge />
        </div>
        <TransactionTable columns={pembayaranColumns} rows={data.recentPembayaran} />
      </div>
    </div>
  )
}

function DashboardBendahara({ data }) {
  return (
    <div className="page">
      <div className="page__stats">
        <StatCard label="Total Pendapatan" value={formatRupiahShort(data.totalPendapatan)} icon={TrendingUp} />
        <StatCard label="Total Pengeluaran" value={formatRupiahShort(data.totalPengeluaran)} icon={TrendingDown} />
        <StatCard label="Saldo" value={formatRupiahShort(data.saldo)} icon={CreditCard} />
        <StatCard label="Pending Verifikasi" value={String(data.pendingVerifikasi)} icon={Clock} />
      </div>
      <SalesChart title="Pendapatan — 6 Bulan Terakhir" data={data.chartData} />
      <div className="page__section">
        <div className="dash-section-header">
          <h2 className="page__section-title">Pembayaran Terbaru</h2>
          <LiveBadge />
        </div>
        <TransactionTable columns={pembayaranColumns} rows={data.recentPembayaran} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const data = useDashboardData()
  return user?.role === 'bendahara' ? <DashboardBendahara data={data} /> : <DashboardAdmin data={data} />
}
