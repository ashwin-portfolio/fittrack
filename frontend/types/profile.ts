export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export interface Profile {
  id: string
  email: string
  username: string
  full_name: string
  age: number | null
  gender: Gender | null
  height_cm: number | null
  bio: string | null
  is_public: boolean
  avatar_color: string
  onboarding_complete: boolean
  follower_count: number
  following_count: number
  created_at: string
}

export interface UpdateProfileRequest {
  full_name?: string
  username?: string
  bio?: string
  age?: number
  gender?: Gender
  height_cm?: number
  is_public?: boolean
}

export interface OnboardingRequest {
  age: number
  gender: Gender
  height_cm: number
  current_weight_kg: number
  goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance'
  target_weight_kg?: number | null
}

export interface OnboardingResponse {
  message: string
  onboarding_complete: boolean
}

export interface RecentActivity {
  id: string
  activity_type: string
  summary: string
  created_at: string
}

export interface PublicUserProfile {
  username: string
  full_name: string
  bio: string | null
  avatar_color: string
  is_public: boolean
  follower_count: number
  following_count: number
  is_following: boolean | null
  recent_activities: RecentActivity[]
}
