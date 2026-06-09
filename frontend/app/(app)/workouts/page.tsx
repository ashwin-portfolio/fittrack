import type { Metadata } from 'next'
import { WorkoutsListView } from '@/components/workouts/WorkoutsListView'

export const metadata: Metadata = { title: 'Workouts' }

export default function WorkoutsPage() {
  return <WorkoutsListView />
}
