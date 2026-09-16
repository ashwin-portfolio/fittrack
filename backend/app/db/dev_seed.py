"""
Local development fixtures — throwaway accounts and sample history.

Creates two accounts with deliberately weak, well-known credentials so the app
can be signed into and driven locally without registering through the UI:

    admin / admin      the account you log in as
    demo  / demo       a second user, so there is someone else's activity in
                       the feed to give kudos to (the API rejects kudos on your
                       own activity)

It also backfills workout history for both, so exercise progression, volume and
personal records have something to render.

This is a development fixture, NOT a backdoor: the passwords go through the
same hashing as a real registration, and the login path is untouched. The guard
below refuses to run outside ENVIRONMENT=development, so it cannot seed a
staging or production database even if invoked there by mistake.

Idempotent. Safe to re-run — it resets the passwords and skips history for a
user that already has workouts.

Usage (from backend/):
    python -m app.db.dev_seed
"""
from __future__ import annotations

import sys
from datetime import date, timedelta

from sqlalchemy import func, select

import app.db.base  # noqa: F401 — registers all models with SQLAlchemy mapper
from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.exercise import Exercise
from app.models.feed import ActivityFeedItem
from app.models.profile import Profile
from app.models.social import Follow
from app.models.water import WaterGoal, WaterLog
from app.models.user import User
from app.models.workout import ExerciseSet, WorkoutExercise, WorkoutSession
from app.repositories.profile_repository import _avatar_color

# username -> (password, email, display name)
DEV_USERS: dict[str, tuple[str, str, str]] = {
    "admin": ("admin", "admin@fittrack.local", "Admin"),
    "demo": ("demo", "demo@fittrack.local", "Demo User"),
}

# Exercise name -> (starting weight kg, kg added per session, reps per set)
PROGRESSION = {
    "Bench Press": (60.0, 2.5, 8),
    "Squat": (80.0, 5.0, 5),
    "Deadlift": (100.0, 5.0, 5),
}

SESSION_COUNT = 8
DAYS_BETWEEN_SESSIONS = 7

# Enough filler accounts to push the follow lists past one page (limit 20),
# so infinite scroll and cursor paging have something to page through. They are
# all created in one transaction and therefore share a created_at to the
# microsecond — which is exactly the tie the (created_at, id) cursor exists to
# break.
FILLER_FOLLOWERS = 45
FILLER_FOLLOWING = 25

WATER_GOAL_ML = 2000
# Trailing daily totals (ml), oldest first — deliberately uneven, including a
# zero day, so the history chart has something other than a flat line to show.
WATER_DAILY_ML = [1500, 2250, 0, 1750, 2500, 2000, 1250, 2750, 1000, 2000,
                  2250, 1500, 2500, 1750]


def _upsert_user(db, username: str, password: str, email: str, full_name: str) -> User:
    user = db.scalar(select(User).where(User.username == username))

    if user is None:
        user = User(
            email=email,
            username=username,
            hashed_password=hash_password(password),
            is_active=True,
            is_email_verified=True,
        )
        db.add(user)
        db.flush()
        print(f"  created user  {username}")
    else:
        # Re-running resets the password, in case it drifted during testing.
        user.hashed_password = hash_password(password)
        user.is_active = True
        user.is_email_verified = True
        db.flush()
        print(f"  reset user    {username}")

    profile = db.scalar(select(Profile).where(Profile.user_id == user.id))
    if profile is None:
        db.add(
            Profile(
                user_id=user.id,
                full_name=full_name,
                avatar_color=_avatar_color(username),
                is_public=True,
                onboarding_complete=True,
            )
        )
        db.flush()
        print(f"  created profile for {username}")

    return user


def _seed_workouts(db, user: User, *, share_to_feed: bool) -> None:
    existing = db.scalar(
        select(func.count())
        .select_from(WorkoutSession)
        .where(WorkoutSession.user_id == user.id)
    )
    # Top up an account that only has a handful of sessions — a two-point chart
    # says nothing about progression. Stops once there is enough to look at.
    if existing >= SESSION_COUNT:
        print(f"  {user.username} already has {existing} workouts — skipping history")
        return

    exercises: dict[str, Exercise] = {}
    for name in PROGRESSION:
        ex = db.scalar(select(Exercise).where(Exercise.name == name))
        if ex is None:
            print(f"  !! exercise '{name}' not found — run `python -m app.db.seeds` first")
            continue
        exercises[name] = ex

    if not exercises:
        return

    today = date.today()
    created = 0

    for i in range(SESSION_COUNT):
        # Oldest session first, so weights climb toward today. Offset by a day so
        # seeded sessions never land on a date the account already has.
        offset = (SESSION_COUNT - 1 - i) * DAYS_BETWEEN_SESSIONS + 1
        session = WorkoutSession(
            user_id=user.id,
            session_date=today - timedelta(days=offset),
            name=f"Session {i + 1}",
            is_shared=share_to_feed,
        )
        db.add(session)
        db.flush()

        for order, (name, ex) in enumerate(exercises.items()):
            start, step, reps = PROGRESSION[name]
            weight = start + step * i

            we = WorkoutExercise(
                session_id=session.id,
                exercise_id=ex.id,
                order_index=order,
            )
            db.add(we)
            db.flush()

            for set_number in range(1, 4):
                db.add(
                    ExerciseSet(
                        workout_exercise_id=we.id,
                        set_number=set_number,
                        reps=reps,
                        weight_kg=weight,
                    )
                )

        if share_to_feed:
            db.add(
                ActivityFeedItem(
                    user_id=user.id,
                    activity_type="workout",
                    workout_session_id=session.id,
                    is_public=True,
                )
            )

        created += 1

    db.flush()
    print(f"  seeded {created} workouts for {user.username}"
          + (" (shared to feed)" if share_to_feed else ""))


