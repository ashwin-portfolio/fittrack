import Link from 'next/link'
import { ChevronRight, Dumbbell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/format'
import type { WorkoutSummary } from '@/types/workout'

interface WorkoutCardProps {
  workout: WorkoutSummary
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Link href={`/workouts/${workout.id}`}>
      <Card className="hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {workout.name ?? 'Workout'}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatDate(workout.session_date)}
              {' · '}
              {workout.exercise_count} exercise{workout.exercise_count !== 1 ? 's' : ''}
              {' · '}
              {workout.total_sets} set{workout.total_sets !== 1 ? 's' : ''}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}
