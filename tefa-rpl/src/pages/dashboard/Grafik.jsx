import { useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import SalesChart from '../../components/dashboard/SalesChart'
import './Grafik.css'

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function parseRupiah(str) {
  return parseInt(String(str).replace(/\D/g, ''), 10) || 0
}

function parseMonthYear(tanggal) {
  const parts = String(tanggal).split(' ')
  const mIdx = MONTHS_ID.indexOf(parts[1])
  const year = parseInt(parts[2])
  return mIdx >= 0 && !isNaN(year) ? { month: mIdx, year } : null
}

function buildMonthlyData(rows, valueKey = 'jumlah', filterLunas = true) {
  const now = new Date()
  const buckets = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ month: d.getMonth(), year: d.getFullYear(), label: MONTHS_ID[d.getMonth()], value: 0 })
  }
  for (const row of rows) {
    if (filterLunas && row.status !== 'Lunas') continue
    const parsed = parseMonthYear(row.tanggal)
    if (!parsed) continue
    const bucket = buckets.find(b => b.month === parsed.month && b.year === parsed.year)
    if (bucket) bucket.value += parseRupiah(row[valueKey])
  }
  return buckets.map(({ label, value }) => ({ label, value }))
}

export default function Grafik() {
  const { pendapatan, pengeluaran, pembayaran } = useData()

  const pendapatanData = useMemo(() => buildMonthlyData(pendapatan), [pendapatan])
  const pengeluaranData = useMemo(() => buildMonthlyData(pengeluaran, 'jumlah', false), [pengeluaran])
  const pembayaranData = useMemo(() => buildMonthlyData(pembayaran), [pembayaran])

  return (
    <div className="page">
      <div className="grfk__heading">
        <div>
          <h2 className="grfk__title">Grafik Keuangan</h2>
          <p className="grfk__subtitle">Data diperbarui otomatis secara realtime.</p>
        </div>
        <span className="grfk-live">
          <span className="grfk-live__dot" />
          Live
        </span>
      </div>
      <div className="grafik__grid">
        <SalesChart title="Pendapatan per Bulan" data={pendapatanData} />
        <SalesChart title="Pengeluaran per Bulan" data={pengeluaranData} />
      </div>
      <SalesChart title="Pembayaran Siswa per Bulan" data={pembayaranData} />
    </div>
  )
}
