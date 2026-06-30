export type GoalType =
  | 'weight_loss'
  | 'weight_gain'
  | 'muscle_gain'
  | 'maintenance'
  | 'workout_frequency'

export interface Goal {
  id: string
  goal_type: GoalType
  target_weight_kg: number | null
  target_date: string | null   // YYYY-MM-DD
  weekly_workout_target: number | null
  is_active: boolean
  created_at: string
}

export interface CreateGoalRequest {
  goal_type: GoalType
  target_weight_kg?: number
  target_date?: string | null
  weekly_workout_target?: number | null
}

export interface WorkoutProgressResponse {
  workouts_this_week: number
  weekly_target: number | null
}
