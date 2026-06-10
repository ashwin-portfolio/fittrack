FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create non-root user and transfer ownership
RUN groupadd --system --gid 1001 appuser \
    && useradd --system --uid 1001 --gid 1001 --no-create-home appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# PORT is injected by Railway; fallback to 8000 for local docker runs
CMD ["sh", "-c", "alembic upgrade head && python -m app.db.seeds && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
