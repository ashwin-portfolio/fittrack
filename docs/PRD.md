FitTrack MVP — PRD v2.1 (Final Draft)
________________________________________
1. Product Overview
Product Name: FitTrack MVP Type: SaaS Web Application Target Users: Individuals tracking fitness, nutrition, body composition — and sharing progress with a community Development Timeline: 3–5 weeks (solo developer) Deployment Model: Self-hosted via Docker; GitHub for version control
________________________________________
2. Problem Statement
Most fitness tracking apps are either too complex, paywalled, or isolating. Users need a single platform to log workouts, track meals, monitor body weight, visualize progress — and stay motivated through community accountability. Strava does this for runners and cyclists but not for gym-goers and nutrition trackers.
FitTrack fills that gap.
________________________________________
3. Goals & Success Metrics
Goal	Metric
Daily active usage	User logs at least 1 entry/day
Community engagement	50% of logged activities are shared to feed
Workout adoption	80% of users log a workout in first session
Nutrition adoption	Meal logged in under 60 seconds
Social retention	Users with 3+ followers return 2× more often
Performance	API response under 200ms on core endpoints
________________________________________
4. Scope
In Scope — MVP
•	User registration, login, logout (JWT)
•	User profile + onboarding (age, gender, height, weight, goal)
•	Workout logging (exercises, sets, reps, weight)
•	Nutrition logging (meal type, food name, macros)
•	Body weight logging
•	Progress dashboard (charts, summaries)
•	Community: Activity Feed (shared activities)
•	Community: Follow / Unfollow users
•	Community: Kudos on activities
•	Community: Comments on activities
•	Public profile pages
•	Avatar initials (no file upload for MVP)
•	Docker-based local + production deployment
Out of Scope — MVP (Moved to Enhancements)
Feature	Phase
Community Groups / Clubs	Enhancement 1
Barcode / food scanning	Enhancement 2
Leaderboards & challenges	Enhancement 3
AI workout recommendations	Enhancement 4
Wearable integrations	Enhancement 5
Mobile native app	Enhancement 6
Push / email notifications	Enhancement 2
Payment / subscriptions	Enhancement 7
Real-time feed updates	Enhancement 3
Profile photo upload	Enhancement 1
________________________________________
5. User Personas
Persona A — Alex, 28, Gym Beginner Tracks exercises and monitors improvement. Follows experienced users for motivation. Gives Kudos to friends' PRs.
Persona B — Priya, 34, Weight Loss Focus Logs meals and weight daily. Shares milestones publicly for accountability. Monitors calorie trends.
Persona C — Marcus, 26, Muscle Gain Tracks progressive overload. Shares heavy lift sessions publicly. Wants followers to see bench press PRs.
________________________________________
6. Functional Requirements
6.1 Authentication
ID	Requirement
AUTH-01	Register with name, email, username, password
AUTH-02	Passwords hashed with bcrypt (cost factor ≥ 12)
AUTH-03	Login returns JWT access token (30 min) + refresh token (7 days)
AUTH-04	Protected routes reject invalid or expired tokens
AUTH-05	Logout via client-side token clear
AUTH-06	Unique username required — used in public profile URL
6.2 Profile
ID	Requirement
PROF-01	Set age, gender, height, current weight
PROF-02	Fitness goal: Weight Loss / Weight Gain / Muscle Gain / Maintenance
PROF-03	Set target weight
PROF-04	Profile visibility: Public / Private
PROF-05	Short bio field (max 160 characters)
PROF-06	Avatar generated from initials + color (no file upload in MVP)
PROF-07	Public profile page at /u/:username
6.3 Workout Tracking
ID	Requirement
WRK-01	Create workout session with date and optional name
WRK-02	Session contains one or more exercises
WRK-03	Each exercise has a name and one or more sets
WRK-04	Each set records reps and weight (kg)
WRK-05	Option to mark workout as Share to Community
WRK-06	View full workout history
WRK-07	Delete workout session
WRK-08	Add optional notes to a session
6.4 Nutrition Tracking
ID	Requirement
NUT-01	Log meal with date and meal type
NUT-02	Meal types: Breakfast, Lunch, Dinner, Snack
NUT-03	Fields: food name, calories, protein (g), carbs (g), fat (g)
NUT-04	Option to share meal to community feed
NUT-05	View nutrition history by date
NUT-06	Delete nutrition entry
NUT-07	Schema includes nullable barcode field for future scanning
6.5 Weight Tracking
ID	Requirement
WGT-01	Log weight with date
WGT-02	One entry per day enforced (upsert behavior)
WGT-03	Option to share milestone weight to community
WGT-04	Full historical data stored and queryable
6.6 Dashboard
ID	Requirement
DASH-01	Current weight (latest log)
DASH-02	Target weight + delta
DASH-03	Total workouts this week
DASH-04	Total calories and protein today
DASH-05	Last 5 personal activities
DASH-06	Weight trend chart (last 30 days)
DASH-07	Workout frequency chart (last 4 weeks)
DASH-08	Daily calorie chart (last 7 days)
6.7 Community — Activity Feed
ID	Requirement
COM-01	Global feed shows all public shared activities
COM-02	Following feed shows activities from followed users only
COM-03	Each card shows: avatar, username, activity type, summary, timestamp
COM-04	Workout card shows: exercise names, total sets, total volume
COM-05	Meal card shows: meal type, total calories, macros
COM-06	Weight card shows: logged weight, delta from previous entry
COM-07	Feed is paginated (infinite scroll, 20 items per page)
COM-08	Filter feed by: All / Workouts / Nutrition / Weight
6.8 Community — Social Interactions
ID	Requirement
SOC-01	User can give Kudos to any public activity
SOC-02	Kudos count shown on activity card
SOC-03	User can remove their own Kudos
SOC-04	User can comment on any public activity
SOC-05	Comments show: username, avatar initials, text, timestamp
SOC-06	User can delete their own comment
SOC-07	Comment count shown on activity card
6.9 Community — Follow System
ID	Requirement
FOL-01	User can follow any public profile
FOL-02	User can unfollow
FOL-03	Follower and Following counts shown on profile
FOL-04	Followers and Following lists viewable on profile page
FOL-05	Following list determines Following feed content
________________________________________
7. Non-Functional Requirements
Category	Requirement
Performance	Core API < 200ms; Feed API < 400ms (paginated)
Security	bcrypt passwords; signed JWTs; no PII in logs; ORM prevents SQL injection
Scalability	Stateless backend; DB indexed for feed queries; Redis-ready architecture
Maintainability	Layered architecture; no business logic in route handlers
Portability	Fully runs via Docker Compose; no cloud vendor lock-in
Accessibility	WCAG 2.1 AA on core flows
Browser Support	Chrome, Firefox, Safari, Edge (last 2 versions)
Mobile	Fully responsive; usable on 375px viewport
________________________________________
8. Tech Stack
Layer	Choice	Rationale
Frontend	Next.js 15 + TypeScript	App Router, SSR, type safety
Styling	TailwindCSS + ShadCN UI	Fast, accessible, consistent components
Data fetching	TanStack Query	Caching, optimistic updates, infinite scroll
Backend	FastAPI	Async, auto OpenAPI docs, fast to build
ORM	SQLAlchemy 2.0	Mature, Alembic migrations included
Database	PostgreSQL	Relational integrity; feed-query indexes
Auth	JWT (python-jose) + bcrypt	Stateless; no external auth service
Validation	Pydantic v2	Native FastAPI integration
Charts	Recharts	React-native, open-source, no license cost
Containerization	Docker + Docker Compose	Reproducible environments
________________________________________
9. Page Map
Public
├── /login
├── /register
└── /u/:username              → Public profile page

