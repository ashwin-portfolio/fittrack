'use client'

import type { UseInfiniteQueryResult } from '@tanstack/react-query'
import { FeedItem } from '@/components/community/FeedItem'
import { EmptyState } from '@/components/shared/EmptyState'
import { InfiniteScrollTrigger } from '@/components/shared/InfiniteScrollTrigger'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { FeedPage } from '@/types/feed'

interface FeedListProps {
  query: UseInfiniteQueryResult<{ pages: FeedPage[] }, Error>
  emptyTitle?: string
  emptyDescription?: string
}

export function FeedList({
  query,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Activities shared by users will appear here.',
}: FeedListProps) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = query

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load feed"
        description="Something went wrong. Try refreshing the page."
      />
    )
  }

  const items = data?.pages.flatMap((p) => p.items) ?? []

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  )
}
