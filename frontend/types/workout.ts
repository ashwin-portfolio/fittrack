export interface WorkoutSet {
  id?: string
  reps: number
  weight_kg: number | null
  duration_seconds: number | null
  notes: string | null
}

export interface WorkoutExercise {
  id?: string
  exercise_id: string
  exercise_name?: string
  order: number
  sets: WorkoutSet[]
  notes: string | null
}

export interface Workout {
  id: string
  user_id: string
  title: string
  notes: string | null
  duration_minutes: number | null
  workout_date: string
  is_shared: boolean
  exercises: WorkoutExercise[]
  created_at: string
  updated_at: string
}

export interface WorkoutSummary {
  id: string
  title: string
  workout_date: string
  duration_minutes: number | null
  exercise_count: number
  is_shared: boolean
  created_at: string
}

export interface CreateWorkoutRequest {
  title: string
  notes?: string
  duration_minutes?: number
  workout_date: string
  is_shared?: boolean
  exercises: {
    exercise_id: string
    order: number
    notes?: string
    sets: {
      reps: number
      weight_kg?: number
      duration_seconds?: number
      notes?: string
    }[]
  }[]
}

export interface WorkoutListParams {
  skip?: number
  limit?: number
  start_date?: string
  end_date?: string
}
