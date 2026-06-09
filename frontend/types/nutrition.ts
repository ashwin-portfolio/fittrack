export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface NutritionEntry {
  id: string
  entry_date: string       // YYYY-MM-DD
  meal_type: MealType
  food_name: string
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  is_shared: boolean
  created_at: string
}

export interface NutritionListResponse {
  items: NutritionEntry[]
  total: number
  skip: number
  limit: number
}

export interface DailySummary {
  date: string
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  entry_count: number
}

export interface FoodSearchResult {
  food_name: string
  brand: string | null
  barcode: string | null
  calories_per_100g: number | null
  protein_per_100g: number | null
  carbs_per_100g: number | null
  fat_per_100g: number | null
  serving_description: string | null
  serving_weight_g: number | null
}

export interface FoodSearchListResponse {
  items: FoodSearchResult[]
  total: number
  query: string
}

export interface RecentFood {
  food_name: string
  meal_type: string
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  last_eaten: string
}

export interface NutritionCreateRequest {
  entry_date: string
  meal_type: MealType
  food_name: string
  calories: number
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  is_shared?: boolean
}
