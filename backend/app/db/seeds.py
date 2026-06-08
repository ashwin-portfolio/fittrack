"""
System exercise seed data — 44 pre-seeded exercises across all muscle groups.

Idempotent: checks existing system exercises before inserting. Safe to run
multiple times (Docker entrypoint runs this on every container start).

Usage:
    python -m app.db.seeds
"""
from sqlalchemy import select

import app.db.base  # noqa: F401 — registers all models with SQLAlchemy mapper
from app.db.session import SessionLocal
from app.models.exercise import Exercise

SYSTEM_EXERCISES: list[dict[str, str]] = [
    # ── Chest (6) ─────────────────────────────────────────────────────────────
    {"name": "Bench Press",          "muscle_group": "chest"},
    {"name": "Incline Bench Press",  "muscle_group": "chest"},
    {"name": "Decline Bench Press",  "muscle_group": "chest"},
    {"name": "Push-Up",              "muscle_group": "chest"},
    {"name": "Dumbbell Fly",         "muscle_group": "chest"},
    {"name": "Cable Crossover",      "muscle_group": "chest"},
    # ── Back (7) ──────────────────────────────────────────────────────────────
    {"name": "Pull-Up",              "muscle_group": "back"},
    {"name": "Chin-Up",              "muscle_group": "back"},
    {"name": "Barbell Row",          "muscle_group": "back"},
    {"name": "Dumbbell Row",         "muscle_group": "back"},
    {"name": "Lat Pulldown",         "muscle_group": "back"},
    {"name": "Seated Cable Row",     "muscle_group": "back"},
    {"name": "Deadlift",             "muscle_group": "back"},
    # ── Shoulders (5) ─────────────────────────────────────────────────────────
    {"name": "Overhead Press",           "muscle_group": "shoulders"},
    {"name": "Dumbbell Shoulder Press",  "muscle_group": "shoulders"},
    {"name": "Lateral Raise",            "muscle_group": "shoulders"},
    {"name": "Front Raise",              "muscle_group": "shoulders"},
    {"name": "Rear Delt Fly",            "muscle_group": "shoulders"},
    # ── Biceps (4) ────────────────────────────────────────────────────────────
    {"name": "Barbell Curl",    "muscle_group": "biceps"},
    {"name": "Dumbbell Curl",   "muscle_group": "biceps"},
    {"name": "Hammer Curl",     "muscle_group": "biceps"},
    {"name": "Preacher Curl",   "muscle_group": "biceps"},
    # ── Triceps (5) ───────────────────────────────────────────────────────────
    {"name": "Tricep Dips",                  "muscle_group": "triceps"},
    {"name": "Skullcrusher",                 "muscle_group": "triceps"},
    {"name": "Tricep Pushdown",              "muscle_group": "triceps"},
    {"name": "Overhead Tricep Extension",    "muscle_group": "triceps"},
    {"name": "Close Grip Bench Press",       "muscle_group": "triceps"},
    # ── Legs (7) ──────────────────────────────────────────────────────────────
    {"name": "Squat",           "muscle_group": "legs"},
    {"name": "Leg Press",       "muscle_group": "legs"},
    {"name": "Lunges",          "muscle_group": "legs"},
    {"name": "Leg Extension",   "muscle_group": "legs"},
    {"name": "Leg Curl",        "muscle_group": "legs"},
    {"name": "Calf Raise",      "muscle_group": "legs"},
    {"name": "Hip Thrust",      "muscle_group": "legs"},
    # ── Core (4) ──────────────────────────────────────────────────────────────
    {"name": "Plank",           "muscle_group": "core"},
    {"name": "Crunches",        "muscle_group": "core"},
    {"name": "Russian Twist",   "muscle_group": "core"},
    {"name": "Leg Raise",       "muscle_group": "core"},
    # ── Cardio (4) ────────────────────────────────────────────────────────────
    {"name": "Running",         "muscle_group": "cardio"},
    {"name": "Cycling",         "muscle_group": "cardio"},
    {"name": "Rowing Machine",  "muscle_group": "cardio"},
    {"name": "Jump Rope",       "muscle_group": "cardio"},
    # ── Full Body (2) ─────────────────────────────────────────────────────────
    {"name": "Burpee",              "muscle_group": "full_body"},
    {"name": "Kettlebell Swing",    "muscle_group": "full_body"},
]

assert len(SYSTEM_EXERCISES) == 44, f"Expected 44 exercises, got {len(SYSTEM_EXERCISES)}"


def seed_exercises(db) -> None:
    existing: set[str] = {
        row[0]
        for row in db.execute(
            select(Exercise.name).where(Exercise.is_system.is_(True))
        ).all()
    }
    to_insert = [
        Exercise(name=ex["name"], muscle_group=ex["muscle_group"], is_system=True)
        for ex in SYSTEM_EXERCISES
        if ex["name"] not in existing
    ]
    if to_insert:
        db.add_all(to_insert)
        db.commit()
        print(f"[seeds] Inserted {len(to_insert)} system exercise(s).")
    else:
        print("[seeds] System exercises already present — nothing to insert.")


def main() -> None:
    db = SessionLocal()
    try:
        seed_exercises(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
