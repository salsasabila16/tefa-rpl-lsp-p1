import { Link } from 'react-router-dom'
import './LandingPage.css'

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="section-inner">
        <div className="footer__grid">
          <div className="footer__about">
            <div className="footer__brand">
              <span className="footer__brand-lsp">LSP</span>
              <span className="footer__brand-school">SMKN 1 BANJAR</span>
            </div>
            <p className="footer__about-desc">
              Lembaga Sertifikasi Profesi P1 SMKN 1 Banjar yang melaksanakan sertifikasi
              kompetensi bagi siswa sesuai standar industri dan BNSP.
            </p>
            <iframe
              title="Lokasi SMKN 1 Banjar"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d994.66!2d108.5270141!3d-7.3704311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f637c6dac081d%3A0x4ad442ab5a695f4b!2sSMK%20Negeri%201%20Banjar!5e0!3m2!1sid!2sid!4v1698740000000!5m2!1sid!2sid"
              width="100%"
              height="140"
              style={{ border: 0, borderRadius: '8px', display: 'block', marginTop: '16px', opacity: 0.85 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Kontak</h4>
            <ul className="footer__list">
              <li>Jl. KH. Mustofa Lingk. Parunglesang, RT.05/RW.10, Banjar, Kec. Banjar, Kota Banjar, Jawa Barat 46311</li>
              <li>085241175689</li>
              <li>lspsmkn1banjar@gmail.com</li>
            </ul>
            <a
              href="https://maps.google.com/?q=Jl.+KH.+Mustofa+Lingk.+Parunglesang,+Banjar,+Kota+Banjar,+Jawa+Barat+46311"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__maps-link"
            >
              Lihat di Google Maps →
            </a>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Navigasi</h4>
            <ul className="footer__list footer__list--links">
              <li><Link to="/panduan">Panduan</Link></li>
            </ul>
            <h4 className="footer__col-title footer__col-title--spaced">Sosial Media</h4>
            <ul className="footer__list footer__list--links">
              <li><a href="https://www.instagram.com/smknegeri1banjar/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 LSP SMKN 1 Banjar</p>
        </div>
      </div>
    </footer>
  )
}
