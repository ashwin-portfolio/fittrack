'use client'

import { StreakBadge } from '@/components/shared/StreakBadge'
import { useWorkoutStreak } from '@/hooks/useWorkouts'

export function WorkoutStreakBadge() {
  const { data: streak, isLoading } = useWorkoutStreak()

  if (isLoading || !streak) return null

  return (
    <StreakBadge
      currentStreak={streak.current_streak}
      longestStreak={streak.longest_streak}
      label="workout"
    />
  )
}
