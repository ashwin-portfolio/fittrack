export interface TemplateSet {
  id: string
  set_number: number
  reps: number
  weight_kg: number
}

export interface TemplateExercise {
  id: string
  exercise_id: string
  exercise_name: string
  muscle_group: string
  order_index: number
  sets: TemplateSet[]
}

export interface Template {
  id: string
  name: string
  notes: string | null
  exercises: TemplateExercise[]
  exercise_count: number
  created_at: string
  updated_at: string
}

export interface TemplateListResponse {
  templates: Template[]
  total: number
}

export interface TemplateSetCreate {
  set_number: number
  reps: number
  weight_kg?: number
}

export interface TemplateExerciseCreate {
  exercise_id: string
  sets: TemplateSetCreate[]
}

export interface TemplateCreateRequest {
  name: string
  notes?: string | null
  exercises: TemplateExerciseCreate[]
}

export interface SaveAsTemplateRequest {
  name: string
  notes?: string | null
}
