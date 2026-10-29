import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import api from '../../services/api'
import Button from '../../components/Button'
import './Login.css'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!success) return
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          navigate('/masuk')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [success, navigate])

  if (!token) {
    return (
      <div className="auth-form">
        <div className="auth-form__head">
          <h2 className="auth-form__title">Link Tidak Valid</h2>
          <p className="auth-form__sub">Token reset password tidak ditemukan.</p>
        </div>
        <Link to="/lupa-password" className="auth-form__back-link">
          ← Minta link reset baru
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-form__head">
          <h2 className="auth-form__title">Password Berhasil Direset</h2>
          <p className="auth-form__sub">Password kamu telah diperbarui.</p>
        </div>
        <div className="auth-form__success">
          Password berhasil direset. Kamu akan diarahkan ke halaman masuk dalam <strong>{countdown} detik</strong>.
        </div>
        <Link to="/masuk" className="auth-form__back-link">
          Masuk sekarang →
        </Link>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!form.password) e.password = 'Password wajib diisi'
    else if (form.password.length < 8) e.password = 'Password minimal 8 karakter'
    if (!form.confirm) e.confirm = 'Konfirmasi password wajib diisi'
    else if (form.password !== form.confirm) e.confirm = 'Password tidak cocok'
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
    try {
      await api.post('/auth/reset-password', { token, password: form.password })
      setSuccess(true)
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Token tidak valid atau sudah kedaluwarsa.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  return (
    <div className="auth-form">
      <div className="auth-form__head">
        <h2 className="auth-form__title">Buat Password Baru</h2>
        <p className="auth-form__sub">Masukkan password baru untuk akun TEFA RPL kamu.</p>
      </div>

      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        {errors.form && <p className="auth-form__alert">{errors.form}</p>}

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="password">Password Baru</label>
          <div className="auth-form__input-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`auth-form__input${errors.password ? ' auth-form__input--error' : ''}`}
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-form__eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <span className="auth-form__error">{errors.password}</span>}
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="confirm">Konfirmasi Password</label>
          <div className="auth-form__input-wrap">
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              className={`auth-form__input${errors.confirm ? ' auth-form__input--error' : ''}`}
              placeholder="Ulangi password baru"
              value={form.confirm}
              onChange={handleChange('confirm')}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-form__eye"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Sembunyikan konfirmasi' : 'Tampilkan konfirmasi'}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirm && <span className="auth-form__error">{errors.confirm}</span>}
        </div>

        <Button
          type="submit"
          className={`auth-form__submit${loading ? ' auth-form__submit--loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
        </Button>

        <Link to="/masuk" className="auth-form__back-link">
          ← Kembali ke halaman masuk
        </Link>
      </form>
    </div>
  )
}
