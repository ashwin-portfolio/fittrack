'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workoutsApi } from '@/lib/api/workouts'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { CreateWorkoutRequest, WorkoutListParams } from '@/types/workout'

export function useWorkouts(params?: WorkoutListParams) {
  return useQuery({
    queryKey: queryKeys.workouts.all(params),
    queryFn: () => workoutsApi.getAll(params),
  })
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: queryKeys.workouts.detail(id),
    queryFn: () => workoutsApi.getById(id),
    enabled: Boolean(id),
  })
}

export function useCreateWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWorkoutRequest) => workoutsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Workout logged')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workoutsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Workout deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
