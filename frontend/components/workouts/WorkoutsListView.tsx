'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { WorkoutCard } from '@/components/workouts/WorkoutCard'
import { useWorkoutList } from '@/hooks/useWorkouts'

export function WorkoutsListView() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useWorkoutList()

  const workouts = data?.pages.flatMap((p) => p.workouts) ?? []
  const total = data?.pages[0]?.total ?? 0

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <PageHeader
        title="Workouts"
        subtitle={!isLoading && total > 0 ? `${total} total` : undefined}
        action={
          <Button asChild>
            <Link href="/workouts/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Log Workout
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState
          title="No workouts yet"
          description="Log your first workout to start tracking your progress."
          action={
            <Button asChild>
              <Link href="/workouts/new">
                <Plus className="h-4 w-4 mr-1.5" />
                Log Workout
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}

          {hasNextPage && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
