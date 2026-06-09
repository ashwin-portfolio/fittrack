export interface WeightEntry {
  id: string
  user_id: string
  weight_kg: number
  body_fat_percentage: number | null
  notes: string | null
  logged_at: string
  created_at: string
}

export interface WeightHistory {
  entries: WeightEntry[]
  starting_weight: number | null
  current_weight: number | null
  lowest_weight: number | null
  highest_weight: number | null
  total_change_kg: number | null
}

export interface CreateWeightEntryRequest {
  weight_kg: number
  body_fat_percentage?: number
  notes?: string
  logged_at?: string
}

export interface WeightHistoryParams {
  days?: number
  skip?: number
  limit?: number
}
