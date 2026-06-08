# FitTrack MVP — Backend Architecture

**Version:** 1.0
**Framework:** FastAPI
**Language:** Python 3.12
**Database:** PostgreSQL via SQLAlchemy 2.0

---

## Folder Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                          # FastAPI app factory, middleware, router registration
│   │
│   ├── api/                             # Route handlers only — no business logic
│   │   ├── __init__.py
│   │   ├── deps.py                      # Shared dependencies (get_db, get_current_user)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py                # Registers all v1 routers
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── auth.py              # POST /auth/register, /auth/login, /auth/refresh, /auth/logout
│   │           ├── profile.py           # GET/PUT /profile/me, PUT /profile/onboarding, GET /users/:username
│   │           ├── goals.py             # GET/POST /goals
│   │           ├── exercises.py         # GET /exercises, POST /exercises
│   │           ├── workouts.py          # CRUD /workouts, /workouts/:id
│   │           ├── nutrition.py         # CRUD /nutrition, /nutrition/daily-summary
│   │           ├── weight.py            # POST/GET/DELETE /weight
│   │           ├── dashboard.py         # GET /dashboard/summary, /dashboard/charts/*
│   │           ├── feed.py              # GET /feed/global, /feed/following
│   │           ├── social.py            # POST/DELETE /kudos, GET/POST/DELETE /comments
│   │           └── follows.py           # POST/DELETE /follows, GET /followers, /following
│   │
│   ├── core/                            # App-wide config and cross-cutting concerns
│   │   ├── __init__.py
│   │   ├── config.py                    # Settings via pydantic-settings (.env loading)
│   │   ├── security.py                  # JWT encode/decode, password hash/verify, token hash
│   │   ├── exceptions.py                # Custom exception classes + handlers
│   │   └── constants.py                 # Enums: GoalType, MealType, ActivityType, Gender, MuscleGroup
│   │
│   ├── db/                              # Database connection and session management
│   │   ├── __init__.py
│   │   ├── session.py                   # SQLAlchemy engine, SessionLocal, get_db()
│   │   ├── base.py                      # DeclarativeBase + all model imports for Alembic
│   │   └── seeds.py                     # System exercise seed data (run once after migration)
│   │
│   ├── models/                          # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── mixins.py                    # TimestampMixin, SoftDeleteMixin
│   │   ├── user.py                      # User
│   │   ├── profile.py                   # Profile
│   │   ├── goal.py                      # Goal
│   │   ├── exercise.py                  # Exercise (library + custom)
│   │   ├── workout.py                   # WorkoutSession, WorkoutExercise, ExerciseSet
│   │   ├── nutrition.py                 # NutritionEntry
│   │   ├── weight.py                    # WeightLog
│   │   ├── feed.py                      # ActivityFeedItem
│   │   ├── social.py                    # Kudos, Comment, Follow
│   │   └── refresh_token.py             # RefreshToken
│   │
│   ├── schemas/                         # Pydantic v2 request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py                      # RegisterRequest, LoginRequest, TokenResponse, LogoutRequest
│   │   ├── profile.py                   # ProfileResponse, ProfileUpdate, PublicProfile, OnboardingRequest
│   │   ├── goal.py                      # GoalCreate, GoalResponse
│   │   ├── exercise.py                  # ExerciseCreate, ExerciseResponse, ExerciseSearch
│   │   ├── workout.py                   # WorkoutCreate, WorkoutResponse, ExerciseInWorkout, SetSchema
│   │   ├── nutrition.py                 # NutritionCreate, NutritionResponse, DailyNutrition
│   │   ├── weight.py                    # WeightCreate, WeightResponse, WeightHistory
│   │   ├── dashboard.py                 # DashboardSummary, ChartData, ChartPoint
│   │   ├── feed.py                      # FeedItem, FeedResponse, PaginatedFeed
│   │   └── social.py                    # KudosResponse, CommentCreate, CommentResponse, FollowResponse
│   │
│   ├── services/                        # Business logic — orchestrates repositories
│   │   ├── __init__.py
│   │   ├── auth_service.py              # register, login, logout, refresh_token
│   │   ├── profile_service.py           # get/update profile, onboarding, public profile
│   │   ├── goal_service.py              # create/update/get active goal
│   │   ├── exercise_service.py          # search exercises, create custom exercise
│   │   ├── workout_service.py           # create/get/soft-delete workout + feed item
│   │   ├── nutrition_service.py         # create/get/soft-delete nutrition + daily totals
│   │   ├── weight_service.py            # upsert/get/delete weight log
│   │   ├── dashboard_service.py         # aggregate summary + chart data
│   │   ├── feed_service.py              # paginated global/following feed queries
│   │   └── social_service.py            # kudos toggle, comment CRUD, follow/unfollow
│   │
│   ├── repositories/                    # Data access layer — all DB queries live here
│   │   ├── __init__.py
│   │   ├── user_repository.py           # get_by_email, get_by_username, create
│   │   ├── profile_repository.py        # get_by_user_id, create, update
│   │   ├── goal_repository.py           # get_active, create, deactivate_all
│   │   ├── refresh_token_repository.py  # create, get_by_hash, revoke, revoke_all_for_user
│   │   ├── exercise_repository.py       # search, get_by_id, create, list_system
│   │   ├── workout_repository.py        # create, get_by_user, get_by_id, soft_delete
│   │   ├── nutrition_repository.py      # create, get_by_user_date, daily_totals, soft_delete
│   │   ├── weight_repository.py         # upsert, get_by_user, get_history
│   │   ├── feed_repository.py           # create_item, global_feed, following_feed, soft_delete
│   │   └── social_repository.py         # kudos CRUD, comment CRUD, follow CRUD
│   │
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py                  # Pytest fixtures: test DB, test client, auth headers
│       ├── unit/
│       │   ├── __init__.py
│       │   ├── test_auth_service.py
│       │   ├── test_exercise_service.py
│       │   ├── test_workout_service.py
│       │   ├── test_nutrition_service.py
│       │   ├── test_dashboard_service.py
│       │   └── test_social_service.py
│       └── api/
│           ├── __init__.py
│           ├── test_auth.py
│           ├── test_profile.py
│           ├── test_exercises.py
│           ├── test_workouts.py
│           ├── test_nutrition.py
│           ├── test_weight.py
│           ├── test_dashboard.py
│           ├── test_feed.py
│           └── test_social.py
│
├── alembic/
│   ├── env.py                           # Alembic environment — loads app models
│   ├── script.py.mako                   # Migration template
│   └── versions/
│       └── 0001_initial_schema.py       # Initial migration — all MVP tables + indexes
│
├── .env                                 # Local environment variables (never committed)
├── .env.example                         # Template for .env (committed)
├── alembic.ini                          # Alembic config
├── Dockerfile                           # Backend container
├── requirements.txt                     # Pinned Python dependencies
└── pyproject.toml                       # Black, isort, pytest config
```

---

## Architectural Layers

```
HTTP Request
     │
     ▼
