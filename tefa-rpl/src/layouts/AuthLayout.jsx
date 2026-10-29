import './AuthLayout.css'

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__inner">
        {children}
      </div>
    </div>
  )
}
