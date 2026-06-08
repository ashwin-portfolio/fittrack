from slowapi import Limiter
from slowapi.util import get_remote_address

# Module-level singleton — import `limiter` in auth endpoints to apply
# per-route rate limits:
#
#   from app.core.limiter import limiter
#
#   @router.post("/login")
#   @limiter.limit("10/minute")
#   async def login(request: Request, ...):
#       ...
#
# The limiter is wired to app.state in app/main.py.
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
