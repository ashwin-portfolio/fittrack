import { apiClient } from '@/lib/api/client'
import type { FeedPage, FeedParams } from '@/types/feed'

export const feedApi = {
  getGlobal: async (params: FeedParams = {}): Promise<FeedPage> => {
    const res = await apiClient.get<FeedPage>('/feed/global', { params })
    return res.data
  },

  getFollowing: async (params: FeedParams = {}): Promise<FeedPage> => {
    const res = await apiClient.get<FeedPage>('/feed/following', { params })
    return res.data
  },
}
