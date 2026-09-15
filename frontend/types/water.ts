export interface WaterEntry {
  id: string
  log_date: string        // YYYY-MM-DD
  amount_ml: number
  created_at: string
}

export interface WaterDailySummary {
  date: string             // YYYY-MM-DD
  total_ml: number
  goal_ml: number
  entries: WaterEntry[]
}

export interface WaterHistoryDay {
  date: string             // YYYY-MM-DD
  day_label: string        // "Mon", "Tue", ...
  total_ml: number
}

export interface WaterHistory {
  start_date: string
  end_date: string
  days: WaterHistoryDay[]
  total_ml: number
  average_ml: number
  daily_target_ml: number
  glass_ml: number
}

export interface WaterGoal {
  daily_target_ml: number
}

export interface LogWaterRequest {
  amount_ml: number
  log_date?: string        // YYYY-MM-DD, defaults to today server-side
}
