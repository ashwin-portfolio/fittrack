import { apiClient } from '@/lib/api/client'
import type {
  SaveAsTemplateRequest,
  Template,
  TemplateCreateRequest,
  TemplateListResponse,
} from '@/types/template'

export const templatesApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<TemplateListResponse>('/templates', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Template>(`/templates/${id}`).then((r) => r.data),

  create: (data: TemplateCreateRequest) =>
    apiClient.post<Template>('/templates', data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/templates/${id}`),

  saveFromWorkout: (workoutId: string, data: SaveAsTemplateRequest) =>
    apiClient.post<Template>(`/workouts/${workoutId}/save-as-template`, data).then((r) => r.data),
}
