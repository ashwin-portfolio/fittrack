import { apiClient } from '@/lib/api/client'
import type { CreateWeightEntryRequest, WeightEntry, WeightHistory, WeightHistoryParams } from '@/types/weight'

export const weightApi = {
  getHistory: async (params: WeightHistoryParams = {}): Promise<WeightHistory> => {
    const res = await apiClient.get<WeightHistory>('/weight/history', { params })
    return res.data
  },

  create: async (data: CreateWeightEntryRequest): Promise<WeightEntry> => {
    const res = await apiClient.post<WeightEntry>('/weight', data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/weight/${id}`)
  },
}
