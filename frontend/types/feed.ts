export type ActivityType = 'workout' | 'meal' | 'weight'

export interface FeedUser {
  username: string
  full_name: string
  avatar_color: string
}

export interface WorkoutFeedData {
  session_date: string
  name: string | null
  exercise_count: number
  total_sets: number
  total_volume_kg: number
  exercises: string[]
}

export interface MealFeedData {
  meal_type: string
  food_name: string
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
}

export interface WeightFeedData {
  log_date: string
  weight_kg: number
  delta_kg: number | null
}

export interface FeedItem {
  id: string
  activity_type: ActivityType
  user: FeedUser
  workout: WorkoutFeedData | null
  meal: MealFeedData | null
  weight: WeightFeedData | null
  kudos_count: number
  comment_count: number
  has_kudos: boolean
  created_at: string
}

export interface FeedPage {
  items: FeedItem[]
  total: number
  skip: number
  limit: number
}

export interface FeedParams {
  skip?: number
  limit?: number
  type?: ActivityType
}
