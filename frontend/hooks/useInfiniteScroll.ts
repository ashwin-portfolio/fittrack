'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

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
