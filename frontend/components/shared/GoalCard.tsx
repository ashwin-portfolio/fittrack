'use client'

import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useActiveGoal } from '@/hooks/useGoals'
import { useWeightHistory } from '@/hooks/useWeight'
import type { GoalType } from '@/types/goal'

const GOAL_LABELS: Record<GoalType, string> = {
  weight_loss:  'Lose Weight',
  weight_gain:  'Gain Weight',
  muscle_gain:  'Build Muscle',
  maintenance:  'Maintain Weight',
}

const WEIGHT_GOAL_TYPES = new Set<GoalType>(['weight_loss', 'weight_gain', 'muscle_gain'])

function computeProgress(
  goalType: GoalType,
  starting: number,
  current: number,
  target: number,
): number {
  if (goalType === 'weight_loss') {
    if (starting <= target) return 0
    return Math.min(100, Math.max(0, ((starting - current) / (starting - target)) * 100))
  }
  // weight_gain / muscle_gain
  if (target <= starting) return 0
  return Math.min(100, Math.max(0, ((current - starting) / (target - starting)) * 100))
}

export function GoalCard() {
  const { data: goal, isLoading: goalLoading } = useActiveGoal()
  const { data: history, isLoading: weightLoading } = useWeightHistory({ days: 365 })

  const isLoading = goalLoading || weightLoading

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    )
  }

  if (!goal) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
          <Target className="h-4 w-4 shrink-0" />
          <span>No active goal set. Add one in your profile.</span>
        </CardContent>
      </Card>
    )
  }

  const isWeightGoal = WEIGHT_GOAL_TYPES.has(goal.goal_type) && goal.target_weight_kg != null
  const current = history?.latest_weight_kg
  const starting = history?.first_weight_kg
  const target = goal.target_weight_kg

  const progress =
    isWeightGoal && current != null && starting != null && target != null
      ? computeProgress(goal.goal_type, starting, current, target)
      : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Target className="h-4 w-4 text-primary" />
          {GOAL_LABELS[goal.goal_type] ?? goal.goal_type}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isWeightGoal && current != null && target != null ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Current:{' '}
                <span className="font-semibold text-foreground">{current.toFixed(1)} kg</span>
              </span>
              <span className="text-muted-foreground">
                Target:{' '}
                <span className="font-semibold text-foreground">{target.toFixed(1)} kg</span>
              </span>
            </div>

            {progress != null && (
              <>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Progress:{' '}
                  <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
                </p>
              </>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Keep going — stay consistent.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
