import type { Metadata } from 'next'
import { NutritionListView } from '@/components/nutrition/NutritionListView'

export const metadata: Metadata = { title: 'Nutrition' }

export default function NutritionPage() {
  return <NutritionListView />
}
