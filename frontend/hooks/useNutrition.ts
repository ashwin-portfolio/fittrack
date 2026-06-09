'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { nutritionApi } from '@/lib/api/nutrition'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { NutritionCreateRequest } from '@/types/nutrition'

const STALE_2M = 2 * 60 * 1000

export function useNutritionEntries(date: string) {
  return useQuery({
    queryKey: queryKeys.nutrition.all({ date }),
    queryFn: () => nutritionApi.list({ date, limit: 100 }),
    staleTime: STALE_2M,
    enabled: Boolean(date),
  })
}

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: queryKeys.nutrition.dailySummary(date),
    queryFn: () => nutritionApi.getDailySummary(date),
    staleTime: STALE_2M,
    enabled: Boolean(date),
  })
}

export function useFoodSearch(q: string) {
  return useQuery({
    queryKey: ['nutrition', 'search', q],
    queryFn: () => nutritionApi.searchFood(q),
    staleTime: 10 * 60 * 1000,
    enabled: q.length >= 2,
  })
}

export function useRecentFoods() {
  return useQuery({
    queryKey: ['nutrition', 'recent'],
    queryFn: () => nutritionApi.getRecent(8),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogMeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NutritionCreateRequest) => nutritionApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all({ date: variables.entry_date }) })
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.dailySummary(variables.entry_date) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'recent'] })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteMeal(date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => nutritionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all({ date }) })
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.dailySummary(date) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Entry deleted.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
