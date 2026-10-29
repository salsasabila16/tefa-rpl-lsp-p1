import './TransactionTable.css'

const STATUS_CLASSES = {
  Lunas: 'badge--success',
  Pending: 'badge--pending',
  'Pending Verifikasi': 'badge--pending',
  Dibatalkan: 'badge--cancelled',
  Ditolak: 'badge--cancelled',
  Masuk: 'badge--success',
  Keluar: 'badge--cancelled',
  Selesai: 'badge--success',
  Proses: 'badge--pending',
  'Belum Bayar': 'badge--belum-bayar',
}

export default function TransactionTable({ columns = [], rows = [], emptyText = 'Belum ada data.', renderActions }) {
  const showActions = typeof renderActions === 'function'
  return (
    <div className="tx-table-wrap">
      <table className="tx-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="tx-table__th">{col.label}</th>
            ))}
            {showActions && <th className="tx-table__th tx-table__th--action">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (showActions ? 1 : 0)} className="tx-table__empty">{emptyText}</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="tx-table__row">
                {columns.map((col) => (
                  <td key={col.key} className="tx-table__td">
                    {col.badge ? (
                      <span className={`badge ${STATUS_CLASSES[row[col.key]] ?? 'badge--pending'}`}>
                        {row[col.key]}
                      </span>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                {showActions && (
                  <td className="tx-table__td tx-table__td--action">{renderActions(row, i)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
