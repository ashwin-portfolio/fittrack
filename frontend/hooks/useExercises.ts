'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { exercisesApi } from '@/lib/api/exercises'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { CreateExerciseRequest, ExerciseSearchParams } from '@/types/exercise'

export function useExercises(params?: ExerciseSearchParams) {
  return useQuery({
    queryKey: queryKeys.exercises.search(params?.q, params?.muscle_group),
    queryFn: () => exercisesApi.search(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExerciseRequest) => exercisesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      toast.success('Exercise created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
