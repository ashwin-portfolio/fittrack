'use client'

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workoutsApi } from '@/lib/api/workouts'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { WorkoutCreateRequest } from '@/types/workout'

const PAGE_SIZE = 20

export function useWorkoutList() {
  return useInfiniteQuery({
    queryKey: ['workouts', 'list'],
    queryFn: ({ pageParam }) =>
      workoutsApi.list({ limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.reduce((n, p) => n + p.workouts.length, 0)
      return fetched < lastPage.total ? fetched : undefined
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: queryKeys.workouts.detail(id),
    queryFn: () => workoutsApi.get(id),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(id),
  })
}

export function useCreateWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkoutCreateRequest) => workoutsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useUpdateWorkout(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkoutCreateRequest) => workoutsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.detail(id) })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workoutsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Workout deleted.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
