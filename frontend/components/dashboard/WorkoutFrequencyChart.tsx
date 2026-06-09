'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import type { WorkoutFrequencyPoint } from '@/types/dashboard'

interface WorkoutFrequencyChartProps {
  data?: WorkoutFrequencyPoint[]
  isLoading?: boolean
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const count = payload[0].value as number
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">
        {count} workout{count !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export function WorkoutFrequencyChart({ data, isLoading = false }: WorkoutFrequencyChartProps) {
  const maxCount = data?.length ? Math.max(...data.map((d) => d.count), 1) : 1

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-semibold">Workout Frequency</CardTitle>
        <p className="text-xs text-muted-foreground">Last 8 weeks</p>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : !data?.length ? (
          <EmptyState
            title="No workout data"
            description="Log workouts to see your weekly frequency."
            className="h-[220px]"
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
              barCategoryGap="35%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, maxCount + 1]}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={20}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === data.length - 1 ? '#3b82f6' : '#93c5fd'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
