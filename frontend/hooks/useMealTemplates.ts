'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mealTemplatesApi } from '@/lib/api/meal-templates'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type {
  ApplyMealTemplateRequest,
  MealTemplateCreateRequest,
  SaveMealAsTemplateRequest,
} from '@/types/meal-template'

const MEAL_TEMPLATE_KEYS = {
  all: ['nutrition', 'templates'] as const,
  list: () => [...MEAL_TEMPLATE_KEYS.all, 'list'] as const,
}

export function useMealTemplates() {
  return useQuery({
    queryKey: MEAL_TEMPLATE_KEYS.list(),
    queryFn: () => mealTemplatesApi.list({ limit: 50 }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateMealTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MealTemplateCreateRequest) => mealTemplatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEAL_TEMPLATE_KEYS.list() })
      toast.success('Template saved!')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useSaveMealAsTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SaveMealAsTemplateRequest) => mealTemplatesApi.saveFromDay(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEAL_TEMPLATE_KEYS.list() })
      toast.success('Template saved!')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteMealTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mealTemplatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEAL_TEMPLATE_KEYS.list() })
      toast.success('Template deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useApplyMealTemplate(date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApplyMealTemplateRequest }) =>
      mealTemplatesApi.apply(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all({ date }) })
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.dailySummary(date) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'weekly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'recent'] })
      toast.success('Template applied!')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
