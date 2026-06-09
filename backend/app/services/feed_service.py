from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.feed import ActivityFeedItem
from app.models.user import User
from app.models.workout import WorkoutExercise, WorkoutSession
from app.repositories.feed_repository import feed_repo
from app.repositories.social_repository import social_repo
from app.schemas.social import (
    FeedItemResponse,
    FeedListResponse,
    FeedUserInfo,
    MealFeedData,
    WeightFeedData,
    WorkoutFeedData,
)


def _workout_data(session: WorkoutSession) -> WorkoutFeedData:
    exercises = session.workout_exercises
    total_sets = sum(len(we.sets) for we in exercises)
    total_volume = sum(
        s.weight_kg * s.reps for we in exercises for s in we.sets
    )
    return WorkoutFeedData(
        session_date=session.session_date,
        name=session.name,
        exercise_count=len(exercises),
        total_sets=total_sets,
        total_volume_kg=round(total_volume, 2),
        exercises=[we.exercise.name for we in exercises],
    )


def _build_item(
    fi: ActivityFeedItem,
    kudos_count: int,
    comment_count: int,
    has_kudos: bool,
) -> FeedItemResponse:
    profile = fi.user.profile
    user_info = FeedUserInfo(
        username=fi.user.username,
        full_name=profile.full_name,
        avatar_color=profile.avatar_color,
    )

    workout = _workout_data(fi.workout_session) if fi.workout_session else None
    meal = (
        MealFeedData(
            meal_type=fi.nutrition_entry.meal_type,
            food_name=fi.nutrition_entry.food_name,
            calories=fi.nutrition_entry.calories,
            protein_g=fi.nutrition_entry.protein_g,
            carbs_g=fi.nutrition_entry.carbs_g,
            fat_g=fi.nutrition_entry.fat_g,
        )
        if fi.nutrition_entry
        else None
    )
    weight = (
        WeightFeedData(weight_kg=fi.weight_log.weight_kg) if fi.weight_log else None
    )

    return FeedItemResponse(
        id=fi.id,
        activity_type=fi.activity_type,
        user=user_info,
        workout=workout,
        meal=meal,
        weight=weight,
        kudos_count=kudos_count,
        comment_count=comment_count,
        has_kudos=has_kudos,
        created_at=fi.created_at,
    )


def _annotate_items(
    db: Session,
    items: list[ActivityFeedItem],
    viewer_id: uuid.UUID,
) -> list[FeedItemResponse]:
    if not items:
        return []

    ids = [fi.id for fi in items]
    kudos_counts = social_repo.batch_kudos_counts(db, ids)
    comment_counts = social_repo.batch_comment_counts(db, ids)
    has_kudos_set = social_repo.batch_has_kudos(db, viewer_id, ids)

    return [
        _build_item(
            fi,
            kudos_count=kudos_counts.get(fi.id, 0),
            comment_count=comment_counts.get(fi.id, 0),
            has_kudos=fi.id in has_kudos_set,
        )
        for fi in items
    ]


class FeedService:
    def global_feed(
        self,
        db: Session,
        current_user: User,
        *,
        skip: int = 0,
        limit: int = 20,
        activity_type: str | None = None,
    ) -> FeedListResponse:
        items, total = feed_repo.list_global(
            db, skip=skip, limit=limit, activity_type=activity_type
        )
        return FeedListResponse(
            items=_annotate_items(db, items, current_user.id),
            total=total,
            skip=skip,
            limit=limit,
        )

    def following_feed(
        self,
        db: Session,
        current_user: User,
        *,
        skip: int = 0,
        limit: int = 20,
        activity_type: str | None = None,
    ) -> FeedListResponse:
        items, total = feed_repo.list_following(
            db,
            viewer_id=current_user.id,
            skip=skip,
            limit=limit,
            activity_type=activity_type,
        )
        return FeedListResponse(
            items=_annotate_items(db, items, current_user.id),
            total=total,
            skip=skip,
            limit=limit,
        )


feed_service = FeedService()
