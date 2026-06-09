'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api/dashboard'
import { queryKeys } from '@/lib/query/keys'

const STALE_5M = 5 * 60 * 1000

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: dashboardApi.getSummary,
    staleTime: STALE_5M,
  })
}

export function useWeightChart(days = 30) {
  return useQuery({
    queryKey: [...queryKeys.dashboard.charts('weight'), days],
    queryFn: () => dashboardApi.getWeightChart(days),
    staleTime: STALE_5M,
  })
}

export function useWorkoutsChart(weeks = 8) {
  return useQuery({
    queryKey: [...queryKeys.dashboard.charts('workouts'), weeks],
    queryFn: () => dashboardApi.getWorkoutsChart(weeks),
    staleTime: STALE_5M,
  })
}

export function useCaloriesChart(days = 7) {
  return useQuery({
    queryKey: [...queryKeys.dashboard.charts('calories'), days],
    queryFn: () => dashboardApi.getCaloriesChart(days),
    staleTime: STALE_5M,
  })
}
