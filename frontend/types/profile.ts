export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'maintain_weight'
  | 'improve_endurance'
  | 'general_fitness'

export interface Profile {
  id: string
  user_id: string
  username: string
  email: string
  first_name: string | null
  last_name: string | null
  date_of_birth: string | null
  gender: Gender | null
  height_cm: number | null
  weight_kg: number | null
  fitness_goal: FitnessGoal | null
  bio: string | null
  is_profile_complete: boolean
  followers_count: number
  following_count: number
  created_at: string
}

export interface PublicProfile {
  username: string
  first_name: string | null
  last_name: string | null
  bio: string | null
  followers_count: number
  following_count: number
  is_following: boolean
  created_at: string
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  date_of_birth?: string
  gender?: Gender
  height_cm?: number
  weight_kg?: number
  fitness_goal?: FitnessGoal
  bio?: string
}
