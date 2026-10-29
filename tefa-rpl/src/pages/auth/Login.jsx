import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthContext } from '../../contexts/AuthContext'
import Button from '../../components/Button'
import './Login.css'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email wajib diisi'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Format email tidak valid'
    if (!form.password) e.password = 'Kata sandi wajib diisi'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }
    navigate('/dashboard')
  }

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  return (
    <div className="auth-form">
      <div className="auth-form__head">
        <h2 className="auth-form__title">Selamat Datang</h2>
        <p className="auth-form__sub">Silakan masuk untuk mengakses sistem TEFA RPL.</p>
      </div>

      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        {errors.form && <p className="auth-form__alert">{errors.form}</p>}

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={`auth-form__input${errors.email ? ' auth-form__input--error' : ''}`}
            placeholder="nama@email.sch.id"
            value={form.email}
            onChange={handleChange('email')}
            autoComplete="email"
          />
          {errors.email && <span className="auth-form__error">{errors.email}</span>}
        </div>

        <div className="auth-form__field">
          <div className="auth-form__label-row">
            <label className="auth-form__label" htmlFor="password">Kata Sandi</label>
            <Link to="/lupa-password" className="auth-form__forgot">Lupa password?</Link>
          </div>
          <div className="auth-form__input-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`auth-form__input${errors.password ? ' auth-form__input--error' : ''}`}
              placeholder="Masukkan kata sandi"
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-form__eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <span className="auth-form__error">{errors.password}</span>}
        </div>

        <label className="auth-form__remember">
          <input
            type="checkbox"
            className="auth-form__checkbox"
            checked={form.remember}
            onChange={handleChange('remember')}
          />
          Ingat saya
        </label>

        <Button type="submit" className={`auth-form__submit${loading ? ' auth-form__submit--loading' : ''}`} disabled={loading}>
          {loading ? 'Memverifikasi...' : 'Masuk'}
        </Button>

        <p className="auth-form__hint">Login sebagai Admin atau Bendahara</p>
      </form>
    </div>
  )
}
