import { apiClient } from '@/lib/api/client'
import type {
  WorkoutCreateRequest,
  WorkoutListResponse,
  WorkoutResponse,
} from '@/types/workout'

export const workoutsApi = {
  list: async (params: { limit?: number; offset?: number } = {}): Promise<WorkoutListResponse> => {
    const res = await apiClient.get<WorkoutListResponse>('/workouts', { params })
    return res.data
  },

  get: async (id: string): Promise<WorkoutResponse> => {
    const res = await apiClient.get<WorkoutResponse>(`/workouts/${id}`)
    return res.data
  },

  create: async (data: WorkoutCreateRequest): Promise<WorkoutResponse> => {
    const res = await apiClient.post<WorkoutResponse>('/workouts', data)
    return res.data
  },

  update: async (id: string, data: WorkoutCreateRequest): Promise<WorkoutResponse> => {
    const res = await apiClient.patch<WorkoutResponse>(`/workouts/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workouts/${id}`)
  },
}
