'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useWeeklySummary } from '@/hooks/useNutrition'

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const consumed = payload.find((p) => p.dataKey === 'calories')?.value as number | undefined
  const goal = payload.find((p) => p.dataKey === 'goal')?.value as number | undefined
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{label}</p>
      {consumed != null && (
        <p className="font-semibold text-foreground">
          {Math.round(consumed).toLocaleString()} kcal consumed
        </p>
      )}
      {goal != null && (
        <p className="text-muted-foreground">{Math.round(goal).toLocaleString()} kcal goal</p>
      )}
    </div>
  )
}

export function WeeklyCalorieSummary() {
  const { data: summary, isLoading } = useWeeklySummary()

  const hasGoal = summary?.daily_goal != null
  const formatted = summary?.days.map((d) => ({
    label: d.day_label,
    calories: d.calories,
    goal: d.goal_calories ?? undefined,
  }))
  const hasData = formatted?.some((d) => d.calories > 0)

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-base font-semibold">Weekly Summary</CardTitle>
            <p className="text-xs text-muted-foreground">Mon – Sun, this week</p>
          </div>
          {summary && (
            <div className="flex gap-5 text-right">
              <div>
                <p className="text-sm font-bold tabular-nums">
                  {Math.round(summary.total_calories).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total kcal</p>
              </div>
              <div>
                <p className="text-sm font-bold tabular-nums">
                  {Math.round(summary.average_calories).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Avg / day</p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : !hasData ? (
          <EmptyState
            title="No nutrition data this week"
            description="Log meals to see your weekly calorie breakdown."
            className="h-[220px]"
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={formatted}
              margin={{ top: 4, right: 4, bottom: 0, left: -4 }}
              barCategoryGap="25%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={36}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`
                }
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="calories" name="Consumed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              {hasGoal && (
                <Bar dataKey="goal" name="Goal" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
