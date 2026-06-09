import type { Metadata } from 'next'
import { NewNutritionView } from '@/components/nutrition/NewNutritionView'

export const metadata: Metadata = { title: 'Log Meal' }

function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default async function NewNutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const defaultDate = date ?? todayStr()
  return <NewNutritionView defaultDate={defaultDate} />
}
