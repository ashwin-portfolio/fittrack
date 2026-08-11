'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { waterApi } from '@/lib/api/water'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { LogWaterRequest } from '@/types/water'

const STALE_2M = 2 * 60 * 1000

export function useWaterDailySummary(date: string) {
  return useQuery({
    queryKey: queryKeys.water.dailySummary(date),
    queryFn: () => waterApi.getDailySummary(date),
    staleTime: STALE_2M,
    enabled: Boolean(date),
  })
}

export function useWaterGoal() {
  return useQuery({
    queryKey: queryKeys.water.goal(),
    queryFn: () => waterApi.getGoal(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useLogWater(date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LogWaterRequest) => waterApi.log(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.water.dailySummary(date) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteWaterEntry(date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => waterApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.water.dailySummary(date) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Entry deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useSetWaterGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (daily_target_ml: number) => waterApi.setGoal(daily_target_ml),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.water.goal() })
      queryClient.invalidateQueries({ queryKey: ['water', 'daily-summary'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Water goal saved')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
