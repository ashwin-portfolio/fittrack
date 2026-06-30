'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useExerciseHistory, useLoggedExercises } from '@/hooks/useWorkouts'
import { formatDate, formatDateShort } from '@/lib/utils/format'
import type { ExerciseHistoryEntry } from '@/types/workout'

const RANGES = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '180d', days: 180 },
  { label: 'All', days: null },
] as const

type RangeDays = (typeof RANGES)[number]['days']

interface ChartPoint {
  label: string
  date: string
  weight_kg: number
  volume_kg: number
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as ChartPoint
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md space-y-0.5">
      <p className="text-xs text-muted-foreground">{formatDate(d.date)}</p>
      <p className="font-semibold">{d.weight_kg.toFixed(1)} kg</p>
      <p className="text-xs text-muted-foreground">Vol: {d.volume_kg.toFixed(0)} kg</p>
    </div>
  )
}

function filterByDays(
  entries: ExerciseHistoryEntry[],
  days: number | null,
): ExerciseHistoryEntry[] {
  if (!days) return entries
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  return entries.filter((e) => e.session_date >= cutoffStr)
}

export function ExerciseProgressionChart() {
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [days, setDays] = useState<RangeDays>(null)

  const { data: loggedData, isLoading: loadingExercises } = useLoggedExercises()
  const { data: historyData, isLoading: loadingHistory } = useExerciseHistory(exerciseId)

  const filteredEntries = historyData ? filterByDays(historyData.entries, days) : []

  const chartData: ChartPoint[] = filteredEntries.map((e) => ({
    label: formatDateShort(e.session_date),
    date: e.session_date,
    weight_kg: e.max_weight_kg,
    volume_kg: e.total_volume_kg,
  }))

  const weights = chartData.map((d) => d.weight_kg)
  const minW = weights.length ? Math.min(...weights) : 0
  const maxW = weights.length ? Math.max(...weights) : 100
  const pad = (maxW - minW) * 0.2 || 2

  const allTimePeak = historyData?.entries.length
    ? Math.max(...historyData.entries.map((e) => e.max_weight_kg))
    : null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Exercise Progression
          </CardTitle>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.label}
                size="sm"
                variant={days === r.days ? 'default' : 'ghost'}
                className="h-7 px-2.5 text-xs"
                onClick={() => setDays(r.days)}
                disabled={!exerciseId}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        <Select
          value={exerciseId ?? ''}
          onValueChange={(v) => {
            setExerciseId(v || null)
            setDays(null)
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue
              placeholder={
                loadingExercises ? 'Loading…' : 'Select an exercise to see progression'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(loggedData?.exercises ?? []).map((ex) => (
              <SelectItem key={ex.exercise_id} value={ex.exercise_id}>
                {ex.exercise_name}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({ex.session_count}×)
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="pt-0">
        {!exerciseId ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            Pick an exercise above to see your progression.
          </div>
        ) : loadingHistory ? (
          <Skeleton className="h-[220px] w-full" />
        ) : !chartData.length ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No data in this range. Try a wider range or log some workouts.
          </div>
        ) : (
          <>
            <div className="mb-4 flex gap-6 text-sm">
              {allTimePeak !== null && (
                <div>
                  <p className="text-xs text-muted-foreground">All-time peak</p>
                  <p className="font-semibold tabular-nums">{allTimePeak.toFixed(1)} kg</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Total sessions</p>
                <p className="font-semibold tabular-nums">{historyData!.total_sessions}</p>
              </div>
              {days !== null && (
                <div>
                  <p className="text-xs text-muted-foreground">In range</p>
                  <p className="font-semibold tabular-nums">{chartData.length}</p>
                </div>
              )}
            </div>

            <ResponsiveContainer width="100%" height={220}>
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
                  domain={[Math.max(0, minW - pad), maxW + pad]}
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
                  dot={
                    chartData.length <= 30
                      ? { r: 3, strokeWidth: 0, fill: 'hsl(var(--primary))' }
                      : false
                  }
                  activeDot={{ r: 5, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}
