# FitTrack MVP — Frontend Architecture

**Version:** 1.0
**Framework:** Next.js 15 (App Router)
**Language:** TypeScript
**Styling:** TailwindCSS + ShadCN UI
**Data Fetching:** TanStack Query v5

---

## Folder Structure

```
frontend/
├── app/                                      # Next.js 15 App Router
│   ├── layout.tsx                            # Root layout — fonts, providers, metadata
│   ├── page.tsx                              # / → redirects to /dashboard or /login
│   ├── globals.css                           # Tailwind base + CSS variables (light/dark)
│   ├── middleware.ts                         # Auth guard — redirects unauthenticated users
│   │
│   ├── (auth)/                               # Route group — centered card layout, no sidebar
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx                      # /login
│   │   └── register/
│   │       └── page.tsx                      # /register + onboarding stepper
│   │
│   ├── (app)/                                # Route group — sidebar layout, auth required
│   │   ├── layout.tsx                        # Sidebar + topbar + auth guard
│   │   ├── dashboard/
│   │   │   └── page.tsx                      # /dashboard
│   │   ├── workouts/
│   │   │   ├── page.tsx                      # /workouts
│   │   │   ├── new/
│   │   │   │   └── page.tsx                  # /workouts/new
│   │   │   └── [id]/
│   │   │       └── page.tsx                  # /workouts/:id
│   │   ├── nutrition/
│   │   │   ├── page.tsx                      # /nutrition
│   │   │   └── new/
│   │   │       └── page.tsx                  # /nutrition/new
│   │   ├── progress/
│   │   │   └── page.tsx                      # /progress
│   │   ├── profile/
│   │   │   └── page.tsx                      # /profile
│   │   └── community/
│   │       ├── feed/
│   │       │   └── page.tsx                  # /community/feed
│   │       └── discover/
│   │           └── page.tsx                  # /community/discover
│   │
│   ├── u/
│   │   └── [username]/
│   │       └── page.tsx                      # /u/:username — public profile (no auth)
│   │
│   └── not-found.tsx
│
├── components/
│   ├── ui/                                   # ShadCN generated components (do not edit manually)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx                       # Desktop left sidebar navigation
│   │   ├── MobileNav.tsx                     # Bottom navigation bar (mobile)
│   │   ├── Topbar.tsx                        # Top bar — page title, user menu
│   │   ├── AuthGuard.tsx                     # Redirects unauthenticated users
│   │   └── PageHeader.tsx                    # Consistent page title + subtitle
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── OnboardingForm.tsx                # Multi-step profile setup
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx                      # Single metric card
│   │   ├── WeightTrendChart.tsx              # Recharts line chart
│   │   ├── WorkoutFrequencyChart.tsx         # Recharts bar chart
│   │   ├── CalorieChart.tsx                  # Recharts bar chart
│   │   └── RecentActivity.tsx                # Last 5 activities list
│   │
│   ├── workouts/
│   │   ├── WorkoutCard.tsx
│   │   ├── WorkoutList.tsx
│   │   ├── WorkoutForm.tsx                   # Full workout logging form
│   │   ├── ExerciseFieldArray.tsx            # Dynamic exercise + set fields
│   │   ├── ExerciseSearch.tsx                # Search/select from exercise library
│   │   ├── SetRow.tsx                        # Single set (reps + weight) input row
│   │   └── WorkoutDetail.tsx
│   │
│   ├── nutrition/
│   │   ├── NutritionCard.tsx
│   │   ├── NutritionDayGroup.tsx             # Meals grouped under a date
│   │   ├── NutritionForm.tsx
│   │   ├── MacroBar.tsx                      # Protein/carbs/fat visual bar
│   │   └── DailyTotals.tsx
│   │
│   ├── weight/
│   │   ├── WeightForm.tsx
│   │   ├── WeightHistoryList.tsx
│   │   └── WeightDeltaBadge.tsx              # +/- change indicator
│   │
│   ├── community/
│   │   ├── FeedItem.tsx                      # Single activity card (workout/meal/weight)
│   │   ├── FeedList.tsx                      # Infinite scroll feed container
│   │   ├── FeedFilter.tsx                    # All / Workouts / Nutrition / Weight tabs
│   │   ├── KudosButton.tsx                   # Kudos toggle with count
│   │   ├── CommentSection.tsx                # Expandable comment list + input
│   │   ├── CommentCard.tsx
│   │   ├── FollowButton.tsx
│   │   ├── UserCard.tsx                      # Discover page user card
│   │   └── FollowList.tsx                    # Followers/Following modal list
│   │
│   └── shared/
│       ├── Avatar.tsx                        # Initials-based avatar with color
│       ├── EmptyState.tsx                    # Illustration + message + CTA
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── ConfirmDialog.tsx                 # Reusable delete confirmation
│       ├── InfiniteScrollTrigger.tsx         # Intersection observer for pagination
│       └── DatePicker.tsx                    # Wrapped ShadCN calendar picker
│
├── hooks/                                    # Custom React hooks
│   ├── useAuth.ts                            # Login, logout, register, current user
│   ├── useDashboard.ts
│   ├── useWorkouts.ts
│   ├── useExercises.ts                       # Exercise library search + custom create
│   ├── useNutrition.ts
│   ├── useWeight.ts
│   ├── useFeed.ts                            # Infinite paginated feed (global + following)
│   ├── useSocial.ts                          # Kudos, comments, follow/unfollow
│   ├── useProfile.ts
│   └── useInfiniteScroll.ts                  # Intersection observer hook
│
├── lib/
│   ├── api/
│   │   ├── client.ts                         # Axios instance — base URL, auth interceptors, refresh
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   ├── goals.ts
│   │   ├── exercises.ts                      # Exercise library API calls
│   │   ├── workouts.ts
│   │   ├── nutrition.ts
│   │   ├── weight.ts
│   │   ├── dashboard.ts
│   │   ├── feed.ts
│   │   └── social.ts
│   │
│   ├── query/
│   │   ├── client.ts                         # TanStack Query client config + defaults
│   │   └── keys.ts                           # Centralised query key factory
│   │
│   ├── auth/
│   │   ├── token.ts                          # getToken, setToken, clearToken
│   │   └── context.tsx                       # AuthContext + AuthProvider
│   │
│   └── utils/
│       ├── cn.ts                             # Tailwind class merge (clsx + twMerge)
│       ├── format.ts                         # formatDate, formatWeight, formatCalories
│       ├── avatar.ts                         # getInitials, getAvatarColor (deterministic)
│       └── validators.ts                     # Zod schemas for all forms
│
├── types/
│   ├── auth.ts
│   ├── profile.ts
│   ├── goal.ts
│   ├── exercise.ts                           # Exercise, MuscleGroup enum
│   ├── workout.ts
│   ├── nutrition.ts
│   ├── weight.ts
│   ├── dashboard.ts
│   ├── feed.ts
│   └── social.ts
│
├── public/
│   ├── favicon.ico
│   └── images/
│       └── empty-states/
│           ├── no-workouts.svg
│           ├── no-meals.svg
│           ├── no-weight.svg
│           └── no-feed.svg
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                           # ShadCN CLI config
├── Dockerfile
└── package.json
```

