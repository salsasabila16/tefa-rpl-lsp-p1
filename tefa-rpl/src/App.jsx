import { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import LandingPage from './landingpage/LandingPage'
import SkemaPage from './landingpage/SkemaPage'
import PanduanPage from './landingpage/PanduanPage'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/dashboard/Dashboard'
import Siswa from './pages/dashboard/Siswa'
import Produk from './pages/dashboard/Produk'
import Penjualan from './pages/dashboard/Penjualan'
import Order from './pages/dashboard/Order'
import Pembayaran from './pages/dashboard/Pembayaran'
import Jurnal from './pages/dashboard/Jurnal'
import Grafik from './pages/dashboard/Grafik'
import Histori from './pages/dashboard/Histori'
import Pendapatan from './pages/dashboard/Pendapatan'
import Pengeluaran from './pages/dashboard/Pengeluaran'
import Struk from './pages/dashboard/Struk'

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '14px', color: '#6b7280' }}>Memuat...</div>
  if (!user) return <Navigate to="/masuk" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/skema/:slug" element={<SkemaPage />} />
      <Route path="/panduan" element={<PanduanPage />} />
      <Route path="/masuk" element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
      <Route path="/daftar" element={<PublicRoute><AuthLayout><Register /></AuthLayout></PublicRoute>} />
      <Route path="/lupa-password" element={<PublicRoute><AuthLayout><ForgotPassword /></AuthLayout></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><AuthLayout><ResetPassword /></AuthLayout></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/siswa" element={<ProtectedRoute><DashboardLayout><Siswa /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/produk" element={<ProtectedRoute><DashboardLayout><Produk /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/penjualan" element={<ProtectedRoute><DashboardLayout><Penjualan /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/order" element={<ProtectedRoute><DashboardLayout><Order /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/pembayaran" element={<ProtectedRoute><DashboardLayout><Pembayaran /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/jurnal" element={<ProtectedRoute><DashboardLayout><Jurnal /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/grafik" element={<ProtectedRoute><DashboardLayout><Grafik /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/histori" element={<ProtectedRoute><DashboardLayout><Histori /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/pendapatan" element={<ProtectedRoute><DashboardLayout><Pendapatan /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/pengeluaran" element={<ProtectedRoute><DashboardLayout><Pengeluaran /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/struk" element={<ProtectedRoute><DashboardLayout><Struk /></DashboardLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
