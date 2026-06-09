import type { Metadata } from 'next'
import { WorkoutDetailView } from '@/components/workouts/WorkoutDetailView'

export const metadata: Metadata = { title: 'Workout' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function WorkoutDetailPage({ params }: Props) {
  const { id } = await params
  return <WorkoutDetailView workoutId={id} />
}
