export const PUBLIC_PASSWORD = 'OesteM131268'
export const APP_NAME = 'Oeste de Maracanaú'
export const NAV_ITEMS = [
  { key: 'home', label: 'Início', icon: 'Home' },
  { key: 'map', label: 'Mapa', icon: 'Map' },
  { key: 'field', label: 'Campo', icon: 'CalendarDays' },
  { key: 'groups', label: 'Grupos', icon: 'UsersRound' },
  { key: 'more', label: 'Mais', icon: 'Menu' }
]
export const dayNames = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']

export function normalizeDate(date) {
  if (!date) return null
  if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : date
  const value = String(date).trim()
  if (!value) return null
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
  return Number.isNaN(d.getTime()) ? null : d
}

export const formatDate = (date) => {
  const d = normalizeDate(date)
  return d ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d) : '—'
}

export const formatShortDate = (date) => {
  const d = normalizeDate(date)
  return d ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d) : '—'
}

export const formatTime = (time) => String(time || '').slice(0, 5) || '—'

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const daysSince = (date) => {
  const d = normalizeDate(date)
  if (!d) return null
  const today = normalizeDate(todayISO())
  return Math.max(0, Math.floor((today - d) / 86400000))
}

export function weekdayIndex(schedule) {
  if (Number.isInteger(Number(schedule?.weekday))) return Number(schedule.weekday)
  const idx = dayNames.findIndex(x => x.toLowerCase() === String(schedule?.weekday_name || '').toLowerCase())
  return idx >= 0 ? idx : null
}

export function nextDateForWeekday(weekday, from = new Date(), weekOffset = 0) {
  const n = Number(weekday)
  if (!Number.isInteger(n) || n < 0 || n > 6) return null
  const d = new Date(from)
  d.setHours(12, 0, 0, 0)
  const delta = (n - d.getDay() + 7) % 7
  d.setDate(d.getDate() + delta + (Number(weekOffset) || 0) * 7)
  return d.toISOString().slice(0, 10)
}

export function scheduleDate(schedule, weekOffset = 0) {
  if (schedule?.service_date) {
    const d = normalizeDate(schedule.service_date)
    if (!d) return null
    d.setDate(d.getDate() + (Number(weekOffset) || 0) * 7)
    return d.toISOString().slice(0, 10)
  }
  return nextDateForWeekday(weekdayIndex(schedule), new Date(), weekOffset)
}

export function scheduleTime(schedule) {
  return schedule?.start_time || schedule?.time || ''
}

export function scheduleLabel(schedule) {
  const date = scheduleDate(schedule)
  const weekday = weekdayIndex(schedule)
  return date ? formatDate(date) : (weekday !== null ? dayNames[weekday] : 'Data não definida')
}
