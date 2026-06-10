import { apiClient } from '@/lib/api/client'
import type {
  Comment,
  CommentListResponse,
  CreateCommentRequest,
  FollowListResponse,
  FollowResponse,
  KudosResponse,
  UserSearchResponse,
} from '@/types/social'

export const socialApi = {
  // ── Kudos ──────────────────────────────────────────────────────────────────
  giveKudos: async (feedItemId: string): Promise<KudosResponse> => {
    const res = await apiClient.post<KudosResponse>(`/kudos/${feedItemId}`)
    return res.data
  },

  removeKudos: async (feedItemId: string): Promise<KudosResponse> => {
    const res = await apiClient.delete<KudosResponse>(`/kudos/${feedItemId}`)
    return res.data
  },

  // ── Comments ───────────────────────────────────────────────────────────────
  getComments: async (feedItemId: string): Promise<CommentListResponse> => {
    const res = await apiClient.get<CommentListResponse>(`/comments/${feedItemId}`)
    return res.data
  },

  addComment: async (feedItemId: string, data: CreateCommentRequest): Promise<Comment> => {
    const res = await apiClient.post<Comment>(`/comments/${feedItemId}`, data)
    return res.data
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`)
  },

  // ── Follows ────────────────────────────────────────────────────────────────
  follow: async (username: string): Promise<FollowResponse> => {
    const res = await apiClient.post<FollowResponse>(`/follows/${username}`)
    return res.data
  },

  unfollow: async (username: string): Promise<FollowResponse> => {
    const res = await apiClient.delete<FollowResponse>(`/follows/${username}`)
    return res.data
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  searchUsers: async (params: { q?: string; skip?: number; limit?: number } = {}): Promise<UserSearchResponse> => {
    const res = await apiClient.get<UserSearchResponse>('/users', { params })
    return res.data
  },

  getFollowers: async (username: string, params: { skip?: number; limit?: number } = {}): Promise<FollowListResponse> => {
    const res = await apiClient.get<FollowListResponse>(`/users/${username}/followers`, { params })
    return res.data
  },

  getFollowingList: async (username: string, params: { skip?: number; limit?: number } = {}): Promise<FollowListResponse> => {
    const res = await apiClient.get<FollowListResponse>(`/users/${username}/following`, { params })
    return res.data
  },
}
