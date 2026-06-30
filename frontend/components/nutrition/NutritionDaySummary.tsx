import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { CalorieGoal, DailySummary } from '@/types/nutrition'

interface NutritionDaySummaryProps {
  summary?: DailySummary
  goal?: CalorieGoal | null
  isLoading?: boolean
}

interface MacroPillProps {
  label: string
  value: number
  color: string
}

function MacroPill({ label, value, color }: MacroPillProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-sm font-semibold tabular-nums ${color}`}>
        {Math.round(value)}g
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function NutritionDaySummary({ summary, goal, isLoading }: NutritionDaySummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const calories = summary?.total_calories ?? 0
  const protein = summary?.total_protein_g ?? 0
  const carbs = summary?.total_carbs_g ?? 0
  const fat = summary?.total_fat_g ?? 0

  const hasGoal = goal && goal.daily_calories > 0
  const pct = hasGoal ? Math.min((calories / goal.daily_calories) * 100, 100) : 0
  const remaining = hasGoal ? goal.daily_calories - Math.round(calories) : 0
  const isOver = hasGoal && calories > goal.daily_calories

  const barColor = isOver
    ? 'bg-rose-500'
    : pct >= 90
      ? 'bg-amber-500'
      : 'bg-emerald-500'

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Calories today
            </p>
            <p className="text-3xl font-bold tabular-nums">
              {Math.round(calories).toLocaleString()}
              {hasGoal && (
                <span className="text-base font-normal text-muted-foreground ml-1">
                  / {goal.daily_calories.toLocaleString()} kcal
                </span>
              )}
              {!hasGoal && (
                <span className="text-base font-normal text-muted-foreground ml-1">kcal</span>
              )}
            </p>
          </div>
          <div className="flex gap-6">
            <MacroPill label="Protein" value={protein} color="text-blue-500" />
            <MacroPill label="Carbs" value={carbs} color="text-amber-500" />
            <MacroPill label="Fat" value={fat} color="text-rose-500" />
          </div>
        </div>

        {hasGoal && (
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              {isOver
                ? `${Math.abs(remaining).toLocaleString()} kcal over goal`
                : `${remaining.toLocaleString()} kcal remaining`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
