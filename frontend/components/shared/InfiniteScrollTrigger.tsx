'use client'

import { useEffect, useRef } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface InfiniteScrollTriggerProps {
  onIntersect: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

export function InfiniteScrollTrigger({
  onIntersect,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollTriggerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onIntersect()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onIntersect])

  if (!hasNextPage) return null

  return (
    <div ref={ref} className="flex justify-center py-6">
      {isFetchingNextPage && <LoadingSpinner />}
    </div>
  )
}
