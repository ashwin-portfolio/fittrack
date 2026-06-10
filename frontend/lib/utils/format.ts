import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(dateString: string, pattern = 'MMM d, yyyy'): string {
  return format(parseISO(dateString), pattern)
}

export function formatDateShort(dateString: string): string {
  return format(parseISO(dateString), 'MMM d')
}

export function formatDatetime(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy · h:mm a')
}

export function formatRelative(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
}

export function formatWeight(kg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') {
    return `${(kg * 2.20462).toFixed(1)} lbs`
  }
  return `${kg.toFixed(1)} kg`
}

export function formatCalories(kcal: number): string {
  return `${Math.round(kcal).toLocaleString()} kcal`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function formatMacro(grams: number | null): string {
  if (grams === null) return '—'
  return `${Math.round(grams)}g`
}

export function formatWeightDelta(delta: number | null): string {
  if (delta === null) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)} kg`
}
