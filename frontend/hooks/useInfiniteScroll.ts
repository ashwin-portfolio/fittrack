'use client'

import { useCallback, useRef } from 'react'

export function useInfiniteScroll(onLoadMore: () => void, enabled: boolean) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const triggerRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (!node || !enabled) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore()
          }
        },
        { rootMargin: '200px' },
      )

      observerRef.current.observe(node)
    },
    [onLoadMore, enabled],
  )

  return { triggerRef }
}
