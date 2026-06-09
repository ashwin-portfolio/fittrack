"""
System exercise seed data — 121 pre-seeded exercises across all muscle groups.

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
    # ── Chest (13) ────────────────────────────────────────────────────────────
    {"name": "Bench Press",             "muscle_group": "chest"},
    {"name": "Incline Bench Press",     "muscle_group": "chest"},
    {"name": "Decline Bench Press",     "muscle_group": "chest"},
    {"name": "Dumbbell Bench Press",    "muscle_group": "chest"},
    {"name": "Incline Dumbbell Press",  "muscle_group": "chest"},
    {"name": "Push-Up",                 "muscle_group": "chest"},
    {"name": "Wide Push-Up",            "muscle_group": "chest"},
    {"name": "Dumbbell Fly",            "muscle_group": "chest"},
    {"name": "Incline Dumbbell Fly",    "muscle_group": "chest"},
    {"name": "Cable Crossover",         "muscle_group": "chest"},
    {"name": "Incline Cable Fly",       "muscle_group": "chest"},
    {"name": "Chest Dip",               "muscle_group": "chest"},
    {"name": "Pec Deck Machine",        "muscle_group": "chest"},
    # ── Back (16) ─────────────────────────────────────────────────────────────
    {"name": "Deadlift",                "muscle_group": "back"},
    {"name": "Pull-Up",                 "muscle_group": "back"},
    {"name": "Chin-Up",                 "muscle_group": "back"},
    {"name": "Neutral-Grip Pull-Up",    "muscle_group": "back"},
    {"name": "Inverted Row",            "muscle_group": "back"},
    {"name": "Barbell Row",             "muscle_group": "back"},
    {"name": "Pendlay Row",             "muscle_group": "back"},
    {"name": "Dumbbell Row",            "muscle_group": "back"},
    {"name": "T-Bar Row",               "muscle_group": "back"},
    {"name": "Chest-Supported Row",     "muscle_group": "back"},
    {"name": "Lat Pulldown",            "muscle_group": "back"},
    {"name": "Wide-Grip Lat Pulldown",  "muscle_group": "back"},
    {"name": "Seated Cable Row",        "muscle_group": "back"},
    {"name": "Single-Arm Cable Row",    "muscle_group": "back"},
    {"name": "Rack Pull",               "muscle_group": "back"},
    {"name": "Hyperextension",          "muscle_group": "back"},
    # ── Shoulders (14) ────────────────────────────────────────────────────────
    {"name": "Overhead Press",          "muscle_group": "shoulders"},
    {"name": "Push Press",              "muscle_group": "shoulders"},
    {"name": "Dumbbell Shoulder Press", "muscle_group": "shoulders"},
    {"name": "Arnold Press",            "muscle_group": "shoulders"},
    {"name": "Machine Shoulder Press",  "muscle_group": "shoulders"},
    {"name": "Lateral Raise",           "muscle_group": "shoulders"},
    {"name": "Cable Lateral Raise",     "muscle_group": "shoulders"},
    {"name": "Front Raise",             "muscle_group": "shoulders"},
    {"name": "Rear Delt Fly",           "muscle_group": "shoulders"},
    {"name": "Bent-Over Lateral Raise", "muscle_group": "shoulders"},
    {"name": "Upright Row",             "muscle_group": "shoulders"},
    {"name": "Band Pull-Apart",         "muscle_group": "shoulders"},
    {"name": "Barbell Shrug",           "muscle_group": "shoulders"},
    {"name": "Dumbbell Shrug",          "muscle_group": "shoulders"},
    # ── Biceps (11) ───────────────────────────────────────────────────────────
    {"name": "Barbell Curl",            "muscle_group": "biceps"},
    {"name": "EZ-Bar Curl",             "muscle_group": "biceps"},
    {"name": "Dumbbell Curl",           "muscle_group": "biceps"},
    {"name": "Incline Dumbbell Curl",   "muscle_group": "biceps"},
    {"name": "Hammer Curl",             "muscle_group": "biceps"},
    {"name": "Cross-Body Hammer Curl",  "muscle_group": "biceps"},
    {"name": "Preacher Curl",           "muscle_group": "biceps"},
    {"name": "Concentration Curl",      "muscle_group": "biceps"},
    {"name": "Cable Curl",              "muscle_group": "biceps"},
    {"name": "Reverse Curl",            "muscle_group": "biceps"},
    {"name": "Zottman Curl",            "muscle_group": "biceps"},
    # ── Triceps (11) ──────────────────────────────────────────────────────────
    {"name": "Close Grip Bench Press",          "muscle_group": "triceps"},
    {"name": "Tricep Dips",                     "muscle_group": "triceps"},
    {"name": "Diamond Push-Up",                 "muscle_group": "triceps"},
    {"name": "Skullcrusher",                    "muscle_group": "triceps"},
    {"name": "Tate Press",                      "muscle_group": "triceps"},
    {"name": "Tricep Pushdown",                 "muscle_group": "triceps"},
    {"name": "Rope Pushdown",                   "muscle_group": "triceps"},
    {"name": "Single-Arm Tricep Pushdown",      "muscle_group": "triceps"},
    {"name": "Overhead Tricep Extension",       "muscle_group": "triceps"},
    {"name": "Overhead Cable Tricep Extension", "muscle_group": "triceps"},
    {"name": "Tricep Kickback",                 "muscle_group": "triceps"},
    # ── Legs (21) ─────────────────────────────────────────────────────────────
    {"name": "Squat",                   "muscle_group": "legs"},
    {"name": "Front Squat",             "muscle_group": "legs"},
    {"name": "Goblet Squat",            "muscle_group": "legs"},
    {"name": "Sumo Squat",              "muscle_group": "legs"},
    {"name": "Hack Squat",              "muscle_group": "legs"},
    {"name": "Leg Press",               "muscle_group": "legs"},
    {"name": "Bulgarian Split Squat",   "muscle_group": "legs"},
    {"name": "Lunges",                  "muscle_group": "legs"},
    {"name": "Walking Lunge",           "muscle_group": "legs"},
    {"name": "Reverse Lunge",           "muscle_group": "legs"},
    {"name": "Step-Up",                 "muscle_group": "legs"},
    {"name": "Leg Extension",           "muscle_group": "legs"},
    {"name": "Leg Curl",                "muscle_group": "legs"},
    {"name": "Nordic Curl",             "muscle_group": "legs"},
    {"name": "Romanian Deadlift",       "muscle_group": "legs"},
    {"name": "Stiff-Leg Deadlift",      "muscle_group": "legs"},
    {"name": "Hip Thrust",              "muscle_group": "legs"},
    {"name": "Glute Bridge",            "muscle_group": "legs"},
    {"name": "Calf Raise",              "muscle_group": "legs"},
    {"name": "Seated Calf Raise",       "muscle_group": "legs"},
    {"name": "Box Jump",                "muscle_group": "legs"},
    # ── Core (15) ─────────────────────────────────────────────────────────────
    {"name": "Plank",                   "muscle_group": "core"},
    {"name": "Side Plank",              "muscle_group": "core"},
    {"name": "Hollow Body Hold",        "muscle_group": "core"},
    {"name": "Dead Bug",                "muscle_group": "core"},
    {"name": "Crunches",                "muscle_group": "core"},
    {"name": "Bicycle Crunch",          "muscle_group": "core"},
    {"name": "V-Up",                    "muscle_group": "core"},
    {"name": "Sit-Up",                  "muscle_group": "core"},
    {"name": "Leg Raise",               "muscle_group": "core"},
    {"name": "Hanging Knee Raise",      "muscle_group": "core"},
    {"name": "Hanging Leg Raise",       "muscle_group": "core"},
    {"name": "Russian Twist",           "muscle_group": "core"},
    {"name": "Cable Crunch",            "muscle_group": "core"},
    {"name": "Ab Wheel Rollout",        "muscle_group": "core"},
    {"name": "Pallof Press",            "muscle_group": "core"},
    # ── Cardio (10) ───────────────────────────────────────────────────────────
    {"name": "Running",                 "muscle_group": "cardio"},
    {"name": "Sprint Intervals",        "muscle_group": "cardio"},
    {"name": "Cycling",                 "muscle_group": "cardio"},
    {"name": "Assault Bike",            "muscle_group": "cardio"},
    {"name": "Rowing Machine",          "muscle_group": "cardio"},
    {"name": "Elliptical",              "muscle_group": "cardio"},
    {"name": "Stair Climber",           "muscle_group": "cardio"},
    {"name": "Swimming",                "muscle_group": "cardio"},
    {"name": "Jump Rope",               "muscle_group": "cardio"},
    {"name": "Battle Ropes",            "muscle_group": "cardio"},
    # ── Full Body (10) ────────────────────────────────────────────────────────
    {"name": "Burpee",                  "muscle_group": "full_body"},
    {"name": "Thruster",                "muscle_group": "full_body"},
    {"name": "Clean and Press",         "muscle_group": "full_body"},
    {"name": "Power Clean",             "muscle_group": "full_body"},
    {"name": "Kettlebell Swing",        "muscle_group": "full_body"},
    {"name": "Turkish Get-Up",          "muscle_group": "full_body"},
    {"name": "Farmer's Walk",           "muscle_group": "full_body"},
    {"name": "Bear Crawl",              "muscle_group": "full_body"},
    {"name": "Man Maker",               "muscle_group": "full_body"},
    {"name": "Wall Ball",               "muscle_group": "full_body"},
]

assert len(SYSTEM_EXERCISES) == 121, f"Expected 121 exercises, got {len(SYSTEM_EXERCISES)}"


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
