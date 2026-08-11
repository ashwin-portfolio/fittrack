import { apiClient } from '@/lib/api/client'
import type { LogWaterRequest, WaterDailySummary, WaterEntry, WaterGoal } from '@/types/water'

export const waterApi = {
  getDailySummary: async (date: string): Promise<WaterDailySummary> => {
    const res = await apiClient.get<WaterDailySummary>('/water/daily-summary', { params: { date } })
    return res.data
  },

  log: async (data: LogWaterRequest): Promise<WaterEntry> => {
    const res = await apiClient.post<WaterEntry>('/water', data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/water/${id}`)
  },

  getGoal: async (): Promise<WaterGoal> => {
    const res = await apiClient.get<WaterGoal>('/water/goal')
    return res.data
  },

  setGoal: async (daily_target_ml: number): Promise<WaterGoal> => {
    const res = await apiClient.put<WaterGoal>('/water/goal', { daily_target_ml })
    return res.data
  },
}
