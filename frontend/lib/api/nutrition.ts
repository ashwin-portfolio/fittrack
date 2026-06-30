import axios from 'axios'
import { apiClient } from '@/lib/api/client'
import type {
  CalorieGoal,
  DailySummary,
  FoodSearchListResponse,
  NutritionCreateRequest,
  NutritionListResponse,
  RecentFood,
} from '@/types/nutrition'

export const nutritionApi = {
  list: async (params: { date?: string; skip?: number; limit?: number } = {}): Promise<NutritionListResponse> => {
    const res = await apiClient.get<NutritionListResponse>('/nutrition', { params })
    return res.data
  },

  getDailySummary: async (date: string): Promise<DailySummary> => {
    const res = await apiClient.get<DailySummary>('/nutrition/daily-summary', {
      params: { date },
    })
    return res.data
  },

  searchFood: async (q: string, limit = 20): Promise<FoodSearchListResponse> => {
    const res = await apiClient.get<FoodSearchListResponse>('/nutrition/search', {
      params: { q, limit },
    })
    return res.data
  },

  getRecent: async (limit = 10): Promise<RecentFood[]> => {
    const res = await apiClient.get<RecentFood[]>('/nutrition/recent', {
      params: { limit },
    })
    return res.data
  },

  create: async (data: NutritionCreateRequest) => {
    const res = await apiClient.post<{ id: string }>('/nutrition', data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/nutrition/${id}`)
  },

  getCalorieGoal: async (): Promise<CalorieGoal | null> => {
    try {
      const res = await apiClient.get<CalorieGoal>('/nutrition/calorie-goal')
      return res.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null
      throw error
    }
  },

  setCalorieGoal: async (daily_calories: number): Promise<CalorieGoal> => {
    const res = await apiClient.put<CalorieGoal>('/nutrition/calorie-goal', { daily_calories })
    return res.data
  },
}
