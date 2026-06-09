'use client'

import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useWeightHistory } from '@/hooks/useWeight'
import { formatDateShort, formatDate } from '@/lib/utils/format'

const RANGES = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '180d', days: 180 },
  { label: '1y', days: 365 },
] as const

type RangeDays = (typeof RANGES)[number]['days']

interface ChartPoint {
  label: string
  date: string
  weight_kg: number
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as ChartPoint
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md space-y-0.5">
      <p className="text-xs text-muted-foreground">{formatDate(d.date)}</p>
      <p className="font-semibold">{d.weight_kg.toFixed(1)} kg</p>
    </div>
  )
}

export function WeightHistoryChart() {
  const [days, setDays] = useState<RangeDays>(90)
  const { data, isLoading } = useWeightHistory({ days })

  const chartData: ChartPoint[] = (data?.items ?? [])
    .slice()
    .sort((a, b) => a.log_date.localeCompare(b.log_date))
    .map((e) => ({
      label: formatDateShort(e.log_date),
      date: e.log_date,
      weight_kg: e.weight_kg,
    }))

  const weights = chartData.map((d) => d.weight_kg)
  const minW = weights.length ? Math.min(...weights) : 0
  const maxW = weights.length ? Math.max(...weights) : 100
  const pad = (maxW - minW) * 0.2 || 2

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold">Weight History</CardTitle>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.label}
                size="sm"
                variant={days === r.days ? 'default' : 'ghost'}
                className="h-7 px-2.5 text-xs"
                onClick={() => setDays(r.days)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : !chartData.length ? (
          <EmptyState
            title="No weight data"
            description="Log your first weight entry to see your history chart."
            className="h-[280px]"
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minW - pad, maxW + pad]}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
                width={34}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="weight_kg"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={chartData.length <= 30 ? { r: 3, strokeWidth: 0, fill: 'hsl(var(--primary))' } : false}
                activeDot={{ r: 5, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
