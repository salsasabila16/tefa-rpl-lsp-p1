import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import './LandingNavbar.css'

const navLinks = [
  { label: 'Beranda', anchor: 'beranda' },
  { label: 'Ruang Lingkup Sertifikasi', anchor: 'ruang-lingkup' },
  { label: 'Berita', anchor: 'berita' },
]

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeAnchor, setActiveAnchor] = useState(() => {
    // Inisialisasi dari hash URL agar langsung tepat saat navigasi dari halaman lain
    const hash = window.location.hash.replace('#', '')
    const valid = navLinks.map(l => l.anchor)
    return valid.includes(hash) ? hash : 'beranda'
  })
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })

  const location = useLocation()
  const isHome = location.pathname === '/'
  // Halaman /skema/* berasal dari section "ruang-lingkup", jadi menu itu yang aktif
  const routeAnchor = location.pathname.startsWith('/skema/') ? 'ruang-lingkup' : null

  const navRef = useRef(null)
  const linkRefs = useRef({})

  // Anchor yang benar-benar ditampilkan sebagai aktif
  const effectiveActive = isHome ? activeAnchor : routeAnchor

  const updateIndicator = useCallback(() => {
    if (!effectiveActive) {
      setIndicatorStyle((s) => ({ ...s, opacity: 0 }))
      return
    }
    const activeEl = linkRefs.current[effectiveActive]
    const navEl = navRef.current
    if (!activeEl || !navEl) return
    const navRect = navEl.getBoundingClientRect()
    const linkRect = activeEl.getBoundingClientRect()
    setIndicatorStyle({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      opacity: 1,
    })
  }, [effectiveActive])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track which section is in view
  useEffect(() => {
    if (!isHome) return
    const observers = []
    navLinks.forEach(({ anchor }) => {
      const el = document.getElementById(anchor)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveAnchor(anchor) },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((obs) => obs.disconnect())
  }, [isHome])

  // Reposition indicator when active section or home status changes
  useEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  // Reposition on resize
  useEffect(() => {
    let rafId
    const onResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateIndicator)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
    }
  }, [updateIndicator])

  const closeMenu = () => setMenuOpen(false)

  function navHref(anchor) {
    return isHome ? `#${anchor}` : `/#${anchor}`
  }

  function handleLinkClick(anchor) {
    setActiveAnchor(anchor)
    closeMenu()
  }

  return (
    <>
      <header className={`lnav${scrolled ? ' lnav--scrolled' : ''}`}>
        <div className="lnav__inner">
          <Link to="/" className="lnav__brand" aria-label="LSP SMKN 1 BANJAR">
            <img src="/logo_lsp.webp" alt="Logo LSP SMKN 1 Banjar" className="lnav__logo" width="40" height="40" />
            <div className="lnav__brand-text">
              <span className="lnav__brand-lsp">LSP SMKN 1 BANJAR</span>
            </div>
          </Link>

          <nav className="lnav__nav" ref={navRef} aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <a
                key={link.anchor}
                href={navHref(link.anchor)}
                className={`lnav__link${effectiveActive === link.anchor ? ' lnav__link--active' : ''}`}
                ref={(el) => { linkRefs.current[link.anchor] = el }}
                onClick={() => handleLinkClick(link.anchor)}
              >
                {link.label}
              </a>
            ))}
            <span className="lnav__indicator" style={indicatorStyle} aria-hidden="true" />
          </nav>

          <div className="lnav__actions">
            <a href="/masuk" className="lnav__login-btn">Masuk</a>
          </div>

          <button
            className="lnav__hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <nav
        className={`lnav__mobile${menuOpen ? ' lnav__mobile--open' : ''}`}
        aria-label="Navigasi mobile"
        aria-hidden={!menuOpen}
      >
        {navLinks.map((link) => (
          <a
            key={link.anchor}
            href={navHref(link.anchor)}
            className={`lnav__mobile-link${effectiveActive === link.anchor ? ' lnav__mobile-link--active' : ''}`}
            onClick={() => handleLinkClick(link.anchor)}
          >
            {link.label}
          </a>
        ))}
        <div className="lnav__mobile-divider" />
        <a href="/masuk" className="lnav__mobile-login" onClick={closeMenu}>Masuk ke Dashboard</a>
      </nav>
    </>
  )
}
