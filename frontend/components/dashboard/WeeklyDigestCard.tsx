'use client'

import { CalendarRange, Dumbbell, Flame, Salad, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useWeeklyDigest } from '@/hooks/useDashboard'
import { cn } from '@/lib/utils/cn'
import { formatDateShort } from '@/lib/utils/format'

function Row({
  icon,
  label,
  value,
  hint,
  valueClassName,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <p className={cn('text-sm font-bold tabular-nums shrink-0', valueClassName)}>
        {value}
      </p>
    </div>
  )
}

const kcal = (n: number) => `${Math.round(n).toLocaleString()} kcal`
const days = (n: number) => `${n} day${n !== 1 ? 's' : ''}`

/**
 * Net shown on screen is derived from the *rounded* in/out figures rather than
 * rounding the server's net separately, so the three numbers always add up to
 * a reader checking them. Rounding each independently drifts by up to 1 kcal,
 * and Math.round is asymmetric at .5 (511.5 -> 512 but -511.5 -> -511), which
 * made "0 in, 512 out" display a net of -511.
 */
function displayedNet(consumed: number, burned: number): string {
  return kcal(Math.round(consumed) - Math.round(burned))
}

export function WeeklyDigestCard() {
  const { data, isLoading } = useWeeklyDigest()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const goalHint =
    data.workout_goal != null
      ? `Goal ${data.workout_goal} this week`
      : 'No weekly workout goal set'
  const hitGoal = data.workout_goal != null && data.workouts_completed >= data.workout_goal

  const delta = data.weight_delta_kg

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarRange className="h-4 w-4 text-primary" />
            This Week
          </CardTitle>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatDateShort(data.week_start)} – {formatDateShort(data.week_end)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-1 divide-y">
        <Row
          icon={<Dumbbell className="h-4 w-4" />}
          label="Workouts"
          hint={goalHint}
          value={
            data.workout_goal != null
              ? `${data.workouts_completed} / ${data.workout_goal}`
              : String(data.workouts_completed)
          }
          valueClassName={hitGoal ? 'text-emerald-500' : undefined}
        />

        <Row
          icon={<Flame className="h-4 w-4" />}
          label="Net calories"
          hint={
            data.calories_burned != null
              ? `${kcal(data.calories_consumed)} in · ${kcal(data.calories_burned)} out`
              : `${kcal(data.calories_consumed)} in · nothing burned yet`
          }
          value={
            data.net_calories != null && data.calories_burned != null
              ? displayedNet(data.calories_consumed, data.calories_burned)
              : '—'
          }
        />

        <Row
          icon={<Scale className="h-4 w-4" />}
          label="Weight change"
          hint="vs. a week ago"
          value={
            delta != null
              ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg`
              : '—'
          }
          valueClassName={
            delta == null || delta === 0
              ? undefined
              : delta > 0
                ? 'text-orange-500'
                : 'text-emerald-500'
          }
        />

        <Row
          icon={<Salad className="h-4 w-4" />}
          label="Active streaks"
          hint={`${days(data.workout_streak)} workouts · ${days(data.nutrition_streak)} nutrition`}
          value={days(Math.max(data.workout_streak, data.nutrition_streak))}
          valueClassName={
            data.workout_streak > 0 || data.nutrition_streak > 0
              ? 'text-orange-500'
              : undefined
          }
        />
      </CardContent>
    </Card>
  )
}
