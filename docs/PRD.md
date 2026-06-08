# FitTrack MVP — Product Requirements Document

**Version:** 2.1 (Final)
**Date:** 2025-01-15
**Status:** Approved

---

## 1. Product Overview

| Field | Detail |
|---|---|
| Product Name | FitTrack MVP |
| Type | SaaS Web Application |
| Target Users | Individuals tracking fitness, nutrition, body composition, and community progress |
| Development Timeline | 3–5 weeks (solo developer) |
| Deployment Model | Self-hosted via Docker; GitHub for version control |

---

## 2. Problem Statement

Most fitness tracking apps are either too complex, paywalled, or isolating. Users need a single platform to log workouts, track meals, monitor body weight, visualize progress — and stay motivated through community accountability. Strava does this for runners and cyclists but not for gym-goers and nutrition trackers.

FitTrack fills that gap.

---

## 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Daily active usage | User logs at least 1 entry/day |
| Community engagement | 50% of logged activities are shared to feed |
| Workout adoption | 80% of users log a workout in first session |
| Nutrition adoption | Meal logged in under 60 seconds |
| Social retention | Users with 3+ followers return 2× more often |
| Performance | API response under 200ms on core endpoints |

---

## 4. Scope

### In Scope — MVP

- User registration, login, logout (JWT + refresh tokens)
- User profile + onboarding (age, gender, height, weight, goal)
- Exercise library (system exercises + user custom exercises)
- Workout logging (exercises from library, sets, reps, weight)
- Nutrition logging (meal type, food name, macros)
- Body weight logging
- Progress dashboard (charts, summaries)
- Community: Activity Feed (shared activities)
- Community: Follow / Unfollow users
- Community: Kudos on activities
- Community: Comments on activities
- Public profile pages
- Avatar initials (no file upload in MVP)
- Soft delete on workouts, nutrition, feed items, comments
- Docker-based local + production deployment

### Out of Scope — MVP

| Feature | Enhancement Phase |
|---|---|
| Community Groups / Clubs | Phase 1 |
| Barcode / food scanning | Phase 2 |
| Leaderboards & challenges | Phase 3 |
| AI workout recommendations | Phase 4 |
| Wearable integrations | Phase 5 |
| Mobile native app | Phase 6 |
| Push / email notifications | Phase 2 |
| Payment / subscriptions | Phase 7 |
| Real-time feed updates | Phase 3 |
| Profile photo upload | Phase 1 |

---

## 5. User Personas

### Persona A — Alex, 28, Gym Beginner
Tracks exercises and monitors improvement. Follows experienced users for motivation. Gives Kudos to friends' PRs.

### Persona B — Priya, 34, Weight Loss Focus
Logs meals and weight daily. Shares milestones publicly for accountability. Monitors calorie trends.

### Persona C — Marcus, 26, Muscle Gain
Tracks progressive overload. Shares heavy lift sessions publicly. Wants followers to see bench press PRs.

---

## 6. Functional Requirements

### 6.1 Authentication

| ID | Requirement |
|---|---|
| AUTH-01 | Register with name, email, username, password |
| AUTH-02 | Passwords hashed with bcrypt (cost factor ≥ 12) |
| AUTH-03 | Login returns JWT access token (30 min) + refresh token (7 days) |
| AUTH-04 | Refresh tokens stored server-side (hashed); revocable on logout |
| AUTH-05 | Protected routes reject invalid or expired tokens |
| AUTH-06 | Logout revokes refresh token server-side |
| AUTH-07 | Unique username required — used in public profile URL |

### 6.2 Profile

| ID | Requirement |
|---|---|
| PROF-01 | Set age, gender, height, current weight |
| PROF-02 | Fitness goal: Weight Loss / Weight Gain / Muscle Gain / Maintenance |
| PROF-03 | Set target weight |
| PROF-04 | Profile visibility: Public / Private |
| PROF-05 | Short bio field (max 160 characters) |
| PROF-06 | Avatar generated from initials + deterministic color |
| PROF-07 | Public profile page at `/u/:username` |

### 6.3 Exercise Library

