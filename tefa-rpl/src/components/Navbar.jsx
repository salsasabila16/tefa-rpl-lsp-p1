import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import Button from './Button'
import './Navbar.css'

const navLinks = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Tentang', href: '#tentang' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          <Logo />

          <nav className="navbar__nav" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="navbar__link" onClick={closeMenu}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="navbar__actions">
            <a href="/masuk" className="navbar__login">Masuk</a>
            <Button href="/masuk" size="sm">Mulai Sekarang</Button>
          </div>

          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <nav
        className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`}
        aria-label="Navigasi mobile"
        aria-hidden={!menuOpen}
      >
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} className="navbar__mobile-link" onClick={closeMenu}>
            {link.label}
          </a>
        ))}
        <div className="navbar__mobile-divider" />
        <div className="navbar__mobile-actions">
          <a href="/masuk" className="navbar__mobile-link" onClick={closeMenu}>Masuk</a>
          <Button href="/masuk" size="sm" onClick={closeMenu}>Mulai Sekarang</Button>
        </div>
      </nav>
    </>
  )
}