---

## Routing Architecture

```
/                     → middleware: redirect based on auth state
│
├── (auth) group      → no sidebar, centered layout, public
│   ├── /login
│   └── /register
│
├── (app) group       → sidebar layout, AuthGuard enforced
│   ├── /dashboard
│   ├── /workouts
│   ├── /workouts/new
│   ├── /workouts/:id
│   ├── /nutrition
│   ├── /nutrition/new
│   ├── /progress
│   ├── /profile
│   ├── /community/feed
│   └── /community/discover
│
└── /u/:username      → public, no auth, no sidebar
```

### `middleware.ts` Logic

```
If path starts with /(app) and no token → redirect /login
If path is /login or /register and has token → redirect /dashboard
If path is /u/:username → allow unconditionally
```

---

## Data Flow

```
Page / Component
      │  uses
      ▼
Custom Hook (useWorkouts, useNutrition, etc.)
      │  uses
      ▼
TanStack Query (useQuery / useMutation / useInfiniteQuery)
      │  calls
      ▼
API Module (lib/api/workouts.ts)
      │  uses
      ▼
Axios Client (lib/api/client.ts)
      │  HTTP
      ▼
FastAPI Backend (/api/v1/...)
```

---

## Key Patterns

### Query Keys (Centralised)

```typescript
// lib/query/keys.ts
export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  dashboard: {
    summary:  () => ['dashboard', 'summary'] as const,
    charts:   (type: string) => ['dashboard', 'charts', type] as const,
  },
  exercises: {
    search: (q: string, muscle?: string) => ['exercises', { q, muscle }] as const,
  },
  workouts: {
    all:    (params?: object) => ['workouts', params] as const,
    detail: (id: string)      => ['workouts', id] as const,
  },
  nutrition: {
    all:          (params?: object)  => ['nutrition', params] as const,
    dailySummary: (date: string)     => ['nutrition', 'daily', date] as const,
  },
  weight: {
    history: (days: number) => ['weight', 'history', days] as const,
  },
  feed: {
    global:    (filters?: object) => ['feed', 'global', filters] as const,
    following: (filters?: object) => ['feed', 'following', filters] as const,
  },
  profile: {
    me:     ()               => ['profile', 'me'] as const,
    public: (username: string) => ['profile', 'public', username] as const,
  },
  social: {
    comments: (feedItemId: string) => ['comments', feedItemId] as const,
    followers: (username: string)  => ['followers', username] as const,
    following: (username: string)  => ['following', username] as const,
  },
}
```

