export type DashboardActivityType = 'workout' | 'meal' | 'weight'

export interface DashboardActivity {
  type: DashboardActivityType
  label: string
  occurred_at: string
}

export interface DashboardSummary {
  current_weight_kg: number | null
  target_weight_kg: number | null
  weight_change_kg: number | null
  workouts_this_week: number
  calories_today: number
  protein_today_g: number
  recent_activities: DashboardActivity[]
}

export interface WeightDataPoint {
  date: string       // YYYY-MM-DD
  weight_kg: number
}

export interface WeightChartData {
  data: WeightDataPoint[]
}

export interface WorkoutFrequencyPoint {
  week: string       // e.g. "Dec 23"
  count: number
}

export interface WorkoutsChartData {
  data: WorkoutFrequencyPoint[]
}

export interface CalorieDataPoint {
  date: string       // YYYY-MM-DD
  calories: number
}

export interface CaloriesChartData {
  data: CalorieDataPoint[]
}
