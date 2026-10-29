const ID_MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Ags: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
}

export function parseIdDate(str) {
  if (!str) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str.slice(0, 10) + 'T00:00:00')
    return isNaN(d) ? null : d
  }
  const parts = String(str).trim().split(/\s+/)
  const day = parseInt(parts[0], 10)
  const mon = ID_MONTHS[parts[1]]
  const year = parseInt(parts[2], 10)
  if (isNaN(day) || mon === undefined || isNaN(year)) return null
  return new Date(year, mon, day)
}

export function formatIdDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr.slice(0, 10) + 'T00:00:00')
  if (isNaN(d)) return isoStr
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function displayDate(str) {
  if (!str) return '-'
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return formatIdDate(str)
  return str
}

export function matchesMonth(str, yearMonth) {
  if (!yearMonth) return true
  const d = parseIdDate(str)
  if (!d) return false
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  return ym === yearMonth
}

export const todayISO = () => new Date().toISOString().slice(0, 10)

export function toInputDate(str) {
  if (!str) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10)
  const d = parseIdDate(str)
  if (!d) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
