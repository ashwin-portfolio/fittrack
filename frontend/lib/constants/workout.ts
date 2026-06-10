import type { MuscleGroup } from '@/types/workout'

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs',
  core: 'Core',
  cardio: 'Cardio',
  full_body: 'Full Body',
  other: 'Other',
}

export const MUSCLE_GROUP_FILTER: { value: MuscleGroup | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'other', label: 'Other' },
]
