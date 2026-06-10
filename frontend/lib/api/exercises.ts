import { apiClient } from '@/lib/api/client'
import type {
  Exercise,
  ExerciseCreateRequest,
  ExerciseListResponse,
  MuscleGroup,
} from '@/types/workout'

export const exercisesApi = {
  list: async (params: {
    q?: string
    muscle_group?: MuscleGroup | null
    skip?: number
    limit?: number
  } = {}): Promise<ExerciseListResponse> => {
    const { muscle_group, ...rest } = params
    const res = await apiClient.get<ExerciseListResponse>('/exercises', {
      params: { ...rest, ...(muscle_group ? { muscle_group } : {}) },
    })
    return res.data
  },

  create: async (data: ExerciseCreateRequest): Promise<Exercise> => {
    const res = await apiClient.post<Exercise>('/exercises', data)
    return res.data
  },
}
