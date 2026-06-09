'use client'

import { Dumbbell, Scale, Utensils } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatRelative } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { DashboardActivity, DashboardActivityType } from '@/types/dashboard'

const ACTIVITY_CONFIG: Record<
  DashboardActivityType,
  { icon: React.ReactNode; colorClass: string }
> = {
  workout: {
    icon: <Dumbbell className="h-3.5 w-3.5" />,
    colorClass: 'bg-blue-500/10 text-blue-500',
  },
  meal: {
    icon: <Utensils className="h-3.5 w-3.5" />,
    colorClass: 'bg-emerald-500/10 text-emerald-500',
  },
  weight: {
    icon: <Scale className="h-3.5 w-3.5" />,
    colorClass: 'bg-amber-500/10 text-amber-500',
  },
}

interface RecentActivityProps {
  activities?: DashboardActivity[]
  isLoading?: boolean
}

export function RecentActivity({ activities, isLoading = false }: RecentActivityProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !activities?.length ? (
          <EmptyState
            title="No activity yet"
            description="Log a workout, meal, or weight entry to see it here."
            className="border-dashed py-8"
          />
        ) : (
          <div className="space-y-0.5">
            {activities.map((activity, i) => {
              const config = ACTIVITY_CONFIG[activity.type]
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      config.colorClass,
                    )}
                  >
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-snug">
                      {activity.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(activity.occurred_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
