'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Share2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useWorkout, useDeleteWorkout } from '@/hooks/useWorkouts'
import { MUSCLE_GROUP_LABELS } from '@/lib/constants/workout'
import { formatDate } from '@/lib/utils/format'
import type { WorkoutExercise } from '@/types/workout'

interface WorkoutDetailViewProps {
  workoutId: string
}

export function WorkoutDetailView({ workoutId }: WorkoutDetailViewProps) {
  const router = useRouter()
  const { data: workout, isLoading, isError } = useWorkout(workoutId)
  const deleteWorkout = useDeleteWorkout()
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (isError) router.replace('/workouts')
  }, [isError, router])

  if (isLoading) return <WorkoutDetailSkeleton />
  if (!workout) return null

  const totalSets = workout.exercises.reduce((n, ex) => n + ex.sets.length, 0)
  const totalVolume = workout.exercises.reduce(
    (n, ex) => n + ex.sets.reduce((s, set) => s + set.reps * set.weight_kg, 0),
    0,
  )

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-start gap-2">
        <Link href="/workouts">
          <Button variant="ghost" size="icon" className="shrink-0 mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">
            {workout.name ?? 'Workout'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(workout.session_date)}
          </p>
        </div>
        <Link href={`/workouts/${workoutId}/edit`}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Exercises</p>
          <p className="font-semibold">{workout.exercises.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Sets</p>
          <p className="font-semibold">{totalSets}</p>
        </div>
        {totalVolume > 0 && (
          <div>
            <p className="text-muted-foreground text-xs">Volume</p>
            <p className="font-semibold">
              {totalVolume >= 1000
                ? `${(totalVolume / 1000).toFixed(1)}k`
                : totalVolume.toFixed(0)}{' '}
              kg
            </p>
          </div>
        )}
        {workout.is_shared && (
          <div className="flex items-center gap-1 text-primary text-xs font-medium">
            <Share2 className="h-3 w-3" />
            Shared
          </div>
        )}
      </div>

      {/* Notes */}
      {workout.notes && (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          {workout.notes}
        </p>
      )}

      {/* Exercise list */}
      <div className="space-y-4">
        {workout.exercises.map((exercise) => (
          <ExerciseDetailCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete workout?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        isPending={deleteWorkout.isPending}
        onConfirm={() =>
          deleteWorkout.mutate(workoutId, {
            onSuccess: () => router.push('/workouts'),
          })
        }
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}

function ExerciseDetailCard({ exercise }: { exercise: WorkoutExercise }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{exercise.exercise_name}</p>
          </div>
          <Badge variant="muted" className="shrink-0">
            {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 px-1 pb-1">
            <span className="text-xs font-medium text-muted-foreground">Set</span>
            <span className="text-xs font-medium text-muted-foreground">Reps</span>
            <span className="text-xs font-medium text-muted-foreground">Weight</span>
          </div>
          {exercise.sets.map((set) => (
            <div
              key={set.id}
              className="grid grid-cols-3 gap-2 rounded-md px-1 py-1.5 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm tabular-nums">{set.set_number}</span>
              <span className="text-sm tabular-nums">{set.reps}</span>
              <span className="text-sm tabular-nums">
                {set.weight_kg > 0 ? `${set.weight_kg} kg` : 'BW'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function WorkoutDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-8" />
          </div>
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
