'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { nutritionApi } from '@/lib/api/nutrition'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { CreateNutritionRequest, NutritionListParams } from '@/types/nutrition'

export function useNutrition(params?: NutritionListParams) {
  return useQuery({
    queryKey: queryKeys.nutrition.all(params),
    queryFn: () => nutritionApi.getAll(params),
  })
}

export function useNutritionDaily(date: string) {
  return useQuery({
    queryKey: queryKeys.nutrition.dailySummary(date),
    queryFn: () => nutritionApi.getDailySummary(date),
    enabled: Boolean(date),
  })
}

export function useLogMeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateNutritionRequest) => nutritionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Meal logged')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteMeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => nutritionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Meal deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
