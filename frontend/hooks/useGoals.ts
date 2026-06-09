'use client'

import { useQuery } from '@tanstack/react-query'
import { goalsApi } from '@/lib/api/goals'
import { queryKeys } from '@/lib/query/keys'

export function useActiveGoal() {
  return useQuery({
    queryKey: queryKeys.goals.active(),
    queryFn: goalsApi.getActive,
    staleTime: 5 * 60 * 1000,
  })
}
