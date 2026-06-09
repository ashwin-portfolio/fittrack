'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ExercisePicker } from '@/components/workouts/ExercisePicker'
import { ExerciseBlock } from '@/components/workouts/ExerciseBlock'
import { workoutFormSchema, type WorkoutFormValues } from '@/lib/validators/workout'
import { useCreateWorkout } from '@/hooks/useWorkouts'
import type { Exercise } from '@/types/workout'

export function NewWorkoutView() {
  const router = useRouter()
  const createWorkout = useCreateWorkout()
  const [pickerOpen, setPickerOpen] = useState(false)

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      session_date: format(new Date(), 'yyyy-MM-dd'),
      name: '',
      notes: '',
      exercises: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  })

  function addExercise(exercise: Exercise) {
    append({
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      sets: [{ set_number: 1, reps: 10, weight_kg: 0 }],
    })
  }

  const onSubmit = form.handleSubmit((values) => {
    createWorkout.mutate(
      {
        session_date: values.session_date,
        name: values.name?.trim() || null,
        notes: values.notes?.trim() || null,
        exercises: values.exercises.map((ex) => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets.map((s, i) => ({
            set_number: i + 1,
            reps: s.reps,
            weight_kg: s.weight_kg,
          })),
        })),
      },
      {
        onSuccess: (workout) => {
          toast.success('Workout saved!')
          router.push(`/workouts/${workout.id}`)
        },
      },
    )
  })

  const exercisesError = form.formState.errors.exercises

  return (
    <FormProvider {...form}>
      <div className="space-y-5 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Link href="/workouts">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Log Workout</h1>
        </div>

        {/* Date + Name */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="session_date">
              Date
            </label>
            <Input
              id="session_date"
              type="date"
              {...form.register('session_date')}
              className={form.formState.errors.session_date ? 'border-destructive' : ''}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="workout_name">
              Name <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              id="workout_name"
              placeholder="e.g. Chest day"
              {...form.register('name')}
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Exercises
            </h2>
            {exercisesError && typeof exercisesError === 'object' && 'message' in exercisesError && (
              <p className="text-xs text-destructive">{String(exercisesError.message)}</p>
            )}
          </div>

          {fields.map((field, index) => (
            <ExerciseBlock
              key={field.id}
              exerciseIndex={index}
              exerciseName={field.exercise_name}
              muscleGroup={field.muscle_group as Parameters<typeof ExerciseBlock>[0]['muscleGroup']}
              onRemove={() => remove(index)}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setPickerOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {fields.length === 0 ? 'Add Exercise' : 'Add Another Exercise'}
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="notes">
            Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            id="notes"
            placeholder="How did it feel?"
            rows={3}
            {...form.register('notes')}
          />
        </div>

        {/* Submit */}
        <div
          className="fixed left-0 right-0 border-t bg-background p-4 md:static md:border-0 md:bg-transparent md:p-0"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
        >
          <Button
            className="w-full md:w-auto"
            size="lg"
            onClick={onSubmit}
            disabled={createWorkout.isPending}
          >
            {createWorkout.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Workout
          </Button>
        </div>
      </div>

      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={addExercise}
      />
    </FormProvider>
  )
}
