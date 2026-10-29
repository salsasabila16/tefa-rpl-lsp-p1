import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, Layers, UserCheck } from 'lucide-react'

import { skemaData } from './skemaData'
import LandingNavbar from './LandingNavbar'
import LandingFooter from './LandingFooter'
import './SkemaPage.css'

export default function SkemaPage() {
  const { slug } = useParams()
  const skema = skemaData[slug]

  if (!skema) {
    return (
      <div className="skema-not-found">
        <LandingNavbar />
        <div className="skema-not-found__content">
          <h2>Skema tidak ditemukan</h2>
          <Link to="/#ruang-lingkup" className="skema-back-btn">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="skema-page">
      <LandingNavbar />

      {/* Hero */}
      <section className="skema-hero">
        <div className="skema-hero__inner">
          <div className="skema-hero__kode">{skema.kode}</div>
          <h1 className="skema-hero__title">{skema.nama}</h1>
          <p className="skema-hero__tagline">{skema.tagline}</p>
        </div>
      </section>

      {/* Main two-column layout */}
      <section className="skema-main">
        <div className="skema-main__inner">

          {/* Left column — Visi & Misi */}
          <div className="skema-main__left">
            <div className="skema-card">
              <h2 className="skema-card__title">Visi &amp; Misi</h2>

              <div className="skema-vismis__section">
                <h3 className="skema-vismis__sub">Visi</h3>
                <p className="skema-vismis__body">{skema.visi}</p>
              </div>

              <div className="skema-vismis__divider" />

              <div className="skema-vismis__section">
                <h3 className="skema-vismis__sub">Misi</h3>
                <ul className="skema-vismis__list">
                  {skema.misi.map((m, i) => (
                    <li key={i} className="skema-vismis__item">
                      <span className="skema-vismis__bullet" aria-hidden="true" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right column — Stats + Info */}
          <div className="skema-main__right">

            {/* Stat cards */}
            <div className="skema-statcard">
              <div className="skema-statcard__icon-wrap">
                <UserCheck size={22} />
              </div>
              <div className="skema-statcard__text">
                <span className="skema-statcard__label">Total Asesor</span>
                <span className="skema-statcard__value">{skema.stats.asesor}</span>
              </div>
            </div>

            <div className="skema-statcard">
              <div className="skema-statcard__icon-wrap">
                <Users size={22} />
              </div>
              <div className="skema-statcard__text">
                <span className="skema-statcard__label">Total Asesi</span>
                <span className="skema-statcard__value">{skema.stats.asesi}</span>
              </div>
            </div>

            <div className="skema-statcard">
              <div className="skema-statcard__icon-wrap">
                <Layers size={22} />
              </div>
              <div className="skema-statcard__text">
                <span className="skema-statcard__label">Total Skema</span>
                <span className="skema-statcard__value">{skema.stats.skema}</span>
              </div>
            </div>

            {/* Info Program card */}
            <div className="skema-card skema-info-card">
              <h2 className="skema-card__title">Informasi Program</h2>

              <div className="skema-info-field">
                <span className="skema-info-field__label">Kode Jurusan</span>
                <span className="skema-info-field__value">{skema.info.kode_jurusan}</span>
              </div>
              <div className="skema-info-field__divider" />

              <div className="skema-info-field">
                <span className="skema-info-field__label">Unit Kompetensi</span>
                <span className="skema-info-field__value">{skema.info.unit_kompetensi}</span>
              </div>
              <div className="skema-info-field__divider" />

              <div className="skema-info-field">
                <span className="skema-info-field__label">Standar Kompetensi</span>
                <span className="skema-info-field__value">{skema.info.standar}</span>
              </div>

              <Link to="/" className="skema-back-link">
                <ArrowLeft size={16} />
                Kembali
              </Link>
            </div>

          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
