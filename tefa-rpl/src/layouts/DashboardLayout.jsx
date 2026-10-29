import { useContext, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { canAccess } from '../utils/rbac'
import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'
import './DashboardLayout.css'

export default function DashboardLayout({ children }) {
  const { user } = useContext(AuthContext)
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <Navigate to="/masuk" replace />
  if (!canAccess(user.role, pathname)) return <Navigate to="/dashboard" replace />

  return (
    <div className="dash-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="dash-layout__overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="dash-layout__main">
        <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="dash-layout__content">
          {children}
        </main>
      </div>
    </div>
  )
}
