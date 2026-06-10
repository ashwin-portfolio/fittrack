import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry on 401 / 403 / 404
          const status = (error as { response?: { status: number } })?.response?.status
          if (status === 401 || status === 403 || status === 404) return false
          return failureCount < 2
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Singleton for client-side use
let browserQueryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Always create a new client on the server
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}