| ID | Requirement |
|---|---|
| EX-01 | System exercise library pre-seeded with 44 common exercises |
| EX-02 | Exercises categorised by muscle group |
| EX-03 | Users can search exercises by name or muscle group |
| EX-04 | Users can create custom exercises when not found in library |
| EX-05 | Custom exercises are private to the creating user |
| EX-06 | Workout exercises reference exercise library (no free-text names) |

### 6.4 Workout Tracking

| ID | Requirement |
|---|---|
| WRK-01 | Create workout session with date and optional name |
| WRK-02 | Session contains one or more exercises (from library or custom) |
| WRK-03 | Each exercise has one or more sets |
| WRK-04 | Each set records reps and weight (kg) |
| WRK-05 | Option to mark workout as Share to Community |
| WRK-06 | View full workout history |
| WRK-07 | Soft delete workout session (deleted_at timestamp) |
| WRK-08 | Add optional notes to a session |

### 6.5 Nutrition Tracking

| ID | Requirement |
|---|---|
| NUT-01 | Log meal with date and meal type |
| NUT-02 | Meal types: Breakfast, Lunch, Dinner, Snack |
| NUT-03 | Fields: food name, calories, protein (g), carbs (g), fat (g) |
| NUT-04 | Option to share meal to community feed |
| NUT-05 | View nutrition history by date |
| NUT-06 | Soft delete nutrition entry (deleted_at timestamp) |
| NUT-07 | Schema includes nullable `barcode` field for future scanning |

### 6.6 Weight Tracking

| ID | Requirement |
|---|---|
| WGT-01 | Log weight with date |
| WGT-02 | One entry per day enforced (upsert behavior) |
| WGT-03 | Option to share milestone weight to community |
| WGT-04 | Full historical data stored and queryable |

### 6.7 Dashboard

| ID | Requirement |
|---|---|
| DASH-01 | Current weight (latest log) |
| DASH-02 | Target weight + delta |
| DASH-03 | Total workouts this week |
| DASH-04 | Total calories and protein today |
| DASH-05 | Last 5 personal activities |
| DASH-06 | Weight trend chart (last 30 days) |
| DASH-07 | Workout frequency chart (last 4 weeks) |
| DASH-08 | Daily calorie chart (last 7 days) |

### 6.8 Community — Activity Feed

| ID | Requirement |
|---|---|
| COM-01 | Global feed shows all public shared activities |
| COM-02 | Following feed shows activities from followed users only |
| COM-03 | Each card shows: avatar, username, activity type, summary, timestamp |
| COM-04 | Workout card shows: exercise names, total sets, total volume |
| COM-05 | Meal card shows: meal type, total calories, macros |
| COM-06 | Weight card shows: logged weight, delta from previous entry |
| COM-07 | Feed is paginated (infinite scroll, 20 items per page) |
| COM-08 | Filter feed by: All / Workouts / Nutrition / Weight |

### 6.9 Community — Social Interactions

| ID | Requirement |
|---|---|
| SOC-01 | User can give Kudos to any public activity |
| SOC-02 | Kudos count shown on activity card |
| SOC-03 | User can remove their own Kudos |
| SOC-04 | User can comment on any public activity |
| SOC-05 | Comments show: username, avatar initials, text, timestamp |
| SOC-06 | User can soft-delete their own comment |
| SOC-07 | Comment count shown on activity card |

### 6.10 Community — Follow System

| ID | Requirement |
|---|---|
| FOL-01 | User can follow any public profile |
| FOL-02 | User can unfollow |
| FOL-03 | Follower and Following counts shown on profile |
| FOL-04 | Followers and Following lists viewable on profile page |
| FOL-05 | Following list determines Following feed content |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Core API < 200ms; Feed API < 400ms (paginated) |
| Security | bcrypt passwords; signed JWTs; refresh tokens hashed server-side; ORM prevents SQL injection |
| Scalability | Stateless backend; DB indexed for feed queries; Redis-ready architecture |
| Maintainability | Layered architecture (API → Service → Repository → DB) |
| Portability | Fully runs via Docker Compose; no cloud vendor lock-in |
| Accessibility | WCAG 2.1 AA on core flows |
| Browser Support | Chrome, Firefox, Safari, Edge (last 2 versions) |
| Mobile | Fully responsive; usable on 375px viewport |

---

