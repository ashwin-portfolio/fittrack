export type GoalType = 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance'

export interface Goal {
  id: string
  goal_type: GoalType
  target_weight_kg: number | null
  is_active: boolean
  created_at: string
}

export interface CreateGoalRequest {
  goal_type: GoalType
  target_weight_kg?: number
}
