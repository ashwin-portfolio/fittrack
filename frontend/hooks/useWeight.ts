'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { weightApi } from '@/lib/api/weight'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { CreateWeightEntryRequest, WeightHistoryParams } from '@/types/weight'

export function useWeightHistory(params?: WeightHistoryParams) {
  return useQuery({
    queryKey: queryKeys.weight.history(params?.days),
    queryFn: () => weightApi.getHistory(params),
  })
}

export function useLogWeight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWeightEntryRequest) => weightApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weight.history() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Weight logged')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteWeightEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => weightApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weight.history() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Entry deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