## 8. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 15 + TypeScript | App Router, SSR, type safety |
| Styling | TailwindCSS + ShadCN UI | Fast, accessible, consistent components |
| Data Fetching | TanStack Query | Caching, optimistic updates, infinite scroll |
| Backend | FastAPI | Async, auto OpenAPI docs, fast to build |
| ORM | SQLAlchemy 2.0 | Mature, Alembic migrations included |
| Database | PostgreSQL | Relational integrity; feed-query indexes |
| Auth | JWT (python-jose) + bcrypt | Stateless; refresh tokens stored server-side |
| Validation | Pydantic v2 | Native FastAPI integration |
| Charts | Recharts | React-native, open-source |
| Containerization | Docker + Docker Compose | Reproducible environments |

---

## 9. Page Map

```
Public
├── /login
├── /register
└── /u/:username              → Public profile page

Authenticated
├── /dashboard                → Personal summary + charts
├── /workouts                 → Workout history list
├── /workouts/new             → Log new workout
├── /workouts/:id             → Workout detail
├── /nutrition                → Nutrition history by date
├── /nutrition/new            → Log new meal
├── /progress                 → Weight trend + analytics
├── /profile                  → Edit profile + goals
└── /community
    ├── /community/feed       → Global + Following feed
    └── /community/discover   → Find users to follow
```

---

## 10. Security Checklist

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT signed with HS256; secret stored in environment variable
- [x] Refresh tokens hashed (SHA-256) before storage; never stored raw
- [x] All endpoints behind auth middleware except `/login`, `/register`, `/u/:username`
- [x] Unauthenticated access redirects to `/login`
- [x] Pydantic validation on all request bodies
- [x] SQLAlchemy ORM prevents raw SQL injection
- [x] CORS restricted to frontend origin
- [x] No PII written to application logs

---

## 11. MVP Cut Priority (If Behind Schedule)

Cut in this order — app remains usable at every level:

```
Priority 1  →  Comments               (keep Feed + Follow + Kudos)
Priority 2  →  Feed filters           (show all items, no filter UI)
Priority 3  →  Discover page          (follow from profile only)
Priority 4  →  Following feed tab     (global feed only)
Priority 5  →  Weight sharing         (share workouts + meals only)
```

---

## 12. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Feed query performance at scale | Medium | Composite indexes on `user_id`, `created_at`, `is_public` |
| Scope creep from community feature | High | Groups deferred; Feed+Follow+Kudos+Comments is the hard line |
| Auth token handling on frontend | Low | TanStack Query + interceptor pattern handles refresh cleanly |
| Timeline overrun | Medium | Cut priority list defined above |

---

## 13. Future Enhancements Roadmap

### Phase 1 — Community Depth
- Community Groups / Clubs
- Group discovery & search
- Group admin tools
- Profile photo upload
- Activity mentions (@username)
- In-app notification center

### Phase 2 — Nutrition Intelligence
- Barcode scanning (Open Food Facts API)
- Food database search
- Custom food library
- Meal templates
- Daily macro targets
- Nutrition history export
- Email notifications

### Phase 3 — Gamification & Challenges
- Leaderboards (within groups)
- Community challenges
- Badges and achievements
- Streak tracking
- Personal records (PRs) — auto-detected
- Real-time feed updates (WebSockets)

### Phase 4 — Smart Tracking
- Full exercise library with muscle group tags and instructions
- AI workout recommendations (Claude API)
- Progressive overload tracker (show last session weights)
- Rest timer (built-in between sets)
- Workout templates
- Workout history export
- Multi-unit support (kg / lbs)

### Phase 5 — Integrations & Platform
- Wearable integrations (Garmin, Fitbit, Apple Health)
- Google Fit / Apple Health sync
- Strava import
- Calendar integration
- Public developer API
- Webhook support

### Phase 6 — Mobile
- React Native mobile app (iOS + Android)
- Offline logging with sync
- Push notifications
- Camera barcode scanning
- Apple Watch / Wear OS widget

### Phase 7 — Monetization & Growth
- Subscription tiers (Free / Pro)
- Stripe payment integration
- Referral program
- Trainer accounts
- White-label / gym accounts
- Admin analytics dashboard (Metabase)

### Phase 8 — Advanced Analytics
- Body composition tracking
- Correlation insights
- Predicted goal date
- Nutrition vs. workout reports
- Advanced charts (heatmaps, muscle balance)
