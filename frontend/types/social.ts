export interface Comment {
  id: string
  feed_item_id: string
  user_id: string
  username: string
  first_name: string | null
  last_name: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface CreateCommentRequest {
  content: string
}

export interface KudosResponse {
  kudos_count: number
  has_kudos: boolean
}

export interface FollowResponse {
  is_following: boolean
  followers_count: number
}

export interface UserSuggestion {
  username: string
  first_name: string | null
  last_name: string | null
  followers_count: number
  is_following: boolean
}

export interface FollowListItem {
  username: string
  first_name: string | null
  last_name: string | null
}
