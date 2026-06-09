export interface CommentUser {
  username: string
  full_name: string
  avatar_color: string
}

export interface Comment {
  id: string
  user: CommentUser
  content: string
  is_own: boolean
  created_at: string
}

export interface CommentListResponse {
  items: Comment[]
  total: number
}

export interface CreateCommentRequest {
  content: string
}

export interface KudosResponse {
  feed_item_id: string
  kudos_count: number
  has_kudos: boolean
}

export interface FollowResponse {
  username: string
  is_following: boolean
  follower_count: number
}

export interface UserSearchItem {
  username: string
  full_name: string
  avatar_color: string
  bio: string | null
  follower_count: number
  is_following: boolean
}

export interface UserSearchResponse {
  items: UserSearchItem[]
  total: number
  skip: number
  limit: number
}

export interface FollowListItem {
  username: string
  full_name: string
  avatar_color: string
  bio: string | null
  is_following: boolean
}

export interface FollowListResponse {
  items: FollowListItem[]
  total: number
  skip: number
  limit: number
}
