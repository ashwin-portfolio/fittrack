'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { feedApi } from '@/lib/api/feed'
import { queryKeys } from '@/lib/query/keys'
import type { FeedParams } from '@/types/feed'

export function useGlobalFeed(filters?: FeedParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.global(filters),
    queryFn: ({ pageParam = 0 }) =>
      feedApi.getGlobal({ skip: pageParam as number, limit: 20, ...filters }),
    getNextPageParam: (lastPage) =>
      lastPage.items.length === 20 ? lastPage.skip + 20 : undefined,
    initialPageParam: 0,
  })
}

export function useFollowingFeed(filters?: FeedParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.following(filters),
    queryFn: ({ pageParam = 0 }) =>
      feedApi.getFollowing({ skip: pageParam as number, limit: 20, ...filters }),
    getNextPageParam: (lastPage) =>
      lastPage.items.length === 20 ? lastPage.skip + 20 : undefined,
    initialPageParam: 0,
  })
}
