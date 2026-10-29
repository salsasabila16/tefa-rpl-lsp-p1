import './Logo.css'

export default function Logo({ light = false }) {
  return (
    <a href="/" className={`logo${light ? ' logo--light' : ''}`} aria-label="TEFA RPL SMKN 1 BANJAR">
      <span className="logo__name">TEFA RPL</span>
      <span className="logo__school">SMKN 1 BANJAR</span>
    </a>
  )
}
