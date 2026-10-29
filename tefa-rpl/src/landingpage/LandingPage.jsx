import { useState, useEffect, useRef } from 'react'
import { ChevronRight, ClipboardList, Users, Award, FileCheck, Building2, ShoppingBag, Calculator, Palette, Scissors, Briefcase, Code2, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import LandingNavbar from './LandingNavbar'
import LandingFooter from './LandingFooter'
import './LandingPage.css'


const stats = [
  { value: '190', label: 'Total Asesi', icon: Users },
  { value: '5', label: 'Asesor Berlisensi', icon: Award },
  { value: '8', label: 'Skema Kompetensi', icon: FileCheck },
  { value: '3', label: 'TUK', icon: Building2 },
]

const misi = [
  'Menyelenggarakan sertifikasi kompetensi yang transparan, objektif, dan terpercaya.',
  'Menyediakan asesor yang profesional dan kompeten di bidangnya.',
  'Mengembangkan skema sertifikasi sesuai dinamika kebutuhan pasar kerja.',
  'Meningkatkan kerjasama strategis dengan dunia usaha dan industri.',
]

const prinsip = ['Kualitas', 'Integritas', 'Profesionalisme', 'Akuntabilitas']

const sasaran = [
  { value: '100%', label: 'Kelulusan Pelanggan', desc: 'Target tingkat kepuasan peserta terhadap layanan uji kompetensi.' },
  { value: '0%', label: 'Banding Hasil Uji', desc: 'Menjamin objektivitas tinggi dalam setiap proses penilaian kompetensi.' },
  { value: '24 Jam', label: 'Waktu Respon', desc: 'Maksimal penanganan keluhan dan pertanyaan dari calon asesi.' },
  { value: '100%', label: 'Lisensi Aktif', desc: 'Seluruh tenaga penguji memiliki sertifikat kompetensi yang valid.' },
]

const ruangLingkup = [
  { jurusan: 'Pemasaran', skema: 2, slug: 'pemasaran', icon: ShoppingBag, visi: 'Menghasilkan lulusan kompeten dan komunikatif dalam bidang pemasaran dan penjualan.' },
  { jurusan: 'Akuntansi dan Keuangan Lembaga', skema: 1, slug: 'akuntansi', icon: Calculator, visi: 'Menghasilkan lulusan profesional dalam pengelolaan keuangan lembaga.' },
  { jurusan: 'Desain Komunikasi Visual', skema: 1, slug: 'dkv', icon: Palette, visi: 'Menghasilkan lulusan kreatif dan terampil dalam komunikasi visual.' },
  { jurusan: 'Tata Busana', skema: 1, slug: 'tata-busana', icon: Scissors, visi: 'Menghasilkan lulusan kompeten dan kreatif di bidang fashion dan busana.' },
  { jurusan: 'Manajemen Perkantoran dan Layanan Bisnis', skema: 1, slug: 'manajemen-perkantoran', icon: Briefcase, visi: 'Menghasilkan lulusan kompeten dalam manajemen perkantoran modern.' },
  { jurusan: 'Pengembangan Perangkat Lunak dan Gim', skema: 1, slug: 'pplg', icon: Code2, visi: 'Menghasilkan lulusan kompeten dan inovatif dalam pengembangan software dan gim.' },
  { jurusan: 'Broadcasting dan Film', skema: 1, slug: 'broadcasting', icon: Video, visi: 'Menghasilkan lulusan kreatif dan kompeten di bidang penyiaran dan produksi film.' },
]

export default function LandingPage() {
  const statsRef = useRef(null)
  const hasAnimated = useRef(false)
  const [displayValues, setDisplayValues] = useState(stats.map(() => '0'))

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          stats.forEach((stat, i) => {
            const target = parseInt(stat.value)
            if (isNaN(target)) return
            const duration = 1500
            const start = performance.now()
            const animate = (now) => {
              const progress = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setDisplayValues(prev => {
                const next = [...prev]
                next[i] = String(Math.round(eased * target))
                return next
              })
              if (progress < 1) requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
          })
        }
      },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing">
      <LandingNavbar />

      {/* Hero */}
      <section id="beranda" className="hero">
        <div className="hero__bg" style={{ backgroundImage: `url('/smkn1banjar.webp')` }} />
        <div className="hero__overlay" />
        <div className="hero__container">
          <div className="hero__content">
            <p className="hero__label">LSP P1 SMKN 1 BANJAR</p>
            <h1 className="hero__heading">Sertifikasi Kompetensi yang Transparan &amp; Terpercaya</h1>
            <p className="hero__sub">Berkomitmen pada standar kompetensi nasional dan industri untuk mencetak lulusan berdaya saing.</p>
            <div className="hero__actions">
              <a href="#ruang-lingkup" className="hero__cta hero__cta--primary">Lihat Skema Sertifikasi</a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats__inner" ref={statsRef}>
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="stats__item">
                <Icon size={24} className="stats__icon" />
                <span className="stats__value">{displayValues[i]}{!isNaN(parseInt(s.value)) ? '+' : ''}</span>
                <span className="stats__label">{s.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Visi & Misi */}
      <section id="visi-misi" className="visi-misi">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Visi &amp; Misi</h2>
            <p className="section-desc">Landasan kami dalam menyelenggarakan sertifikasi kompetensi yang kredibel dan profesional.</p>
          </div>
          <div className="visi-misi__grid">
            <div className="visi-misi__panel visi-misi__panel--dark">
              <span className="visi-misi__badge">Visi</span>
              <blockquote className="visi-misi__quote">
                Menjadi platform digital resmi LSP SMKN 1 Banjar yang terintegrasi, modern, dan profesional dalam mendukung seluruh proses sertifikasi kompetensi secara transparan, akurat, dan efisien, serta mampu meningkatkan kualitas layanan, kredibilitas lembaga, dan daya saing lulusan di dunia usaha dan dunia industri melalui pemanfaatan teknologi informasi.
              </blockquote>
            </div>
            <div className="visi-misi__panel visi-misi__panel--light">
              <span className="visi-misi__badge visi-misi__badge--gold">Misi</span>
              <ul className="visi-misi__list">
                {misi.map((m, i) => (
                  <li key={i} className="visi-misi__list-item">
                    <div className="visi-misi__step">
                      <span className="visi-misi__num">{i + 1}</span>
                      {i < misi.length - 1 && <span className="visi-misi__line" aria-hidden="true" />}
                    </div>
                    <span className="visi-misi__text">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Kebijakan Mutu */}
      <section id="kebijakan" className="kebijakan">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Kebijakan Mutu</h2>
            <p className="section-desc">
              LSP P1 SMKN 1 Banjar berkomitmen memberikan pelayanan sertifikasi yang mengutamakan
              kepuasan pelanggan, profesionalisme, dan konsistensi dalam menerapkan standar BNSP.
            </p>
          </div>
          <div className="kebijakan__prinsip">
            <ul className="kebijakan__prinsip-list">
              {prinsip.map((p, i) => (
                <li key={p}>
                  {p}
                  {i < prinsip.length - 1 && <span className="kebijakan__prinsip-sep" aria-hidden="true" />}
                </li>
              ))}
            </ul>
          </div>
          <p className="kebijakan__sasaran-label">Sasaran mutu kami</p>
          <div className="kebijakan__grid">
            {sasaran.map((s, i) => (
              <div key={i} className="kebijakan__card">
                <span className="kebijakan__card-value">{s.value}</span>
                <span className="kebijakan__card-title">{s.label}</span>
                <p className="kebijakan__card-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ruang Lingkup */}
      <section id="ruang-lingkup" className="ruang-lingkup">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Ruang Lingkup Sertifikasi</h2>
            <p className="section-desc">Bidang keahlian yang telah terlisensi untuk dilakukan pengujian kompetensi.</p>
          </div>
          <div className="ruang-lingkup__grid">
            {ruangLingkup.map((r, i) => {
              const Icon = r.icon
              return (
                <Link key={i} to={`/skema/${r.slug}`} className="rl-card">
                  <div className="rl-card__icon">
                    <Icon size={20} />
                  </div>
                  <div className="rl-card__body">
                    <h3 className="rl-card__jurusan">{r.jurusan}</h3>
                    <p className="rl-card__visi">{r.visi}</p>
                  </div>
                  <div className="rl-card__footer">
                    <span className="rl-card__skema">{r.skema} Skema</span>
                    <ChevronRight size={16} className="rl-card__arrow" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Berita */}
      <section id="berita" className="berita">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Berita Terbaru</h2>
            <p className="section-desc">Informasi terbaru seputar kegiatan, pengumuman, dan agenda LSP SMKN 1 Banjar.</p>
          </div>
          <div className="berita__empty">
            <ClipboardList size={36} strokeWidth={1.5} className="berita__empty-icon" />
            <p className="berita__empty-title">Belum ada berita yang dipublikasikan</p>
            <p className="berita__empty-sub">Silakan cek kembali dalam beberapa waktu.</p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
