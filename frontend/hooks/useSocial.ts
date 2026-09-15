'use client'

import { useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { socialApi } from '@/lib/api/social'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import type { FeedPage } from '@/types/feed'
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
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all() })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteComment(feedItemId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => socialApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.social.comments(feedItemId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all() })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useToggleKudos() {
  const queryClient = useQueryClient()

  // Write a kudos state into every cached feed page (global + following, any filter).
  function patchFeeds(feedItemId: string, kudosCount: number, hasKudos: boolean) {
    queryClient.setQueriesData<InfiniteData<FeedPage>>(
      { queryKey: queryKeys.feed.all() },
      (data) =>
        data && {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === feedItemId
                ? { ...item, kudos_count: kudosCount, has_kudos: hasKudos }
                : item,
            ),
          })),
        },
    )
  }

  return useMutation({
    mutationFn: ({ feedItemId, hasKudos }: { feedItemId: string; hasKudos: boolean }) =>
      hasKudos ? socialApi.removeKudos(feedItemId) : socialApi.giveKudos(feedItemId),

    onMutate: async ({ feedItemId, hasKudos }) => {
      // Stop in-flight feed refetches from overwriting the optimistic value.
      await queryClient.cancelQueries({ queryKey: queryKeys.feed.all() })

      const snapshot = queryClient.getQueriesData<InfiniteData<FeedPage>>({
        queryKey: queryKeys.feed.all(),
      })

      const cached = snapshot
        .flatMap(([, data]) => data?.pages.flatMap((page) => page.items) ?? [])
        .find((item) => item.id === feedItemId)

      const current = cached?.kudos_count ?? 0
      patchFeeds(feedItemId, Math.max(0, hasKudos ? current - 1 : current + 1), !hasKudos)

      return { snapshot }
    },

    onError: (error, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error(getApiErrorMessage(error))
    },

    // Reconcile with the server's authoritative count instead of refetching the feed,
    // which would reshuffle the list under the user.
    onSuccess: (data) => patchFeeds(data.feed_item_id, data.kudos_count, data.has_kudos),
  })
}

export function useFollow(username: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (isFollowing: boolean) =>
      isFollowing ? socialApi.unfollow(username) : socialApi.follow(username),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.public(username) })
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() })
      queryClient.invalidateQueries({ queryKey: queryKeys.social.suggestions() })
      toast.success(data.is_following ? `Following @${username}` : `Unfollowed @${username}`)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useFollowers(username: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.social.followers(username),
    queryFn: () => socialApi.getFollowers(username),
    enabled: Boolean(username) && (options?.enabled ?? true),
    staleTime: 0,
  })
}

export function useFollowing(username: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.social.following(username),
    queryFn: () => socialApi.getFollowingList(username),
    enabled: Boolean(username) && (options?.enabled ?? true),
    staleTime: 0,
  })
}

export function useSearchUsers(q?: string) {
  return useQuery({
    queryKey: queryKeys.social.suggestions(q),
    queryFn: () => socialApi.searchUsers({ q, limit: 20 }),
    staleTime: 30_000,
  })
}
