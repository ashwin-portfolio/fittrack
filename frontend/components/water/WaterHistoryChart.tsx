'use client'

import { useState } from 'react'
import { Droplets } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useWaterHistory } from '@/hooks/useWater'
import { cn } from '@/lib/utils/cn'

const UNITS = [
  { value: 'ml', label: 'ml' },
  { value: 'glasses', label: 'Glasses' },
] as const

type Unit = (typeof UNITS)[number]['value']

const RANGES = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
] as const

interface ChartPoint {
  label: string
  date: string
  value: number
  total_ml: number
}

function formatValue(value: number, unit: Unit): string {
  return unit === 'ml'
    ? `${Math.round(value).toLocaleString()} ml`
    : `${value.toFixed(1)} glass${value === 1 ? '' : 'es'}`
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
  targetMl,
  glassMl,
}: TooltipProps<number, string> & { unit: Unit; targetMl: number; glassMl: number }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as ChartPoint
  const target = unit === 'ml' ? targetMl : targetMl / glassMl
  const pct = targetMl > 0 ? Math.round((d.total_ml / targetMl) * 100) : 0

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{formatValue(d.value, unit)}</p>
      <p className="text-xs text-muted-foreground">
        {pct}% of {formatValue(target, unit)} goal
      </p>
    </div>
  )
}

export function WaterHistoryChart() {
  const [unit, setUnit] = useState<Unit>('ml')
  const [days, setDays] = useState<number>(7)

  const { data, isLoading } = useWaterHistory(days)

  const glassMl = data?.glass_ml ?? 250
  const targetMl = data?.daily_target_ml ?? 0
  const toUnit = (ml: number) => (unit === 'ml' ? ml : ml / glassMl)

  const chartData: ChartPoint[] =
    data?.days.map((d) => ({
      label: d.day_label,
      date: d.date,
      value: toUnit(d.total_ml),
      total_ml: d.total_ml,
    })) ?? []

  const hasData = chartData.some((d) => d.total_ml > 0)

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Droplets className="h-4 w-4 text-sky-500" />
              Water History
            </CardTitle>
            <p className="text-xs text-muted-foreground">Last {days} days</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {RANGES.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setDays(r.days)}
                  aria-pressed={days === r.days}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    days === r.days
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div
              role="group"
              aria-label="Water unit"
              className="flex gap-1 rounded-md bg-muted p-0.5"
            >
              {UNITS.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setUnit(u.value)}
                  aria-pressed={unit === u.value}
                  className={cn(
                    'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                    unit === u.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {data && hasData && (
          <div className="flex gap-5 pt-1">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-bold tabular-nums">
                {formatValue(toUnit(data.total_ml), unit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg / day</p>
              <p className="text-sm font-bold tabular-nums">
                {formatValue(toUnit(data.average_ml), unit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="text-sm font-bold tabular-nums">
                {formatValue(toUnit(targetMl), unit)}
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : !hasData ? (
          <EmptyState
            title="No water logged yet"
            description="Log water to see your daily intake over time."
            className="h-[220px]"
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
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
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={36}
                tickFormatter={(v: number) =>
                  unit === 'ml' && v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`
                }
              />
              <Tooltip
                content={
                  <ChartTooltip unit={unit} targetMl={targetMl} glassMl={glassMl} />
                }
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
              />
              {targetMl > 0 && (
                <ReferenceLine
                  y={toUnit(targetMl)}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Goal',
                    position: 'insideTopRight',
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
              )}
              <Bar
                dataKey="value"
                name="Intake"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
