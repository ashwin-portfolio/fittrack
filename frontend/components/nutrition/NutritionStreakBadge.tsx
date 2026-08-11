'use client'

import { Flame } from 'lucide-react'
import { useNutritionStreak } from '@/hooks/useNutrition'

export function NutritionStreakBadge() {
  const { data: streak, isLoading } = useNutritionStreak()

  if (isLoading || !streak) return null

  const isActive = streak.current_streak > 0

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        isActive
          ? 'border-orange-500/30 bg-orange-500/10 text-orange-500'
          : 'border-border text-muted-foreground'
      }`}
      title={`Longest streak: ${streak.longest_streak} day${streak.longest_streak !== 1 ? 's' : ''}`}
    >
      <Flame className={`h-3.5 w-3.5 ${isActive ? 'fill-orange-500' : ''}`} />
      <span className="tabular-nums">
        {streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
