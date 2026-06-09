export interface DashboardSummary {
  workouts_this_week: number
  workouts_this_month: number
  calories_today: number
  current_weight_kg: number | null
  weight_change_kg: number | null
  active_goal: string | null
  streak_days: number
}

export interface WeightChartPoint {
  date: string
  weight_kg: number
}

export interface WorkoutFrequencyPoint {
  week: string
  count: number
}

export interface CalorieChartPoint {
  date: string
  calories: number
  target: number | null
}

export interface DashboardCharts {
  weight_trend: WeightChartPoint[]
  workout_frequency: WorkoutFrequencyPoint[]
  calorie_intake: CalorieChartPoint[]
}

export type ChartType = 'weight' | 'workouts' | 'calories'
