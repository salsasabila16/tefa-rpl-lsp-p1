import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Button from '../../components/Button'
import './Register.css'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama: '', email: '', password: '', konfirmasi: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.nama.trim()) e.nama = 'Nama lengkap wajib diisi'
    if (!form.email) e.email = 'Email wajib diisi'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Format email tidak valid'
    if (!form.password) e.password = 'Kata sandi wajib diisi'
    else if (form.password.length < 8) e.password = 'Minimal 8 karakter'
    if (!form.konfirmasi) e.konfirmasi = 'Konfirmasi kata sandi wajib diisi'
    else if (form.konfirmasi !== form.password) e.konfirmasi = 'Kata sandi tidak cocok'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await api.post('/auth/register', {
        nama: form.nama.trim(),
        email: form.email,
        password: form.password,
        role: 'bendahara',
      })
      navigate('/masuk')
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mendaftar, silakan coba lagi'
      setErrors({ form: msg })
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
        <h2 className="auth-form__title">Daftar</h2>
        <p className="auth-form__sub">Buat akun baru untuk TEFA RPL</p>
      </div>

      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        {errors.form && <p className="auth-form__alert">{errors.form}</p>}

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="nama">Nama Lengkap</label>
          <input id="nama" type="text" className={`auth-form__input${errors.nama ? ' auth-form__input--error' : ''}`} placeholder="Nama lengkap Anda" value={form.nama} onChange={handleChange('nama')} autoComplete="name" />
          {errors.nama && <span className="auth-form__error">{errors.nama}</span>}
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="email">Email</label>
          <input id="email" type="email" className={`auth-form__input${errors.email ? ' auth-form__input--error' : ''}`} placeholder="nama@smkn1banjar.sch.id" value={form.email} onChange={handleChange('email')} autoComplete="email" />
          {errors.email && <span className="auth-form__error">{errors.email}</span>}
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="password">Kata Sandi</label>
          <input id="password" type="password" className={`auth-form__input${errors.password ? ' auth-form__input--error' : ''}`} placeholder="Minimal 8 karakter" value={form.password} onChange={handleChange('password')} autoComplete="new-password" />
          {errors.password && <span className="auth-form__error">{errors.password}</span>}
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="konfirmasi">Konfirmasi Kata Sandi</label>
          <input id="konfirmasi" type="password" className={`auth-form__input${errors.konfirmasi ? ' auth-form__input--error' : ''}`} placeholder="Ulangi kata sandi" value={form.konfirmasi} onChange={handleChange('konfirmasi')} autoComplete="new-password" />
          {errors.konfirmasi && <span className="auth-form__error">{errors.konfirmasi}</span>}
        </div>

        <Button type="submit" className={`auth-form__submit${loading ? ' auth-form__submit--loading' : ''}`} disabled={loading}>
          {loading ? 'Mendaftarkan...' : 'Daftar'}
        </Button>
      </form>

      <p className="auth-form__switch">
        Sudah punya akun?{' '}
        <Link to="/masuk" className="auth-form__link">Masuk</Link>
      </p>
    </div>
  )
}
