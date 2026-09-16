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
  /** null when no weight is on record, or no session this week has a duration. */
  calories_burned_this_week: number | null
  recent_activities: DashboardActivity[]
}

export interface WeeklyDigest {
  week_start: string          // YYYY-MM-DD
  week_end: string
  workouts_completed: number
  /** Only set when the active goal is a workout_frequency goal. */
  workout_goal: number | null
  calories_consumed: number
  /** null when nothing this week is estimable. */
  calories_burned: number | null
  /** null whenever calories_burned is null — "net" needs both sides. */
  net_calories: number | null
  weight_delta_kg: number | null
  workout_streak: number
  nutrition_streak: number
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