### Mutation Pattern

```typescript
// Every mutation follows this pattern
const { mutate, isPending } = useMutation({
  mutationFn: workoutApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workouts.all() })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() })
    toast.success('Workout logged')
    router.push('/workouts')
  },
  onError: (error: AxiosError) => {
    toast.error(getErrorMessage(error))
  },
})
```

### Infinite Scroll Pattern (Feed)

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: queryKeys.feed.global(filters),
  queryFn: ({ pageParam = 0 }) =>
    feedApi.getGlobal({ skip: pageParam, limit: 20, type: filters.type }),
  getNextPageParam: (lastPage) =>
    lastPage.items.length === 20 ? lastPage.skip + 20 : undefined,
  initialPageParam: 0,
})
```

### Optimistic Updates (Kudos)

```typescript
const kudosMutation = useMutation({
  mutationFn: (feedItemId: string) => socialApi.toggleKudos(feedItemId),
  onMutate: async (feedItemId) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.feed.global() })
    const previous = queryClient.getQueryData(queryKeys.feed.global())
    queryClient.setQueryData(queryKeys.feed.global(), (old) =>
      updateKudosOptimistically(old, feedItemId)
    )
    return { previous }
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(queryKeys.feed.global(), context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.feed.global() })
  },
})
```

---

## Auth Flow (Frontend)

```
App starts
  → AuthProvider mounts
  → checks localStorage for access_token
  → if found: fetch GET /profile/me
  → if 401: attempt token refresh with stored refresh_token
  → if refresh fails: clear tokens, set isAuthenticated = false
  → if success: set user state, set isAuthenticated = true

Login
  → POST /auth/login
  → store access_token + refresh_token in localStorage
  → set user state
  → redirect to /dashboard

Logout
  → POST /auth/logout (with refresh_token)
  → clear localStorage
  → clear user state
  → redirect to /login

Axios interceptor (request)
  → attach Authorization: Bearer <access_token>

Axios interceptor (response)
  → on 401: attempt POST /auth/refresh
  → on refresh success: retry original request with new token
  → on refresh failure: logout user
```

---

## Mobile Navigation

```
Desktop (≥ 768px)          Mobile (< 768px)
─────────────────────       ──────────────────────
Sidebar (left fixed)         Bottom navigation bar
├── Dashboard (home)         ├── Dashboard
├── Workouts (dumbbell)      ├── Workouts
├── Nutrition (fork)         ├── Nutrition
├── Progress (chart)         ├── Community
├── Community (users)        └── Profile
└── Profile (person)
                             Top bar:
                             ├── Page title
                             └── Action buttons (+ New, etc.)
```

---

## Component Conventions

| Rule | Detail |
|---|---|
| Server components by default | Add `"use client"` only when using hooks, state, or browser APIs |
| No business logic in components | All data fetching and mutations in custom hooks |
| One component per file | No barrel `index.ts` re-exports — import paths are explicit |
| Form handling | React Hook Form + Zod resolvers on all forms |
| Loading states | Every data-fetching component handles: loading, error, empty, data |
| Optimistic updates | Kudos, follow, and comment actions update UI before server confirms |
| Error boundaries | Wrap page-level components in `ErrorBoundary` |
| Toast notifications | Use `sonner` for all success/error feedback |

---

## Dependencies (`package.json`)

```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "5.6.0",
    "@tanstack/react-query": "5.59.0",
    "axios": "1.7.7",
    "react-hook-form": "7.53.0",
    "@hookform/resolvers": "3.9.0",
    "zod": "3.23.8",
    "recharts": "2.13.0",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.4",
    "lucide-react": "0.453.0",
    "date-fns": "4.1.0",
    "sonner": "1.5.0"
  },
  "devDependencies": {
    "tailwindcss": "3.4.14",
    "@types/node": "22.0.0",
    "@types/react": "19.0.0",
    "@types/react-dom": "19.0.0"
  }
}
```

---

## Environment Variables

```bash
# .env.example
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=FitTrack
```
