import type { Metadata } from 'next'
import { NewWorkoutView } from '@/components/workouts/NewWorkoutView'

export const metadata: Metadata = { title: 'Log Workout' }

export default function NewWorkoutPage() {
  return <NewWorkoutView />
}
