export type GoalType =
  | 'lose_weight'
  | 'build_muscle'
  | 'maintain_weight'
  | 'improve_endurance'
  | 'general_fitness'

export interface Goal {
  id: string
  user_id: string
  goal_type: GoalType
  target_weight_kg: number | null
  target_date: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateGoalRequest {
  goal_type: GoalType
  target_weight_kg?: number
  target_date?: string
  notes?: string
}
