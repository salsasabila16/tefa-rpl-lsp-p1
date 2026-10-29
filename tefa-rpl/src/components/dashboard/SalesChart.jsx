import './SalesChart.css'

export default function SalesChart({ data = [], title }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="sales-chart">
      {title && <div className="sales-chart__title">{title}</div>}
      <div className="sales-chart__bars" role="img" aria-label={title ?? 'Bar chart'}>
        {data.map((d, i) => (
          <div key={i} className="sales-chart__col">
            <div className="sales-chart__bar-wrap">
              <div
                className={`sales-chart__bar${i === data.length - 1 ? ' sales-chart__bar--highlight' : ''}`}
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="sales-chart__label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
