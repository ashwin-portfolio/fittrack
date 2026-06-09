export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'
  | 'cardio'
  | 'other'

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'other'

export interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_group: MuscleGroup
  category: ExerciseCategory
  is_system: boolean
  created_by: string | null
  created_at: string
}

export interface ExerciseSearchParams {
  q?: string
  muscle_group?: MuscleGroup
  category?: ExerciseCategory
  skip?: number
  limit?: number
}

export interface CreateExerciseRequest {
  name: string
  description?: string
  muscle_group: MuscleGroup
  category: ExerciseCategory
}
