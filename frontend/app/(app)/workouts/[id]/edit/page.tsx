import type { Metadata } from 'next'
import { EditWorkoutView } from '@/components/workouts/EditWorkoutView'

export const metadata: Metadata = { title: 'Edit Workout' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditWorkoutPage({ params }: Props) {
  const { id } = await params
  return <EditWorkoutView workoutId={id} />
}