Authenticated
├── /dashboard                → Personal summary + charts
├── /workouts                 → Workout history list
├── /workouts/new             → Log new workout
├── /nutrition                → Nutrition history by date
├── /nutrition/new            → Log new meal
├── /progress                 → Weight trend + analytics
├── /profile                  → Edit profile + goals
└── /community
    ├── /community/feed       → Global + Following feed
    └── /community/discover   → Find users to follow
________________________________________
10. Data Model — High Level
Users ──────┬── Profiles
            ├── Goals
            ├── WorkoutSessions ── WorkoutExercises ── ExerciseSets
            ├── NutritionEntries
            ├── WeightLogs
            ├── ActivityFeedItems   ← shared workouts / meals / weights
            ├── Kudos
            ├── Comments
            └── Follows             ← self-referential user relationship
Schema is forward-compatible. Community Groups, barcode fields, notification tables, and challenge tables can all be added via Alembic migrations without touching existing tables.
________________________________________
11. MVP Cut Priority (If Behind Schedule)
Cut in this order — app remains usable at every level:
Priority 1  →  Comments               (keep Feed + Follow + Kudos)
Priority 2  →  Feed filters           (show all items, no filter UI)
Priority 3  →  Discover page          (follow from profile only)
Priority 4  →  Following feed tab     (global feed only)
Priority 5  →  Weight sharing         (share workouts + meals only)
________________________________________
12. Security Checklist
•	Passwords hashed with bcrypt (cost factor 12)
•	JWT signed with HS256; secret stored in environment variable
•	All endpoints behind auth middleware except /login, /register, /u/:username
•	Pydantic validation on all request bodies
•	SQLAlchemy ORM prevents raw SQL injection
•	CORS restricted to frontend origin
•	No PII written to application logs
________________________________________
13. Risks
Risk	Severity	Mitigation
Feed query performance at scale	Medium	Composite indexes on user_id, created_at, is_public
Scope creep from community feature	High	Groups deferred; Feed+Follow+Kudos+Comments is the hard line
Auth token handling on frontend	Low	TanStack Query + interceptor pattern handles refresh cleanly
Timeline overrun	Medium	Cut priority list defined above; ship leaner not later
________________________________________
________________________________________
Future Enhancements Roadmap
This section is intended as living documentation for future development planning. Enhancements are grouped by phase and ordered by user value within each phase.
________________________________________
Enhancement Phase 1 — Community Depth
Builds on: MVP community foundation Estimated effort: 2–3 weeks
Feature	Description
Community Groups / Clubs	Users create named groups. Members share activities to a group feed. Admin roles. Public and private groups.
Group discovery & search	Browse and search all public groups. Join/leave flow. Member count and activity stats.
Group admin tools	Remove members, approve join requests for private groups, pin posts.
Profile photo upload	User uploads avatar. Stored in S3-compatible object storage. CDN delivery.
Activity mentions	Tag another user in a comment using @username. Mention resolves to their profile.
Notification center	In-app notification list for Kudos, comments, follows, and mentions. Unread badge count.
________________________________________
Enhancement Phase 2 — Nutrition Intelligence
Builds on: MVP nutrition tracking Estimated effort: 2–3 weeks
Feature	Description
Barcode scanning	Scan food barcode to auto-fill nutrition data using Open Food Facts API (free, open-source).
Food database search	Search a curated food database by name. Pre-fill macros from stored entries.
Custom food library	User saves frequently eaten foods to their personal library for quick re-logging.
Meal templates	Save a full meal (e.g., "My usual breakfast") and log it in one tap.
Daily macro targets	User sets calorie and macro goals. Dashboard shows actual vs. target with progress bars.
Nutrition history export	Download full nutrition log as CSV for external analysis.
Email notifications	Daily summary email: calories logged, workout reminder, weekly progress.
________________________________________
Enhancement Phase 3 — Gamification & Challenges
Builds on: Community Groups and social graph Estimated effort: 3–4 weeks
Feature	Description
Leaderboards	Weekly rankings within a group by total workout volume, calories burned, or weight lost.
Community challenges	Group admins create time-boxed challenges (e.g., "30-day squat challenge"). Members join and log progress.
Badges and achievements	Milestone badges: first workout, 10 workouts, 100kg lifted, streak badges. Displayed on profile.
Streak tracking	Consecutive days of any activity logged. Streak shown on dashboard and profile.
Personal records (PRs)	Auto-detect when a user logs a new best weight for an exercise. Flag PR on feed card.
Real-time feed updates	WebSocket or SSE-based live feed so Kudos and comments appear without page refresh.
________________________________________
Enhancement Phase 4 — Smart Tracking
Builds on: MVP workout tracking Estimated effort: 3–4 weeks
Feature	Description
Exercise library	Searchable database of exercises with muscle group tags, instructions, and video links. Autocomplete in workout form.
AI workout recommendations	Based on logged history, suggest next workout. Use open-source model or Anthropic Claude API.
Progressive overload tracker	Show last session's weight for each exercise when logging a new workout. Highlight improvements.
Rest timer	Built-in countdown timer between sets. Configurable duration.
Workout templates	Save a full workout as a template and reuse it.
Workout history export	Download full workout history as CSV or JSON.
Multi-unit support	User preference for kg or lbs. All data stored in kg; converted on display.
________________________________________
Enhancement Phase 5 — Integrations & Platform
Builds on: Stable MVP infrastructure Estimated effort: 4–6 weeks
Feature	Description
Wearable integrations	Sync steps, heart rate, and calories from Garmin, Fitbit, and Apple Health via their open APIs.
Google Fit / Apple Health sync	Import weight and workouts from platform health apps.
Strava import	Import running and cycling activities from Strava via their public API.
Calendar integration	Sync planned workouts to Google Calendar or iCal.
Public API	Documented REST API for third-party developers to build on FitTrack data.
Webhook support	Notify external services when a workout or meal is logged.
________________________________________
Enhancement Phase 6 — Mobile
Builds on: Stable API from MVP Estimated effort: 6–8 weeks
Feature	Description
React Native mobile app	iOS and Android app reusing the same FastAPI backend. Shared TypeScript types via a monorepo.
Offline logging	Log workouts without internet. Sync when connection is restored.
Push notifications	Native push for Kudos, comments, challenge updates, and streak reminders.
Camera barcode scanning	Native camera integration for barcode scanning in the mobile app.
Apple Watch / Wear OS widget	Quick-log widget for weight and water intake from the wrist.
________________________________________
Enhancement Phase 7 — Monetization & Growth
Builds on: Active user base with engagement metrics Estimated effort: 4–6 weeks
Feature	Description
Subscription tiers	Free tier with MVP features. Pro tier with AI recommendations, advanced analytics, and unlimited history.
Payment integration	Stripe integration for subscription billing. Webhook-based entitlement management.
Referral program	Users earn rewards for inviting friends who complete their first week of logging.
Trainer accounts	Certified trainers can manage multiple client accounts. Clients share data with trainer.
White-label / gym accounts	Gym owners license FitTrack for their members. Custom branding and group management.
Analytics dashboard (admin)	Internal admin panel: DAU, MAU, retention cohorts, feature usage. Built with open-source tools (Metabase).
________________________________________
Enhancement Phase 8 — Advanced Analytics
Builds on: 3+ months of user data Estimated effort: 3–4 weeks
Feature	Description
Body composition tracking	Track body fat %, muscle mass, and BMI over time. Correlate with weight and nutrition logs.
Correlation insights	Show relationship between sleep, calories, and workout performance (if wearable data available).
Predicted goal date	Based on current rate of change, project when target weight will be reached.
Nutrition vs. workout reports	Weekly PDF or email report: workouts completed, average calories, macros, weight change.
Advanced charts	Heatmap of workout frequency, muscle group balance pie chart, macro split trends.
________________________________________
PRD Status: FINAL v2.1 Approved for Step 2

