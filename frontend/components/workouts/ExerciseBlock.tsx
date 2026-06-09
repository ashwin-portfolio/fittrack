'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MUSCLE_GROUP_LABELS } from '@/lib/constants/workout'
import { cn } from '@/lib/utils/cn'
import type { WorkoutFormValues } from '@/lib/validators/workout'
import type { MuscleGroup } from '@/types/workout'

interface ExerciseBlockProps {
  exerciseIndex: number
  exerciseName: string
  muscleGroup: MuscleGroup
  onRemove: () => void
}

export function ExerciseBlock({
  exerciseIndex,
  exerciseName,
  muscleGroup,
  onRemove,
}: ExerciseBlockProps) {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<WorkoutFormValues>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  })

  function addSet() {
    const sets = getValues(`exercises.${exerciseIndex}.sets`)
    const last = sets[sets.length - 1]
    append({
      set_number: fields.length + 1,
      reps: last?.reps ?? 10,
      weight_kg: last?.weight_kg ?? 0,
    })
  }

  const exerciseErrors = errors.exercises?.[exerciseIndex]

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-muted/30">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{exerciseName}</p>
          <p className="text-xs text-muted-foreground">
            {MUSCLE_GROUP_LABELS[muscleGroup]}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
          aria-label="Remove exercise"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-2">
        {/* Column headers */}
        <div className="grid grid-cols-[28px_1fr_1fr_28px] gap-2 px-0.5">
          <span className="text-xs font-medium text-muted-foreground text-center">#</span>
          <span className="text-xs font-medium text-muted-foreground">Reps</span>
          <span className="text-xs font-medium text-muted-foreground">kg</span>
          <span />
        </div>

        {/* Set rows */}
        {fields.map((field, setIndex) => {
          const setErr = exerciseErrors?.sets?.[setIndex]
          return (
            <div
              key={field.id}
              className="grid grid-cols-[28px_1fr_1fr_28px] items-center gap-2"
            >
              <span className="text-xs text-center text-muted-foreground font-medium tabular-nums">
                {setIndex + 1}
              </span>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={999}
                {...register(
                  `exercises.${exerciseIndex}.sets.${setIndex}.reps`,
                  { valueAsNumber: true },
                )}
                placeholder="10"
                className={cn('h-9 text-center', setErr?.reps && 'border-destructive')}
              />
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                max={1000}
                step={0.5}
                {...register(
                  `exercises.${exerciseIndex}.sets.${setIndex}.weight_kg`,
                  { valueAsNumber: true },
                )}
                placeholder="0"
                className={cn('h-9 text-center', setErr?.weight_kg && 'border-destructive')}
              />
              <button
                type="button"
                onClick={() => remove(setIndex)}
                disabled={fields.length === 1}
                className="flex h-9 w-7 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors disabled:opacity-25 disabled:pointer-events-none"
                aria-label="Remove set"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}

        {exerciseErrors?.sets && (
          <p className="text-xs text-destructive">
            {typeof exerciseErrors.sets === 'object' && 'message' in exerciseErrors.sets
              ? String(exerciseErrors.sets.message)
              : null}
          </p>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addSet}
          className="w-full text-muted-foreground mt-1"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Set
        </Button>
      </div>
    </div>
  )
}
