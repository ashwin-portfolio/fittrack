import { apiClient } from '@/lib/api/client'
import type {
  CaloriesChartData,
  DashboardSummary,
  WeightChartData,
  WorkoutsChartData,
} from '@/types/dashboard'

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/dashboard/summary')
    return res.data
  },

  getWeightChart: async (days = 30): Promise<WeightChartData> => {
    const res = await apiClient.get<WeightChartData>('/dashboard/charts/weight', {
      params: { days },
    })
    return res.data
  },

  getWorkoutsChart: async (weeks = 8): Promise<WorkoutsChartData> => {
    const res = await apiClient.get<WorkoutsChartData>('/dashboard/charts/workouts', {
      params: { weeks },
    })
    return res.data
  },

  getCaloriesChart: async (days = 7): Promise<CaloriesChartData> => {
    const res = await apiClient.get<CaloriesChartData>('/dashboard/charts/calories', {
      params: { days },
    })
    return res.data
  },
}
