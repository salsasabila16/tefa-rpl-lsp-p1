import './StatCard.css'

export default function StatCard({ label, value, icon: Icon, trend }) {
  const trendPositive = trend && !trend.startsWith('-')

  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        {Icon && <Icon size={16} className="stat-card__icon" aria-hidden="true" />}
      </div>
      <div className="stat-card__bottom">
        <span className="stat-card__value">{value}</span>
        {trend && (
          <span className={`stat-card__trend stat-card__trend--${trendPositive ? 'up' : 'down'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
