import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { WeightHistory } from '@/types/weight'

interface WeightStatsCardsProps {
  history?: WeightHistory
  isLoading?: boolean
}

interface StatCardProps {
  label: string
  value: string
  sub?: React.ReactNode
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        {sub && <div className="mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  )
}

export function WeightStatsCards({ history, isLoading }: WeightStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const current = history?.latest_weight_kg
  const starting = history?.first_weight_kg
  const change = history?.total_change_kg

  const changeNode = (() => {
    if (change === null || change === undefined) return null
    if (Math.abs(change) < 0.05)
      return (
        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <Minus className="h-3 w-3" />
          No change
        </span>
      )
    if (change < 0)
      return (
        <span className="flex items-center gap-0.5 text-xs text-emerald-500">
          <TrendingDown className="h-3 w-3" />
          {change.toFixed(1)} kg
        </span>
      )
    return (
      <span className="flex items-center gap-0.5 text-xs text-rose-500">
        <TrendingUp className="h-3 w-3" />+{change.toFixed(1)} kg
      </span>
    )
  })()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard
        label="Current"
        value={current != null ? `${current.toFixed(1)} kg` : '—'}
      />
      <StatCard
        label="Starting"
        value={starting != null ? `${starting.toFixed(1)} kg` : '—'}
      />
      <StatCard
        label="Total change"
        value={change != null ? `${change > 0 ? '+' : ''}${change.toFixed(1)} kg` : '—'}
        sub={changeNode}
      />
    </div>
  )
}
