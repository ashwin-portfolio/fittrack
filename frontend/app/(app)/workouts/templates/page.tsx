import type { Metadata } from 'next'
import { TemplatesView } from '@/components/workouts/TemplatesView'

export const metadata: Metadata = { title: 'Workout Templates' }

export default function TemplatesPage() {
  return <TemplatesView />
}
