# FitTrack

A full-stack fitness tracking web application — workouts, nutrition, weight progress, and a social community feed.

**Live Demo:** [fittrack-app.vercel.app](https://fittrack-app.vercel.app) &nbsp;|&nbsp; **API:** [fittrack-api.railway.app](https://fittrack-api.railway.app/docs)

---

## Features

**Workout Tracking**
- Log exercises with sets, reps, and weight
- Browse and search a curated exercise library (muscle group filtering)
- Create custom exercises
- View full workout history

**Nutrition Tracking**
- Log meals with macronutrient breakdown (calories, protein, carbs, fat)
- Multi-source food search — Indian foods database, USDA FoodData Central, Open Food Facts
- Daily nutrition totals with visual progress bars
- Meal type categorisation (breakfast, lunch, dinner, snack)

**Progress Tracking**
- Weight log with trend charts
- Dashboard with weekly workout frequency and calorie averages
- 30/60/90-day analytics

**Community**
- Public activity feed showing workouts and nutrition entries
- Follow/unfollow other users
- Kudos (likes) and comments on shared activities
- Public profile pages (`/u/:username`)

**Authentication**
- Email + password registration and login
- JWT access tokens (30 min) + opaque refresh tokens (7 days, rotated on use)
- bcrypt password hashing (12 rounds)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, ShadCN UI |
| Data Fetching | TanStack Query v5 |
| Charts | Recharts |
| Backend | FastAPI, Python 3.12, Pydantic v2 |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL (Neon serverless) |
| Auth | JWT HS256 + opaque refresh tokens |
| Rate Limiting | slowapi (10/min auth, 200/min global) |
| Migrations | Alembic |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| Database Hosting | Neon |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User (Browser)                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────────┐
│                   Vercel (Frontend)                              │
│   Next.js 15 App Router · Static + SSR · Edge middleware         │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST API (HTTPS)
┌─────────────────────────▼───────────────────────────────────────┐
│                   Railway (Backend)                              │
│   FastAPI · Uvicorn · Repository pattern · Service layer         │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │
│   │   Auth   │  │ Workouts  │  │Nutrition │  │  Community  │  │
│   └──────────┘  └───────────┘  └──────────┘  └─────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ PostgreSQL (SSL)
┌─────────────────────────▼───────────────────────────────────────┐
│                   Neon (Database)                                │
│   PostgreSQL · Serverless · Connection pooling · SSL required    │
└─────────────────────────────────────────────────────────────────┘
```

**Backend layer architecture:**
```
HTTP Request → Route Handler (FastAPI) → Service Layer → Repository → SQLAlchemy → Neon
```

---

## Screenshots

> Add screenshots or GIFs here. Recommended: Dashboard, Workout Log, Nutrition Log, Community Feed, Profile Page.

```
docs/screenshots/
├── dashboard.png
├── workout-log.png
├── nutrition-log.png
├── community-feed.png
└── profile.png
```

---

## Local Setup

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL (local) or a [Neon](https://neon.tech) free-tier database

### 1. Clone

```bash
git clone https://github.com/ashwin-portfolio/fittrack.git
cd fittrack
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fittrack
SECRET_KEY=your-secret-key-minimum-32-characters-long
ENVIRONMENT=development
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
USDA_FDC_API_KEY=your-usda-api-key    # optional, free at fdc.nal.usda.gov
```

Run migrations and start:

```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=FitTrack
```

Start:

```bash
npm run dev
```

App available at `http://localhost:3000`

---

## Deployment

| Service | Purpose | URL |
|---|---|---|
| Vercel | Frontend hosting (Next.js) | [vercel.com](https://vercel.com) |
| Railway | Backend hosting (FastAPI + Uvicorn) | [railway.app](https://railway.app) |
| Neon | Serverless PostgreSQL | [neon.tech](https://neon.tech) |

**Environment variables required in production:**

Railway (backend):
```
DATABASE_URL        # Neon connection string with ?sslmode=require
SECRET_KEY          # Generated with: openssl rand -hex 32
ENVIRONMENT         # production
BACKEND_CORS_ORIGINS  # ["https://your-app.vercel.app"]
```

Vercel (frontend):
```
NEXT_PUBLIC_API_URL   # https://your-api.railway.app/api/v1
```

---

## Database Schema

13 production tables across 5 domains:

- **Auth:** `users`, `refresh_tokens`
- **Profile:** `profiles`, `goals`
- **Workouts:** `exercises`, `workout_sessions`, `workout_exercises`, `exercise_sets`
- **Nutrition:** `nutrition_entries`
- **Progress:** `weight_logs`
- **Community:** `activity_feed_items`, `kudos`, `comments`, `follows`

Soft delete (`deleted_at`) on workouts, nutrition entries, weight logs, feed items, and comments.

See [docs/ERD.md](docs/ERD.md) for the full schema.

---

## Roadmap

### v1.0 — MVP (Completed)
- [x] Authentication (register, login, refresh tokens)
- [x] User profiles and onboarding
- [x] Exercise library (system + custom)
- [x] Workout tracking (exercises, sets, reps, weight)
- [x] Nutrition tracking with multi-source food search
- [x] Weight logging with trend charts
- [x] Dashboard analytics
- [x] Community feed, kudos, comments
- [x] Follow system and public profiles
- [x] Deployed to Vercel + Railway + Neon

### v1.1 — In Progress
- [ ] Workout Templates (save and reuse workout structures)
- [ ] Personal Records (auto-detected PRs per exercise)
- [ ] Exercise History & Progression charts
- [ ] Calorie Goals
- [ ] Enhanced Goal Management (target date, weekly frequency)

### Future
- Barcode scanner for nutrition logging
- AI-powered workout recommendations
- Mobile app (React Native)
- Workout groups and challenges

---

## Documentation

| Document | Description |
|---|---|
| [PRD.md](docs/PRD.md) | Product requirements and feature scope |
| [ERD.md](docs/ERD.md) | Database schema and entity relationships |
| [API_SPEC.md](docs/API_SPEC.md) | REST API endpoint reference |
| [BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md) | Backend layer architecture and design decisions |
| [FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md) | Frontend structure and data fetching patterns |
| [USER_STORIES.md](docs/USER_STORIES.md) | User stories with acceptance criteria |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Documentation version history |

---

## License

MIT
