# Documentation Changelog

All notable changes to FitTrack's technical and product documentation are recorded here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Each entry references the document file, its internal version number, and the product release it belongs to.

---

## [Unreleased] — v1.1 — Build Next

Target features: Workout Templates, Personal Records, Exercise History & Progression, Calorie Goals, Enhanced Goal Management.

### Documents pending update

- **ERD.md** — Add `workout_templates`, `template_exercises`, `template_sets` tables (migration 0004); add `daily_calorie_target`, `weekly_workout_target`, `target_date` columns to `goals` (migration 0005)
- **API_SPEC.md** — Document 5 new endpoints: `GET/POST/DELETE /templates`, `POST /workouts/{id}/save-as-template`, `GET /workouts/personal-records`, `GET /workouts/exercise-history/{exercise_id}`; update Goals request/response with 3 new optional fields
- **BACKEND_ARCHITECTURE.md** — Document new files: `template_repository.py`, `template_service.py`, `templates.py` endpoint; document `get_personal_records()` and `get_exercise_history()` query methods added to `workout_repository.py`
- **FRONTEND_ARCHITECTURE.md** — Document new hooks (`useTemplates`, `usePersonalRecords`, `useExerciseHistory`); 8 new components (`TemplateCard`, `TemplatePickerDialog`, `SaveAsTemplateDialog`, `PersonalRecordsCard`, `ExerciseProgressionChart`, `ExerciseHistorySheet`, `CalorieProgressBar`, `WorkoutFrequencyCard`); new page `/workouts/templates`; new type file `template.ts`; updated `workout.ts` and `goal.ts`
- **PRD.md** — Add v1.1 feature section; move Workout Templates and Personal Records from Phase roadmap into delivered features
- **USER_STORIES.md** — Add ~15 new user stories for v1.1 features across 5 new epics

---

## [v1.0] — 2025-01-15 — MVP Release

Initial documentation baseline covering all MVP features as deployed to Vercel (frontend), Railway (backend), and Neon PostgreSQL (database).

---

### PRD.md — v2.1 · Added

- Complete product requirements for MVP scope
- 10 functional requirement groups: auth, profile, exercises, workouts, nutrition, weight, dashboard, feed, social, follows
- Non-functional requirements: performance (< 200ms core, < 400ms feed), security, scalability, accessibility (WCAG 2.1 AA)
- Tech stack decisions with rationale (Next.js 15, FastAPI, PostgreSQL, TanStack Query, Recharts)
- Full page map — public routes (`/login`, `/register`, `/u/:username`) and authenticated routes
- MVP cut priority list (5 levels, app remains usable at every level)
- Risk register (4 risks with severity and mitigation)
- 8-phase future enhancement roadmap (v1.1 through Phase 8)

---

### ERD.md — v2.1 · Added

- 13 production tables documented with full column definitions, types, and constraints:
  `users`, `profiles`, `goals`, `refresh_tokens`, `exercises`, `workout_sessions`, `workout_exercises`, `exercise_sets`, `nutrition_entries`, `weight_logs`, `activity_feed_items`, `kudos`, `comments`, `follows`
- ASCII entity relationship diagram
- Complete index reference (30+ indexes, including 4 partial unique indexes)
- Soft delete behaviour table — which tables use `deleted_at` and read-filter rules
- Key relationship map
- Forward compatibility notes for 8 planned features (barcode, groups, notifications, profile photos, etc.)

---

### API_SPEC.md — v1.1 · Added

- 12 endpoint groups: auth, profile, goals, exercises, workouts, nutrition, weight, dashboard, feed, social, kudos/comments, follows
- Full request and response schemas for every endpoint
- Response envelope conventions: single resource, paginated list, error, validation error (422)
- HTTP status code reference (200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500)
- Rate limiting documentation: 10/min on auth endpoints, 200/min global default
- Authentication flow documentation (Bearer token, refresh token rotation)

---

### BACKEND_ARCHITECTURE.md — v1.0 · Added

- Full annotated folder structure at file level
- 4-layer architecture: API (route handlers) → Service (business logic) → Repository (data access) → Database
- Repository pattern: one class per domain, injected into services via constructor
- Service layer: orchestrates multi-step operations, enforces ownership, cascades soft deletes
- Database session management: per-request `SessionLocal`, auto-commit after route, rollback on exception
- Alembic migration strategy: 3 initial migrations (0001 initial schema, 0002 missing constraints, 0003 weight log soft delete)
- Design decisions: soft delete pattern, batch social queries to prevent N+1, seed data on startup

---

### FRONTEND_ARCHITECTURE.md — v1.0 · Added

- Full annotated folder structure at file and directory level
- Next.js 15 App Router route groups: `(auth)` (centered card layout), `(app)` (sidebar layout, auth required), public `/u/:username`
- Component hierarchy: `ui/` (ShadCN), `layout/` (shared shells), feature-specific subdirectories
- TanStack Query patterns: `queryKeys` registry, `staleTime` strategy, mutation `onSuccess` invalidation
- Auth context: `AuthProvider`, `useAuthContext`, token storage and silent refresh
- Mobile navigation: fixed bottom nav, safe-area insets via `env(safe-area-inset-bottom)`, `viewport-fit: cover`
- Form pattern: React Hook Form + Zod validators in `lib/validators/`

---

### USER_STORIES.md — v1.0 · Added

- 40 user stories across 8 epics: Authentication (6), Profile & Onboarding (4), Exercise Library (4), Workout Tracking (7), Nutrition Tracking (5), Weight & Progress (4), Dashboard (4), Community (6)
- Priority classification: P1 (must ship), P2 (should ship), P3 (nice to have)
- Full acceptance criteria for every story

---

*Maintainer note: When updating any document for a new product version, add an entry in this file under the appropriate version heading using the format `DocumentName.md — vX.X · Added / Changed / Removed`. Update the Revision History table inside that document at the same time.*
