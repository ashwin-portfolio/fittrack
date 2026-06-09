'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api/dashboard'
import { queryKeys } from '@/lib/query/keys'
import type { ChartType } from '@/types/dashboard'

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: dashboardApi.getSummary,
  })
}

export function useDashboardCharts(type: ChartType) {
  return useQuery({
    queryKey: queryKeys.dashboard.charts(type),
    queryFn: () => dashboardApi.getCharts(type),
  })
}
