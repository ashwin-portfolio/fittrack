import { apiClient } from '@/lib/api/client'
import type {
  ApplyMealTemplateRequest,
  MealTemplate,
  MealTemplateCreateRequest,
  MealTemplateListResponse,
  SaveMealAsTemplateRequest,
} from '@/types/meal-template'
import type { NutritionEntry } from '@/types/nutrition'

export const mealTemplatesApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<MealTemplateListResponse>('/nutrition/templates', { params }).then((r) => r.data),

  create: (data: MealTemplateCreateRequest) =>
    apiClient.post<MealTemplate>('/nutrition/templates', data).then((r) => r.data),

  saveFromDay: (data: SaveMealAsTemplateRequest) =>
    apiClient.post<MealTemplate>('/nutrition/templates/from-day', data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/nutrition/templates/${id}`),

  apply: (id: string, data: ApplyMealTemplateRequest = {}) =>
    apiClient.post<NutritionEntry[]>(`/nutrition/templates/${id}/apply`, data).then((r) => r.data),
}
