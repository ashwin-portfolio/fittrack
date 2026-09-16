'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StreakBadgeProps {
  currentStreak: number
  longestStreak: number
  /** Names what the streak counts, for the hover title. e.g. "nutrition". */
  label?: string
  className?: string
}

/**
 * Presentational streak pill. Nutrition and workouts each bind their own hook
 * and render this, so the two badges cannot drift apart visually.
 */
export function StreakBadge({
  currentStreak,
  longestStreak,
  label,
  className,
}: StreakBadgeProps) {
  const isActive = currentStreak > 0
  const days = (n: number) => `${n} day${n !== 1 ? 's' : ''}`

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        isActive
          ? 'border-orange-500/30 bg-orange-500/10 text-orange-500'
          : 'border-border text-muted-foreground',
        className,
      )}
      title={`Longest ${label ? label + ' ' : ''}streak: ${days(longestStreak)}`}
    >
      <Flame className={cn('h-3.5 w-3.5', isActive && 'fill-orange-500')} />
      <span className="tabular-nums">{days(currentStreak)}</span>
    </div>
  )
}
