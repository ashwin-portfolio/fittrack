from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.feed import ActivityFeedItem
from app.models.profile import Profile
from app.models.social import Follow
from app.models.user import User
from app.models.workout import WorkoutExercise, WorkoutSession


def _feed_load_opts():
    return [
        selectinload(ActivityFeedItem.user).selectinload(User.profile),
        (
            selectinload(ActivityFeedItem.workout_session)
            .selectinload(WorkoutSession.workout_exercises)
            .selectinload(WorkoutExercise.exercise)
        ),
        (
            selectinload(ActivityFeedItem.workout_session)
            .selectinload(WorkoutSession.workout_exercises)
            .selectinload(WorkoutExercise.sets)
        ),
        selectinload(ActivityFeedItem.nutrition_entry),
        selectinload(ActivityFeedItem.weight_log),
    ]


class FeedRepository:
    def create_feed_item(
        self,
        db: Session,
        *,
        user_id: uuid.UUID,
        activity_type: str,
        workout_session_id: uuid.UUID | None = None,
        nutrition_entry_id: uuid.UUID | None = None,
        weight_log_id: uuid.UUID | None = None,
        is_public: bool = True,
    ) -> ActivityFeedItem:
        item = ActivityFeedItem(
            user_id=user_id,
            activity_type=activity_type,
            workout_session_id=workout_session_id,
            nutrition_entry_id=nutrition_entry_id,
            weight_log_id=weight_log_id,
            is_public=is_public,
        )
        db.add(item)
        db.flush()
        return item

    def soft_delete_by_workout(self, db: Session, session_id: uuid.UUID) -> None:
        item = db.scalar(
            select(ActivityFeedItem).where(
                ActivityFeedItem.workout_session_id == session_id,
                ActivityFeedItem.deleted_at.is_(None),
            )
        )
        if item:
            item.deleted_at = datetime.now(timezone.utc)
            db.flush()

    def soft_delete_by_nutrition(self, db: Session, entry_id: uuid.UUID) -> None:
        item = db.scalar(
            select(ActivityFeedItem).where(
                ActivityFeedItem.nutrition_entry_id == entry_id,
                ActivityFeedItem.deleted_at.is_(None),
            )
        )
        if item:
            item.deleted_at = datetime.now(timezone.utc)
            db.flush()

    def soft_delete_by_weight(self, db: Session, weight_log_id: uuid.UUID) -> None:
        item = db.scalar(
            select(ActivityFeedItem).where(
                ActivityFeedItem.weight_log_id == weight_log_id,
                ActivityFeedItem.deleted_at.is_(None),
            )
        )
        if item:
            item.deleted_at = datetime.now(timezone.utc)
            db.flush()

    def get_by_id(self, db: Session, feed_item_id: uuid.UUID) -> ActivityFeedItem | None:
        return db.scalar(
            select(ActivityFeedItem)
            .options(*_feed_load_opts())
            .where(
                ActivityFeedItem.id == feed_item_id,
                ActivityFeedItem.deleted_at.is_(None),
            )
        )

    def list_global(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 20,
        activity_type: str | None = None,
    ) -> tuple[list[ActivityFeedItem], int]:
        base = select(ActivityFeedItem).where(
            ActivityFeedItem.is_public.is_(True),
            ActivityFeedItem.deleted_at.is_(None),
        )
        if activity_type:
            base = base.where(ActivityFeedItem.activity_type == activity_type)

        total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
        items = db.scalars(
            base.options(*_feed_load_opts())
            .order_by(ActivityFeedItem.created_at.desc())
            .limit(limit)
            .offset(skip)
        ).all()
        return list(items), total

    def list_following(
        self,
        db: Session,
        *,
        viewer_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
        activity_type: str | None = None,
    ) -> tuple[list[ActivityFeedItem], int]:
        # Sub-select: IDs of users that viewer follows
        following_sq = select(Follow.following_id).where(Follow.follower_id == viewer_id)

        base = select(ActivityFeedItem).where(
            ActivityFeedItem.user_id.in_(following_sq),
            ActivityFeedItem.is_public.is_(True),
            ActivityFeedItem.deleted_at.is_(None),
        )
        if activity_type:
            base = base.where(ActivityFeedItem.activity_type == activity_type)

        total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
        items = db.scalars(
            base.options(*_feed_load_opts())
            .order_by(ActivityFeedItem.created_at.desc())
            .limit(limit)
            .offset(skip)
        ).all()
        return list(items), total

    def list_for_user(
        self, db: Session, user_id: uuid.UUID, limit: int = 5
    ) -> list[ActivityFeedItem]:
        return list(
            db.scalars(
                select(ActivityFeedItem)
                .options(*_feed_load_opts())
                .where(
                    ActivityFeedItem.user_id == user_id,
                    ActivityFeedItem.is_public.is_(True),
                    ActivityFeedItem.deleted_at.is_(None),
                )
                .order_by(ActivityFeedItem.created_at.desc())
                .limit(limit)
            ).all()
        )


feed_repo = FeedRepository()