def _seed_water(db, user: User) -> None:
    existing = db.scalar(
        select(func.count()).select_from(WaterLog).where(WaterLog.user_id == user.id)
    )
    if existing:
        print(f"  {user.username} already has {existing} water logs — skipping")
        return

    if db.scalar(select(WaterGoal).where(WaterGoal.user_id == user.id)) is None:
        db.add(WaterGoal(user_id=user.id, daily_target_ml=WATER_GOAL_ML))

    today = date.today()
    logged = 0

    for offset, total_ml in enumerate(reversed(WATER_DAILY_ML)):
        if total_ml == 0:
            continue
        log_date = today - timedelta(days=offset)
        # Split the day's total into realistic glass-sized entries.
        remaining = total_ml
        while remaining > 0:
            amount = min(250, remaining)
            db.add(WaterLog(user_id=user.id, log_date=log_date, amount_ml=amount))
            remaining -= amount
        logged += 1

    db.flush()
    print(f"  seeded water for {logged} days for {user.username}")


def _seed_follow_crowd(db, target: User) -> None:
    """Filler accounts following `target`, and `target` following some back."""
    existing = db.scalar(
        select(func.count()).select_from(Follow).where(Follow.following_id == target.id)
    )
    if existing >= FILLER_FOLLOWERS:
        print(f"  {target.username} already has {existing} followers — skipping crowd")
        return

    created = 0
    for i in range(1, FILLER_FOLLOWERS + 1):
        username = f"fan{i:02d}"
        user = db.scalar(select(User).where(User.username == username))
        if user is None:
            user = User(
                email=f"{username}@fittrack.local",
                username=username,
                hashed_password=hash_password(username),
                is_active=True,
                is_email_verified=True,
            )
            db.add(user)
            db.flush()
            db.add(
                Profile(
                    user_id=user.id,
                    full_name=f"Fan {i:02d}",
                    bio=f"Filler account #{i} for pagination testing.",
                    avatar_color=_avatar_color(username),
                    is_public=True,
                    onboarding_complete=True,
                )
            )
            created += 1

        if not db.scalar(
            select(Follow).where(
                Follow.follower_id == user.id, Follow.following_id == target.id
            )
        ):
            db.add(Follow(follower_id=user.id, following_id=target.id))

        # Follow a subset back, so the Following list pages too but differs
        # from the Followers list.
        if i <= FILLER_FOLLOWING and not db.scalar(
            select(Follow).where(
                Follow.follower_id == target.id, Follow.following_id == user.id
            )
        ):
            db.add(Follow(follower_id=target.id, following_id=user.id))

    db.flush()
    print(f"  seeded {created} filler accounts; {target.username} now has "
          f"{FILLER_FOLLOWERS} followers / {FILLER_FOLLOWING}+ following")


def _follow(db, follower: User, followed: User) -> None:
    exists = db.scalar(
        select(Follow).where(
            Follow.follower_id == follower.id,
            Follow.following_id == followed.id,
        )
    )
    if exists:
        return
    db.add(Follow(follower_id=follower.id, following_id=followed.id))
    db.flush()
    print(f"  {follower.username} now follows {followed.username}")


def main() -> None:
    if settings.ENVIRONMENT != "development":
        sys.exit(
            f"refusing to run: ENVIRONMENT is '{settings.ENVIRONMENT}', not 'development'.\n"
            "These fixtures use throwaway passwords and must never touch a real database."
        )

    print(f"Seeding dev fixtures into {settings.DATABASE_URL.rsplit('@', 1)[-1]}")

    db = SessionLocal()
    try:
        users: dict[str, User] = {}
        for username, (password, email, full_name) in DEV_USERS.items():
            users[username] = _upsert_user(db, username, password, email, full_name)

        # Only demo's workouts reach the feed — admin needs someone else's
        # activity to give kudos to.
        _seed_workouts(db, users["admin"], share_to_feed=False)
        _seed_workouts(db, users["demo"], share_to_feed=True)

        _seed_water(db, users["admin"])

        _seed_follow_crowd(db, users["admin"])

        _follow(db, users["admin"], users["demo"])

        db.commit()
        print("\nDone. Sign in at http://localhost:3000/login with:")
        for username, (password, _, _) in DEV_USERS.items():
            print(f"  {username} / {password}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