┌──────────────────────────────────────────────┐
│  API Layer  (app/api/)                        │
│  • Validates HTTP via Pydantic schemas        │
│  • Calls one service method                   │
│  • Returns HTTP response                      │
│  • Zero business logic                        │
└──────────────────────┬───────────────────────┘
                       │ calls
                       ▼
┌──────────────────────────────────────────────┐
│  Service Layer  (app/services/)               │
│  • All business logic lives here              │
│  • Orchestrates one or more repositories      │
│  • Raises domain exceptions                   │
│  • Has no knowledge of HTTP or SQLAlchemy     │
└──────────────────────┬───────────────────────┘
                       │ calls
                       ▼
┌──────────────────────────────────────────────┐
│  Repository Layer  (app/repositories/)        │
│  • All SQLAlchemy queries live here           │
│  • Returns ORM model instances                │
│  • Zero business logic                        │
│  • Receives Session via dependency injection  │
└──────────────────────┬───────────────────────┘
                       │ queries
                       ▼
┌──────────────────────────────────────────────┐
│  Database  (PostgreSQL via SQLAlchemy 2.0)    │
└──────────────────────────────────────────────┘
```

---

## Dependency Injection Pattern

Every endpoint follows this exact pattern:

```python
@router.get("/workouts")
def list_workouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = Query(default=20, le=50),
):
    return workout_service.get_user_workouts(db, user_id=current_user.id, skip=skip, limit=limit)
