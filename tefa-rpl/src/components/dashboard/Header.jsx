import { useContext, useState } from 'react'
import { Menu, LogOut, Bell } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import './Header.css'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/siswa': 'Siswa',
  '/dashboard/produk': 'Produk',
  '/dashboard/penjualan': 'Penjualan',
  '/dashboard/order': 'Order',
  '/dashboard/pembayaran': 'Pembayaran',
  '/dashboard/jurnal': 'Jurnal',
  '/dashboard/grafik': 'Grafik',
  '/dashboard/histori': 'Histori',
  '/dashboard/pendapatan': 'Pendapatan',
  '/dashboard/pengeluaran': 'Pengeluaran',
  '/dashboard/struk': 'Struk',
}

const roleLabel = {
  admin: 'Admin',
  bendahara: 'Bendahara',
}

export default function Header({ onMenuToggle }) {
  const { pathname } = useLocation()
  const { user, logout } = useContext(AuthContext)
  const { notifications, dismissNotification } = useSocket()
  const navigate = useNavigate()
  const title = pageTitles[pathname] ?? 'Dashboard'
  const [showNotif, setShowNotif] = useState(false)

  function handleLogout() {
    logout()
    navigate('/masuk')
  }

  const initials = user?.nama
    ? user.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'U'

  return (
    <header className="dash-header">
      <button className="dash-header__menu" onClick={onMenuToggle} aria-label="Toggle sidebar">
        <Menu size={20} />
      </button>

      <h1 className="dash-header__title">{title}</h1>

      <div className="dash-header__user">
        {/* Notifikasi bell */}
        <div className="dash-header__notif-wrap">
          <button
            className="dash-header__notif-btn"
            onClick={() => setShowNotif(v => !v)}
            aria-label="Notifikasi"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="dash-header__notif-badge">{notifications.length}</span>
            )}
          </button>
          {showNotif && (
            <div className="dash-header__notif-dropdown">
              <div className="dash-header__notif-head">
                <span>Notifikasi</span>
                {notifications.length > 0 && (
                  <button className="dash-header__notif-clear" onClick={() => notifications.forEach(n => dismissNotification(n.id))}>
                    Hapus semua
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="dash-header__notif-empty">Tidak ada notifikasi</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="dash-header__notif-item">
                    <span className="dash-header__notif-msg">{n.message}</span>
                    <button className="dash-header__notif-dismiss" onClick={() => dismissNotification(n.id)}>✕</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="dash-header__user-info">
          <span className="dash-header__user-name">{user?.nama}</span>
          <span className="dash-header__role-badge">{roleLabel[user?.role] ?? user?.role}</span>
        </div>
        <div className="dash-header__avatar" aria-hidden="true">{initials}</div>
        <button className="dash-header__logout" onClick={handleLogout} aria-label="Keluar" title="Keluar">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
