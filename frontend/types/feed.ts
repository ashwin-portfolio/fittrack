export type FeedItemType = 'workout' | 'nutrition' | 'weight'

export interface FeedItemAuthor {
  username: string
  first_name: string | null
  last_name: string | null
}

export interface FeedItem {
  id: string
  item_type: FeedItemType
  user_id: string
  author: FeedItemAuthor
  reference_id: string
  title: string
  summary: string | null
  kudos_count: number
  comment_count: number
  has_kudos: boolean
  created_at: string
}

export interface FeedPage {
  items: FeedItem[]
  skip: number
  limit: number
  total: number
}

export interface FeedParams {
  skip?: number
  limit?: number
  type?: FeedItemType
}
