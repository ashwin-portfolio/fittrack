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

export interface WaterGoal {
  daily_target_ml: number
}

export interface LogWaterRequest {
  amount_ml: number
  log_date?: string        // YYYY-MM-DD, defaults to today server-side
}