```

Rules:
- Route handler has exactly one service call
- No `db.query()` in route handlers
- No business logic in route handlers
- `get_db` provides a scoped session per request
- `get_current_active_user` validates JWT and loads User ORM instance

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Versioned API | `/api/v1/` prefix | Breaking changes get `/v2/` without touching v1 |
| Repository pattern | Separate repo per domain | Swap DB/driver without touching services |
| Service layer | One file per domain | Business logic is isolated and testable |
| Pydantic v2 schemas | Separate request/response schemas | Never leak ORM internals to API consumers |
| Alembic migrations | Auto-generated, manually reviewed | Schema history in git; rollback always possible |
| UUID primary keys | All tables | No sequential ID enumeration; distributed-safe |
| Soft delete | deleted_at column (not hard DELETE) | Data recovery possible; audit trail preserved |
| Refresh token hashing | SHA-256 before storage | Raw token never persisted; compromise-resistant |
| Single DB session per request | FastAPI dependency injection | No session leaks; clean transaction scope |
| ondelete=RESTRICT on exercises | FK from workout_exercises | Cannot accidentally delete referenced exercises |

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://fittrack:fittrack@db:5432/fittrack

# Security
SECRET_KEY=your-256-bit-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# App
ENVIRONMENT=development   # development | production | test
```

---

## Dependencies (`requirements.txt`)

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
alembic==1.13.3
pydantic==2.9.2
pydantic-settings==2.5.2
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
httpx==0.27.2
pytest==8.3.3
pytest-asyncio==0.24.0
pytest-cov==5.0.0
```

---

## Tooling (`pyproject.toml`)

```toml
[tool.black]
line-length = 88
target-version = ["py312"]

[tool.isort]
profile = "black"
known_first_party = ["app"]

[tool.pytest.ini_options]
testpaths = ["app/tests"]
asyncio_mode = "auto"
env = [
    "DATABASE_URL=postgresql://fittrack:fittrack@localhost:5432/fittrack_test",
    "SECRET_KEY=test-secret-key-minimum-32-chars-long",
    "ENVIRONMENT=test"
]

[tool.coverage.run]
source = ["app"]
omit = ["app/tests/*", "app/db/seeds.py"]
```

---

## Auth Flow

```
Registration
  POST /auth/register
    → hash password (bcrypt, cost=12)
    → create User record
    → create Profile record
    → issue access_token (JWT, 30min)
    → create RefreshToken record (hash stored, raw returned)
    → return { access_token, refresh_token }

Login
  POST /auth/login
    → verify password against hash
    → create new RefreshToken record
    → return { access_token, refresh_token }

Token Refresh
  POST /auth/refresh
    → hash incoming refresh_token
    → look up by token_hash
    → verify not revoked and not expired
    → issue new access_token
    → return { access_token }

Logout
  POST /auth/logout
    → hash incoming refresh_token
    → set revoked_at = now() on RefreshToken record
    → return { message: "Logged out" }

Protected Request
  Any protected endpoint
    → extract Bearer token from Authorization header
    → decode JWT, verify signature and expiry
    → load User from DB, verify is_active = true
    → inject User into route handler
```

---

## Soft Delete Convention

All soft-delete queries follow this pattern in repositories:

```python
# Read — always filter soft-deleted records
def get_by_user(self, db, user_id, skip=0, limit=20):
    return (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.deleted_at.is_(None),
        )
        .order_by(WorkoutSession.session_date.desc())
        .offset(skip).limit(limit)
        .all()
    )

# Delete — set deleted_at, never remove row
def soft_delete(self, db, session: WorkoutSession):
    session.deleted_at = datetime.now(timezone.utc)
    db.commit()
```

Service layer cascades soft deletes:

```python
# When workout is deleted, also soft-delete its feed item
def delete_workout(self, db, workout_id, user_id):
    workout = workout_repo.get_by_id(db, workout_id, user_id)
    workout_repo.soft_delete(db, workout)
    feed_repo.soft_delete_by_workout(db, workout_id)  # cascade
```

---

## Migration Strategy

- All schema changes via Alembic migrations
- Every migration has `upgrade()` and `downgrade()`
- Never drop columns — mark nullable and deprecate
- Migration files committed alongside model changes
- Applied automatically on container startup:

```dockerfile
CMD ["sh", "-c", "alembic upgrade head && python -m app.db.seeds && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```
