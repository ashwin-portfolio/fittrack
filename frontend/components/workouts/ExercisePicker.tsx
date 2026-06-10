'use client'

import { useState } from 'react'
import { Loader2, Plus, Search, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useExercises, useCreateExercise } from '@/hooks/useExercises'
import { MUSCLE_GROUP_FILTER, MUSCLE_GROUP_LABELS } from '@/lib/constants/workout'
import { cn } from '@/lib/utils/cn'
import type { Exercise, MuscleGroup } from '@/types/workout'

interface ExercisePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (exercise: Exercise) => void
}

export function ExercisePicker({ open, onOpenChange, onSelect }: ExercisePickerProps) {
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('other')

  const { data, isLoading } = useExercises({
    q: search || undefined,
    muscle_group: muscleFilter,
    limit: 150,
  })
  const createExercise = useCreateExercise()

  const exercises = data?.exercises ?? []

  function handleSelect(exercise: Exercise) {
    onSelect(exercise)
    // keep sheet open for multi-add
  }

  async function handleCreate() {
    if (!newName.trim()) return
    createExercise.mutate(
      { name: newName.trim(), muscle_group: newMuscle },
      {
        onSuccess: (exercise) => {
          onSelect(exercise)
          setShowCreate(false)
          setNewName('')
          setNewMuscle('other')
        },
      },
    )
  }

  function handleClose(open: boolean) {
    if (!open) {
      setSearch('')
      setMuscleFilter(null)
      setShowCreate(false)
    }
    onOpenChange(open)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b">
          <SheetTitle>Add Exercise</SheetTitle>
        </SheetHeader>

        {showCreate ? (
          <div className="flex flex-col gap-4 p-4">
            <p className="text-sm font-medium">New custom exercise</p>
            <div className="space-y-3">
              <Input
                placeholder="Exercise name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <select
                value={newMuscle}
                onChange={(e) => setNewMuscle(e.target.value as MuscleGroup)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {MUSCLE_GROUP_FILTER.filter((g) => g.value !== null).map((g) => (
                  <option key={g.value} value={g.value!}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={!newName.trim() || createExercise.isPending}
              >
                {createExercise.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 space-y-3 border-b">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-9"
                  autoFocus
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Muscle group filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {MUSCLE_GROUP_FILTER.map(({ value, label }) => (
                  <button
                    key={value ?? 'all'}
                    onClick={() => setMuscleFilter(value)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                      muscleFilter === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {isLoading ? (
                <div className="space-y-1 px-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : exercises.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">No exercises found.</p>
                  {search.trim() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setNewName(search.trim()); setShowCreate(true) }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create &quot;{search}&quot;
                    </Button>
                  )}
                </div>
              ) : (
                exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleSelect(exercise)}
                    className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="border-t px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create custom exercise
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
