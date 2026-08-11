import type { MealType } from './nutrition'

export interface MealTemplateItem {
  id: string
  food_name: string
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
}

export interface MealTemplate {
  id: string
  name: string
  meal_type: MealType
  items: MealTemplateItem[]
  item_count: number
  total_calories: number
  created_at: string
}

export interface MealTemplateListResponse {
  templates: MealTemplate[]
  total: number
}

export interface MealTemplateItemCreate {
  food_name: string
  calories: number
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
}

export interface MealTemplateCreateRequest {
  name: string
  meal_type: MealType
  items: MealTemplateItemCreate[]
}

export interface SaveMealAsTemplateRequest {
  name: string
  entry_date: string       // YYYY-MM-DD
  meal_type: MealType
}

export interface ApplyMealTemplateRequest {
  entry_date?: string      // YYYY-MM-DD, defaults to today server-side
}
