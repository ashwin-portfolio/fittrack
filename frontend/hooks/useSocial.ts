'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { socialApi } from '@/lib/api/social'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { CreateCommentRequest } from '@/types/social'

export function useComments(feedItemId: string) {
  return useQuery({
    queryKey: queryKeys.social.comments(feedItemId),
    queryFn: () => socialApi.getComments(feedItemId),
    enabled: Boolean(feedItemId),
  })
}

export function useAddComment(feedItemId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCommentRequest) => socialApi.addComment(feedItemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.social.comments(feedItemId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.global() })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useToggleKudos() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (feedItemId: string) => socialApi.toggleKudos(feedItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.global() })
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.following() })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useFollow(username: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (isFollowing: boolean) =>
      isFollowing ? socialApi.unfollow(username) : socialApi.follow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.public(username) })
      queryClient.invalidateQueries({ queryKey: queryKeys.social.suggestions() })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
