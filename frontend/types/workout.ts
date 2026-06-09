export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'full_body'
  | 'other'

export interface Exercise {
  id: string
  name: string
  muscle_group: MuscleGroup
  is_system: boolean
  created_by_user_id: string | null
  created_at: string
  updated_at: string
}

export interface ExerciseListResponse {
  exercises: Exercise[]
  total: number
}

export interface ExerciseCreateRequest {
  name: string
  muscle_group: MuscleGroup
}

export interface WorkoutSet {
  id: string
  set_number: number
  reps: number
  weight_kg: number
}

export interface WorkoutExercise {
  id: string
  exercise_id: string
  exercise_name: string
  muscle_group: MuscleGroup
  order_index: number
  sets: WorkoutSet[]
}

export interface WorkoutResponse {
  id: string
  session_date: string       // YYYY-MM-DD
  name: string | null
  notes: string | null
  is_shared: boolean
  exercises: WorkoutExercise[]
  created_at: string
  updated_at: string
}

export interface WorkoutSummary {
  id: string
  session_date: string
  name: string | null
  is_shared: boolean
  exercise_count: number
  total_sets: number
  created_at: string
}

export interface WorkoutListResponse {
  workouts: WorkoutSummary[]
  total: number
}

export interface WorkoutSetCreate {
  set_number: number
  reps: number
  weight_kg?: number
}

export interface WorkoutExerciseCreate {
  exercise_id: string
  sets: WorkoutSetCreate[]
}

export interface WorkoutCreateRequest {
  session_date: string
  name?: string | null
  notes?: string | null
  is_shared?: boolean
  exercises: WorkoutExerciseCreate[]
}
