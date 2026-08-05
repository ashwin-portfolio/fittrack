'use client'

import { GlassWater } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLogWater, useWaterDailySummary } from '@/hooks/useWater'

const QUICK_ADD_ML = [250, 500]

function todayLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function WaterWidget() {
  const date = todayLocal()
  const { data: summary, isLoading } = useWaterDailySummary(date)
  const logWater = useLogWater(date)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-28" />
            </div>
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalMl = summary?.total_ml ?? 0
  const goalMl = summary?.goal_ml ?? 2000
  const pct = Math.min((totalMl / goalMl) * 100, 100)
  const isOver = totalMl > goalMl

  const barColor = isOver ? 'bg-blue-600' : pct >= 90 ? 'bg-blue-500' : 'bg-blue-400'

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              Water Today
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {totalMl.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {goalMl.toLocaleString()} ml
              </span>
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GlassWater className="h-4 w-4" />
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex gap-2">
          {QUICK_ADD_ML.map((ml) => (
            <Button
              key={ml}
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={logWater.isPending}
              onClick={() => logWater.mutate({ amount_ml: ml, log_date: date })}
            >
              +{ml} ml
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
