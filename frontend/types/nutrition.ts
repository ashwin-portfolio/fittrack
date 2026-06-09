export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface NutritionEntry {
  id: string
  user_id: string
  meal_type: MealType
  food_name: string
  quantity: number
  unit: string
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  notes: string | null
  logged_at: string
  is_shared: boolean
  created_at: string
}

export interface NutritionDailySummary {
  date: string
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  entry_count: number
  entries: NutritionEntry[]
}

export interface CreateNutritionRequest {
  meal_type: MealType
  food_name: string
  quantity: number
  unit: string
  calories: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  fiber_g?: number
  notes?: string
  logged_at?: string
  is_shared?: boolean
}

export interface NutritionListParams {
  skip?: number
  limit?: number
  start_date?: string
  end_date?: string
  meal_type?: MealType
}
