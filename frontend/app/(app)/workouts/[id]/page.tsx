import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Workout Detail' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function WorkoutDetailPage({ params }: Props) {
  const { id } = await params
  return <div className="space-y-6" data-workout-id={id}>{/* Workout detail coming next */}</div>
}
