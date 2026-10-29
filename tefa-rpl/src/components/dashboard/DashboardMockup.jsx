import './DashboardMockup.css'

const bars = [45, 62, 38, 75, 55, 80, 48, 70]

const transactions = [
  { date: '28 Sep', item: 'Jasa Desain Web', amount: 'Rp 250.000', status: 'Lunas' },
  { date: '27 Sep', item: 'Aplikasi Android', amount: 'Rp 500.000', status: 'Pending' },
  { date: '26 Sep', item: 'Jasa UI/UX', amount: 'Rp 175.000', status: 'Lunas' },
  { date: '25 Sep', item: 'Web Company Profile', amount: 'Rp 400.000', status: 'Lunas' },
]

const sidebarItems = ['Dashboard', 'Produk', 'Penjualan', 'Order', 'Pembayaran', 'Jurnal', 'Laporan']

export default function DashboardMockup({ size = 'sm' }) {
  const showSidebar = size === 'lg'
  const maxBars = size === 'sm' ? 6 : 8
  const maxRows = size === 'sm' ? 3 : 4

  return (
    <div className={`mockup mockup--${size}`} role="img" aria-label="Preview tampilan dashboard TEFA RPL">
      <div className="mockup__topbar">
        <div className="mockup__topbar-left">
          <span className="mockup__dot"></span>
          <span className="mockup__dot"></span>
          <span className="mockup__dot"></span>
        </div>
        <span className="mockup__title-bar">TEFA RPL — Dashboard</span>
        <div className="mockup__topbar-avatar">TR</div>
      </div>

      <div className="mockup__body">
        {showSidebar && (
          <nav className="mockup__sidebar" aria-label="Navigasi sidebar">
            {sidebarItems.map((item) => (
              <div
                key={item}
                className={`mockup__sidebar-item${item === 'Dashboard' ? ' mockup__sidebar-item--active' : ''}`}
              >
                {item}
              </div>
            ))}
          </nav>
        )}

        <div className="mockup__content">
          <div className="mockup__content-header">Ringkasan Aktivitas</div>

          <div className="mockup__stats">
            <div className="mockup__stat">
              <div className="mockup__stat-label">Pendapatan</div>
              <div className="mockup__stat-value mockup__stat-value--blue">Rp 1.320.000</div>
            </div>
            <div className="mockup__stat">
              <div className="mockup__stat-label">Pengeluaran</div>
              <div className="mockup__stat-value">Rp 480.000</div>
            </div>
            <div className="mockup__stat">
              <div className="mockup__stat-label">Pesanan</div>
              <div className="mockup__stat-value">14</div>
            </div>
            <div className="mockup__stat">
              <div className="mockup__stat-label">Produk</div>
              <div className="mockup__stat-value">8</div>
            </div>
          </div>

          <div className="mockup__chart-wrap">
            <div className="mockup__chart-label">Penjualan — September 2026</div>
            <div className="mockup__chart" role="presentation">
              {bars.slice(0, maxBars).map((h, i) => (
                <div
                  key={i}
                  className={`mockup__bar${i === maxBars - 2 ? ' mockup__bar--active' : ''}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="mockup__table-wrap">
            <div className="mockup__table-header">
              <span className="mockup__table-head">Tanggal</span>
              <span className="mockup__table-head">Produk/Jasa</span>
              <span className="mockup__table-head">Jumlah</span>
              <span className="mockup__table-head">Status</span>
            </div>
            {transactions.slice(0, maxRows).map((tx, i) => (
              <div key={i} className="mockup__table-row">
                <span className="mockup__table-cell mockup__table-cell--muted">{tx.date}</span>
                <span className="mockup__table-cell">{tx.item}</span>
                <span className="mockup__table-cell">{tx.amount}</span>
                <span className="mockup__table-cell">
                  <span className={`mockup__badge mockup__badge--${tx.status === 'Lunas' ? 'success' : 'pending'}`}>
                    {tx.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
