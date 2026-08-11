'use client'

import { useState } from 'react'
import { GlassWater, Target, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SetWaterGoalDialog } from './SetWaterGoalDialog'
import { useDeleteWaterEntry, useLogWater, useWaterDailySummary } from '@/hooks/useWater'
import { formatTime } from '@/lib/utils/format'

const QUICK_ADD_ML = [250, 500, 750]

interface WaterDaySummaryProps {
  date: string
}

export function WaterDaySummary({ date }: WaterDaySummaryProps) {
  const { data: summary, isLoading } = useWaterDailySummary(date)
  const logWater = useLogWater(date)
  const deleteEntry = useDeleteWaterEntry(date)
  const [goalOpen, setGoalOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalMl = summary?.total_ml ?? 0
  const goalMl = summary?.goal_ml ?? 2000
  const pct = Math.min((totalMl / goalMl) * 100, 100)
  const isOver = totalMl > goalMl
  const remaining = goalMl - totalMl

  const barColor = isOver
    ? 'bg-blue-600'
    : pct >= 90
      ? 'bg-blue-500'
      : 'bg-blue-400'

  const entries = summary?.entries ?? []

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Water today
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {totalMl.toLocaleString()}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  / {goalMl.toLocaleString()} ml
                </span>
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGoalOpen(true)}
              aria-label="Set water goal"
            >
              <Target className="h-4 w-4 mr-1.5" />
              Goal
            </Button>
          </div>

          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              {isOver
                ? `${Math.abs(remaining).toLocaleString()} ml over goal`
                : `${remaining.toLocaleString()} ml remaining`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_ADD_ML.map((ml) => (
              <Button
                key={ml}
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={logWater.isPending}
                onClick={() => logWater.mutate({ amount_ml: ml, log_date: date })}
              >
                <GlassWater className="h-3.5 w-3.5" />+{ml} ml
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card>
          <CardContent className="p-0 divide-y">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors group"
              >
                <GlassWater className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium tabular-nums">{entry.amount_ml} ml</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTime(entry.created_at)}
                  </span>
                </div>
                <button
                  onClick={() => setPendingDeleteId(entry.id)}
                  className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Delete entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <SetWaterGoalDialog open={goalOpen} onOpenChange={setGoalOpen} />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete entry?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        isPending={deleteEntry.isPending}
        onConfirm={() => {
          if (!pendingDeleteId) return
          deleteEntry.mutate(pendingDeleteId, {
            onSuccess: () => setPendingDeleteId(null),
          })
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
