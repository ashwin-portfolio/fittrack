import { apiClient } from '@/lib/api/client'
import type { CreateGoalRequest, Goal } from '@/types/goal'

export const goalsApi = {
  getActive: async (): Promise<Goal | null> => {
    try {
      const res = await apiClient.get<Goal>('/goals/active')
      return res.data
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } }).response?.status === 404) return null
      throw err
    }
  },

  create: async (data: CreateGoalRequest): Promise<Goal> => {
    const res = await apiClient.post<Goal>('/goals', data)
    return res.data
  },
}
