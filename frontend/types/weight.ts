export interface WeightEntry {
  id: string
  log_date: string        // YYYY-MM-DD
  weight_kg: number
  delta_kg: number | null
  is_shared: boolean
  created_at: string
}

export interface WeightHistory {
  items: WeightEntry[]
  first_weight_kg: number | null
  latest_weight_kg: number | null
  total_change_kg: number | null
}

export interface CreateWeightEntryRequest {
  log_date: string        // YYYY-MM-DD
  weight_kg: number
  is_shared?: boolean
}

export interface WeightHistoryParams {
  days?: number
}
