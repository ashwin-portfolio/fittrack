'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { goalsApi } from '@/lib/api/goals'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { CreateGoalRequest } from '@/types/goal'

export function useActiveGoal() {
  return useQuery({
    queryKey: queryKeys.goals.active(),
    queryFn: goalsApi.getActive,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSetGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGoalRequest) => goalsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.active() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
      toast.success('Goal saved')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
