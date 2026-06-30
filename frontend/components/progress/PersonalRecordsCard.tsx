'use client'

import { Loader2, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePersonalRecords } from '@/hooks/useWorkouts'
import { MUSCLE_GROUP_LABELS } from '@/lib/constants/workout'
import type { MuscleGroup } from '@/types/workout'
import { formatDate } from '@/lib/utils/format'

export function PersonalRecordsCard() {
  const { data, isLoading } = usePersonalRecords()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-amber-500" />
          Personal Records
          {data && data.total > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {data.total} exercise{data.total !== 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.records.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Log workouts with weights to see your personal records here.
          </p>
        ) : (
          <div className="divide-y">
            {data.records.map((pr) => (
              <div
                key={pr.exercise_id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pr.exercise_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-auto capitalize">
                      {MUSCLE_GROUP_LABELS[pr.muscle_group as MuscleGroup] ?? pr.muscle_group}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {pr.times_performed}× performed
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums">{pr.max_weight_kg} kg</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatDate(pr.achieved_on)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
