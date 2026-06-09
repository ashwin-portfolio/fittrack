from fastapi import APIRouter

from app.api.v1.endpoints import auth, exercises, nutrition, profile, workouts

api_router = APIRouter()

# ── Auth ──────────────────────────────────────────────────────────────────────
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# ── Profile ───────────────────────────────────────────────────────────────────
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])

# ── Exercises ─────────────────────────────────────────────────────────────────
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])

# ── Workouts ──────────────────────────────────────────────────────────────────
api_router.include_router(workouts.router, prefix="/workouts", tags=["workouts"])

# ── Nutrition ─────────────────────────────────────────────────────────────────
api_router.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])

# ── Remaining routers added here as each module is implemented ────────────────
# ORDERING RULE: within every sub-router, register literal-path routes BEFORE
# parameterized routes. FastAPI matches top-to-bottom; if a parameterized route
# comes first, FastAPI tries to parse the literal segment as the param type and
# returns 422 instead of routing correctly.
#
# Correct order inside each endpoint file:
#
#   GET  /nutrition/daily-summary   ← literal, registered first
#   GET  /nutrition                 ← no param
#   POST /nutrition                 ← no param
#   DELETE /nutrition/{id}          ← parameterized LAST
#
#   GET  /weight/history            ← literal, registered first
#   POST /weight                    ← no param
#   DELETE /weight/{id}             ← parameterized LAST
#
# from app.api.v1.endpoints import profile
# api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
#
# from app.api.v1.endpoints import users
# api_router.include_router(users.router, prefix="/users", tags=["users"])
#
# from app.api.v1.endpoints import goals
# api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
#
# from app.api.v1.endpoints import exercises
# api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
#
# from app.api.v1.endpoints import workouts
# api_router.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
#
# from app.api.v1.endpoints import nutrition
# api_router.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])
#
# from app.api.v1.endpoints import weight
# api_router.include_router(weight.router, prefix="/weight", tags=["weight"])
#
# from app.api.v1.endpoints import dashboard
# api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
#
# from app.api.v1.endpoints import feed
# api_router.include_router(feed.router, prefix="/feed", tags=["feed"])
#
# from app.api.v1.endpoints import social
# api_router.include_router(social.router, tags=["social"])
#
# from app.api.v1.endpoints import follows
# api_router.include_router(follows.router, prefix="/follows", tags=["follows"])
