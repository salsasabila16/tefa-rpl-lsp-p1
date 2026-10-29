import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Button from '../../components/Button'
import './Login.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email wajib diisi')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Format email tidak valid')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-form__head">
          <h2 className="auth-form__title">Cek Email Kamu</h2>
          <p className="auth-form__sub">Link reset password telah dikirim jika email terdaftar.</p>
        </div>
        <div className="auth-form__success">
          Kami telah mengirimkan link reset password ke <strong>{email}</strong>. Silakan cek inbox atau folder spam kamu. Link berlaku selama 1 jam.
        </div>
        <Link to="/masuk" className="auth-form__back-link">
          ← Kembali ke halaman masuk
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <div className="auth-form__head">
        <h2 className="auth-form__title">Lupa Password?</h2>
        <p className="auth-form__sub">Masukkan email kamu dan kami akan kirimkan link untuk reset password.</p>
      </div>

      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        {error && <p className="auth-form__alert">{error}</p>}

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={`auth-form__input${error && !email ? ' auth-form__input--error' : ''}`}
            placeholder="nama@email.sch.id"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            autoComplete="email"
          />
        </div>

        <Button
          type="submit"
          className={`auth-form__submit${loading ? ' auth-form__submit--loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Mengirim...' : 'Kirim Link Reset'}
        </Button>

        <Link to="/masuk" className="auth-form__back-link">
          ← Kembali ke halaman masuk
        </Link>
      </form>
    </div>
  )
}
