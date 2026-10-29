import Logo from './Logo'
import './Footer.css'

const navLinks = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Kontak', href: '#kontak' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__main">
          <div>
            <Logo light />
            <p className="footer__tagline">
              Platform digital untuk mendukung kegiatan Teaching Factory RPL.
            </p>
          </div>

          <div>
            <p className="footer__nav-title">Navigasi</p>
            <nav className="footer__nav-links" aria-label="Navigasi footer">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="footer__nav-link">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="footer__copy">© 2026 TEFA RPL SMKN 1 BANJAR</span>
        </div>
      </div>
    </footer>
  )
}
