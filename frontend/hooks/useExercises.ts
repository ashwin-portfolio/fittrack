'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { exercisesApi } from '@/lib/api/exercises'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { ExerciseCreateRequest, MuscleGroup } from '@/types/workout'

export function useExercises(params: {
  q?: string
  muscle_group?: MuscleGroup | null
  limit?: number
} = {}) {
  return useQuery({
    queryKey: queryKeys.exercises.search(params.q, params.muscle_group ?? undefined),
    queryFn: () => exercisesApi.list({ ...params, skip: 0 }),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ExerciseCreateRequest) => exercisesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      toast.success('Exercise created.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
