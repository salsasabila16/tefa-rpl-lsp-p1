import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  CreditCard,
  BookOpen,
  BarChart2,
  History,
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  X,
} from 'lucide-react'
import { AuthContext } from '../../contexts/AuthContext'
import './Sidebar.css'

const NAV_BY_ROLE = {
  admin: [
    { label: 'Dashboard',   href: '/dashboard',              icon: LayoutDashboard, exact: true },
    { label: 'Siswa',       href: '/dashboard/siswa',        icon: Users },
    { label: 'Produk',      href: '/dashboard/produk',       icon: Package },
    { label: 'Penjualan',   href: '/dashboard/penjualan',    icon: ShoppingCart },
    { label: 'Order',       href: '/dashboard/order',        icon: ClipboardList },
    { label: 'Pembayaran',  href: '/dashboard/pembayaran',   icon: CreditCard },
    { label: 'Jurnal',      href: '/dashboard/jurnal',       icon: BookOpen },
    { label: 'Grafik',      href: '/dashboard/grafik',       icon: BarChart2 },
    { label: 'Pendapatan',  href: '/dashboard/pendapatan',   icon: TrendingUp },
    { label: 'Pengeluaran', href: '/dashboard/pengeluaran',  icon: TrendingDown },
    { label: 'Struk',       href: '/dashboard/struk',        icon: Receipt },
    { label: 'Histori',     href: '/dashboard/histori',      icon: History },
  ],
  bendahara: [
    { label: 'Dashboard',   href: '/dashboard',              icon: LayoutDashboard, exact: true },
    { label: 'Siswa',       href: '/dashboard/siswa',        icon: Users },
    { label: 'Produk',      href: '/dashboard/produk',       icon: Package },
    { label: 'Pembayaran',  href: '/dashboard/pembayaran',   icon: CreditCard },
    { label: 'Jurnal',      href: '/dashboard/jurnal',       icon: BookOpen },
    { label: 'Grafik',      href: '/dashboard/grafik',       icon: BarChart2 },
    { label: 'Pendapatan',  href: '/dashboard/pendapatan',   icon: TrendingUp },
    { label: 'Pengeluaran', href: '/dashboard/pengeluaran',  icon: TrendingDown },
    { label: 'Struk',       href: '/dashboard/struk',        icon: Receipt },
    { label: 'Histori',     href: '/dashboard/histori',      icon: History },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { user } = useContext(AuthContext)
  const navItems = NAV_BY_ROLE[user?.role] ?? []

  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`} aria-label="Navigasi dashboard">
      <div className="sidebar__top">
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">T</div>
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">TEFA RPL</span>
            <span className="sidebar__brand-school">SMKN 1 Banjar</span>
          </div>
        </div>
        <button className="sidebar__close" onClick={onClose} aria-label="Tutup sidebar">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ label, href, icon: Icon, exact }) => (
          <NavLink
            key={href}
            to={href}
            end={exact}
            className={({ isActive }) =>
              `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
            }
            onClick={onClose}
          >
            <Icon size={16} className="sidebar__icon" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
