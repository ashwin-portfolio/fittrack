export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  dashboard: {
    summary: () => ['dashboard', 'summary'] as const,
    charts: (type: string) => ['dashboard', 'charts', type] as const,
  },
  exercises: {
    search: (q?: string, muscle?: string) => ['exercises', { q, muscle }] as const,
    detail: (id: string) => ['exercises', id] as const,
  },
  workouts: {
    all: (params?: object) => ['workouts', params] as const,
    detail: (id: string) => ['workouts', id] as const,
  },
  nutrition: {
    all: (params?: object) => ['nutrition', params] as const,
    dailySummary: (date: string) => ['nutrition', 'daily', date] as const,
  },
  weight: {
    history: (days?: number) => ['weight', 'history', days] as const,
  },
  feed: {
    global: (filters?: object) => ['feed', 'global', filters] as const,
    following: (filters?: object) => ['feed', 'following', filters] as const,
  },
  profile: {
    me: () => ['profile', 'me'] as const,
    public: (username: string) => ['profile', 'public', username] as const,
  },
  social: {
    comments: (feedItemId: string) => ['comments', feedItemId] as const,
    followers: (username: string) => ['followers', username] as const,
    following: (username: string) => ['following', username] as const,
    suggestions: (q?: string) => ['suggestions', q] as const,
  },
  goals: {
    active: () => ['goals', 'active'] as const,
  },
}
