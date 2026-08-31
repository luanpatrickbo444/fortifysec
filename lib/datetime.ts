export const FORTIFY_TIME_ZONE = process.env.FORTIFY_TIME_ZONE || 'America/Cuiaba'

export function formatDateTimePtBr(value?: string | Date | null) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FORTIFY_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export function formatDatePtBr(value?: string | Date | null) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FORTIFY_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function localDateKey(value: string | Date = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: FORTIFY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function localWeekday(value: string | Date = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FORTIFY_TIME_ZONE,
    weekday: 'long',
  }).format(date)
}
