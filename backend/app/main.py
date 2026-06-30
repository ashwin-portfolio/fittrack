import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

import app.db.base  # noqa: F401 — registers all ORM models before mapper config runs

from app.core.config import settings
from app.core.limiter import limiter

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.1,
        profiles_sample_rate=0.0,
        send_default_pii=False,
    )

app = FastAPI(
    title="FitTrack API",
    version="1.1.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# ── Rate limiting ─────────────────────────────────────────────────────────────
# Global default: 200 req/min per IP (set in limiter.py).
# Auth endpoints override to 10/minute via @limiter.limit("10/minute").
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
# In development: allow any localhost port (Next.js may auto-select 3001, 3002, etc.)
# In production: restrict to explicit origins in settings.BACKEND_CORS_ORIGINS
if settings.ENVIRONMENT == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"http://localhost:\d+",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# ── Routers ───────────────────────────────────────────────────────────────────
from app.api.v1.router import api_router  # noqa: E402
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "version": "1.1.0"}
