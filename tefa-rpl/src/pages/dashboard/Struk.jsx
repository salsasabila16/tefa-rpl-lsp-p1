import { useState, useContext, useMemo } from 'react'
import { Receipt, TrendingUp, CheckCircle, Search, Printer } from 'lucide-react'
import StrukModal from '../../components/dashboard/StrukModal'
import { AuthContext } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import useDebounce from '../../hooks/useDebounce'
import './Struk.css'

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function parseName(pembayar = '') {
  const match = pembayar.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/)
  return match?.[1]?.trim() ?? pembayar
}

export default function Struk() {
  const { user } = useContext(AuthContext)
  const isBendahara = user?.role === 'bendahara'

  const { pembayaran, refetchPembayaran } = useData()
  const [search, setSearch] = useState('')
  const [strukRow, setStrukRow] = useState(null)

  const allRows = useMemo(() => pembayaran.filter(r => r.status === 'Lunas'), [pembayaran])
  const debouncedSearch = useDebounce(search, 250)

  const filtered = useMemo(() => {
    if (!debouncedSearch) return allRows
    const q = debouncedSearch.toLowerCase()
    return allRows.filter(r =>
      (r.pembayar || '').toLowerCase().includes(q) ||
      (r.strukNo || '').toLowerCase().includes(q) ||
      (r.produk || '').toLowerCase().includes(q)
    )
  }, [allRows, debouncedSearch])

  const totalNilai = allRows.reduce((sum, r) =>
    sum + (r.jumlahRaw || parseInt(String(r.jumlah || '0').replace(/\D/g, ''), 10) || 0), 0)

  const STAT_CARDS = [
    {
      label: 'Total Struk',
      value: allRows.length,
      desc: 'Struk pembayaran lunas',
      icon: Receipt,
      iconBg: '#EAF3FF',
      iconColor: '#1769E0',
    },
    {
      label: 'Total Nilai',
      value: `Rp ${totalNilai.toLocaleString('id-ID')}`,
      desc: 'Total dari semua transaksi lunas',
      icon: TrendingUp,
      iconBg: '#EAF3FF',
      iconColor: '#1769E0',
    },
    {
      label: 'Transaksi Lunas',
      value: allRows.length,
      desc: 'Siap dicetak',
      icon: CheckCircle,
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
    },
  ]

  return (
    <div className="page">
      {/* Heading */}
      <div className="sk__heading">
        <div>
          <h2 className="sk__title">Struk Pembayaran</h2>
          <p className="sk__subtitle">
            Daftar struk pembayaran yang telah lunas. Klik "Cetak Struk" untuk melihat dan menyimpan struk sebagai PNG.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="sk__stats">
        {STAT_CARDS.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="skstat">
              <div className="skstat__left">
                <p className="skstat__label">{card.label}</p>
                <p className="skstat__value">{card.value}</p>
                <p className="skstat__desc">{card.desc}</p>
              </div>
              <div className="skstat__icon" style={{ background: card.iconBg }}>
                <Icon size={20} color={card.iconColor} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Table card */}
      <div className="sk-card">
        <div className="sk-card__header">
          <div>
            <h3 className="sk-card__title">Daftar Struk</h3>
            <p className="sk-card__desc">Semua pembayaran berstatus Lunas siap dicetak.</p>
          </div>
          <div className="sk-card__search-wrap">
            <Search size={14} className="sk-card__search-icon" />
            <input
              type="search"
              className="sk-card__search"
              placeholder="Cari nama, no struk, atau produk..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sk-table-wrap">
          <table className="sk-table">
            <thead>
              <tr>
                <th className="sk-table__th sk-table__th--no">No</th>
                <th className="sk-table__th">No Struk</th>
                <th className="sk-table__th">Nama Pembayar</th>
                <th className="sk-table__th">Produk</th>
                <th className="sk-table__th">Tanggal</th>
                <th className="sk-table__th">Jumlah</th>
                <th className="sk-table__th">Keterangan</th>
                <th className="sk-table__th sk-table__th--action">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="sk-table__empty">Belum ada struk yang tersedia.</td>
                </tr>
              ) : (
                filtered.map((row, i) => {
                  const name = parseName(row.pembayar)
                  const initials = getInitials(name)
                  return (
                    <tr key={i} className="sk-table__row">
                      <td className="sk-table__td sk-table__td--no">{i + 1}</td>
                      <td className="sk-table__td">
                        <span className="sk-struk-no">{row.strukNo || '—'}</span>
                      </td>
                      <td className="sk-table__td">
                        <div className="sk-table__payer">
                          <div className="sk-table__avatar">{initials}</div>
                          <span className="sk-table__payer-name">{name}</span>
                        </div>
                      </td>
                      <td className="sk-table__td sk-table__td--muted">{row.produk || '—'}</td>
                      <td className="sk-table__td sk-table__td--muted">{row.tanggal || '—'}</td>
                      <td className="sk-table__td sk-table__td--amount">{row.jumlah || '—'}</td>
                      <td className="sk-table__td sk-table__td--muted sk-table__td--ket">{row.keterangan || '—'}</td>
                      <td className="sk-table__td sk-table__td--action">
                        <button className="sk-btn-print" onClick={() => setStrukRow(row)}>
                          <Printer size={12} />
                          Cetak Struk
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="sk-card__footer">
          <span className="sk-card__count">
            Menampilkan {filtered.length} dari {allRows.length} struk
          </span>
        </div>
      </div>

      {strukRow && (
        <StrukModal
          payment={strukRow}
          onClose={() => setStrukRow(null)}
          canEditKet={isBendahara}
          onKeteranganSaved={refetchPembayaran}
        />
      )}
    </div>
  )
}
