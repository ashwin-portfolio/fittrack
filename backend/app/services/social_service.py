from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.feed_repository import feed_repo
from app.repositories.social_repository import social_repo
from app.repositories.user_repository import user_repo
from app.schemas.social import (
    CommentCreateRequest,
    CommentListResponse,
    CommentResponse,
    FollowerListItem,
    FollowerListResponse,
    FollowResponse,
    FeedUserInfo,
    KudosResponse,
    UserActivitySummary,
    UserListItem,
    UserListResponse,
    UserProfileResponse,
)


def _user_info_from(user, profile) -> FeedUserInfo:
    return FeedUserInfo(
        username=user.username,
        full_name=profile.full_name,
        avatar_color=profile.avatar_color,
    )


class SocialService:
    # ── Kudos ─────────────────────────────────────────────────────────────────

    def give_kudos(
        self, db: Session, current_user: User, feed_item_id: uuid.UUID
    ) -> KudosResponse:
        fi = feed_repo.get_by_id(db, feed_item_id)
        if fi is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed item not found.")
        if fi.user_id == current_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot Kudos your own activity.")
        if social_repo.get_kudos(db, current_user.id, feed_item_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already given Kudos.")
        social_repo.add_kudos(db, current_user.id, feed_item_id)
        return KudosResponse(
            feed_item_id=feed_item_id,
            kudos_count=social_repo.kudos_count(db, feed_item_id),
            has_kudos=True,
        )

    def remove_kudos(
        self, db: Session, current_user: User, feed_item_id: uuid.UUID
    ) -> KudosResponse:
        fi = feed_repo.get_by_id(db, feed_item_id)
        if fi is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed item not found.")
        k = social_repo.get_kudos(db, current_user.id, feed_item_id)
        if k:
            social_repo.remove_kudos(db, k)
        return KudosResponse(
            feed_item_id=feed_item_id,
            kudos_count=social_repo.kudos_count(db, feed_item_id),
            has_kudos=False,
        )

    # ── Comments ──────────────────────────────────────────────────────────────

    def list_comments(
        self, db: Session, current_user: User, feed_item_id: uuid.UUID
    ) -> CommentListResponse:
        fi = feed_repo.get_by_id(db, feed_item_id)
        if fi is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed item not found.")
        comments = social_repo.list_comments(db, feed_item_id)
        return CommentListResponse(
            items=[
                CommentResponse(
                    id=c.id,
                    user=_user_info_from(c.user, c.user.profile),
                    content=c.content,
                    is_own=c.user_id == current_user.id,
                    created_at=c.created_at,
                )
                for c in comments
            ],
            total=len(comments),
        )

    def add_comment(
        self,
        db: Session,
        current_user: User,
        feed_item_id: uuid.UUID,
        body: CommentCreateRequest,
    ) -> CommentResponse:
        fi = feed_repo.get_by_id(db, feed_item_id)
        if fi is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed item not found.")
        c = social_repo.add_comment(
            db,
            user_id=current_user.id,
            feed_item_id=feed_item_id,
            content=body.content,
        )
        return CommentResponse(
            id=c.id,
            user=_user_info_from(c.user, c.user.profile),
            content=c.content,
            is_own=True,
            created_at=c.created_at,
        )

    def delete_comment(
        self, db: Session, current_user: User, comment_id: uuid.UUID
    ) -> None:
        c = social_repo.get_comment_by_id(db, comment_id)
        if c is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")
        if c.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another user's comment.")
        social_repo.soft_delete_comment(db, c)

    # ── Follows ───────────────────────────────────────────────────────────────

    def follow(self, db: Session, current_user: User, username: str) -> FollowResponse:
        target = user_repo.get_by_username(db, username)
        if target is None or not target.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        if target.id == current_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself.")
        if social_repo.get_follow(db, current_user.id, target.id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already following this user.")
        social_repo.add_follow(db, current_user.id, target.id)
        return FollowResponse(
            username=target.username,
            is_following=True,
            follower_count=social_repo.follower_count(db, target.id),
        )

    def unfollow(self, db: Session, current_user: User, username: str) -> FollowResponse:
        target = user_repo.get_by_username(db, username)
        if target is None or not target.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        f = social_repo.get_follow(db, current_user.id, target.id)
        if f:
            social_repo.remove_follow(db, f)
        return FollowResponse(
            username=target.username,
            is_following=False,
            follower_count=social_repo.follower_count(db, target.id),
        )

    # ── Users ─────────────────────────────────────────────────────────────────

    def list_users(
        self,
        db: Session,
        current_user: User,
        *,
        q: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> UserListResponse:
        pairs, total = social_repo.search_public_users(
            db, exclude_user_id=current_user.id, q=q, skip=skip, limit=limit
        )
        if not pairs:
            return UserListResponse(items=[], total=total, skip=skip, limit=limit)

        user_ids = [u.id for u, _ in pairs]
        follower_counts = social_repo.batch_follower_counts(db, user_ids)
        is_following_set = social_repo.batch_is_following(db, current_user.id, user_ids)

        items = [
            UserListItem(
                username=u.username,
                full_name=p.full_name,
                avatar_color=p.avatar_color,
                bio=p.bio,
                follower_count=follower_counts.get(u.id, 0),
                is_following=u.id in is_following_set,
            )
            for u, p in pairs
        ]
        return UserListResponse(items=items, total=total, skip=skip, limit=limit)

    def get_user_profile(
        self, db: Session, current_user: User, username: str
    ) -> UserProfileResponse:
        target = user_repo.get_by_username(db, username)
        if target is None or not target.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        profile = target.profile
        follower_count = social_repo.follower_count(db, target.id)
        following_count = social_repo.following_count(db, target.id)
        is_following = bool(social_repo.get_follow(db, current_user.id, target.id))

        # Recent public activities (empty for private profiles unless the viewer follows)
        can_see = profile.is_public or is_following or target.id == current_user.id
        recent_activities: list[UserActivitySummary] = []
        if can_see:
            feed_items = feed_repo.list_for_user(db, target.id, limit=5)
            for fi in feed_items:
                summary = self._activity_summary(fi)
                recent_activities.append(
                    UserActivitySummary(
                        id=fi.id,
                        activity_type=fi.activity_type,
                        summary=summary,
                        created_at=fi.created_at,
                    )
                )

        return UserProfileResponse(
            username=target.username,
            full_name=profile.full_name,
            bio=profile.bio,
            avatar_color=profile.avatar_color,
            is_public=profile.is_public,
            follower_count=follower_count,
            following_count=following_count,
            is_following=is_following,
            recent_activities=recent_activities,
        )

    def _activity_summary(self, fi) -> str:
        if fi.activity_type == "workout" and fi.workout_session:
            ws = fi.workout_session
            cnt = len(ws.workout_exercises)
            total_sets = sum(len(we.sets) for we in ws.workout_exercises)
            return f"{ws.name or 'Workout'} — {cnt} exercises, {total_sets} sets"
        if fi.activity_type == "meal" and fi.nutrition_entry:
            ne = fi.nutrition_entry
            return f"{ne.meal_type.title()} — {int(ne.calories)} kcal"
        if fi.activity_type == "weight" and fi.weight_log:
            return f"{fi.weight_log.weight_kg} kg logged"
        return fi.activity_type

    def list_followers(
        self,
        db: Session,
        current_user: User,
        username: str,
        skip: int = 0,
        limit: int = 20,
    ) -> FollowerListResponse:
        target = user_repo.get_by_username(db, username)
        if target is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        pairs, total = social_repo.get_followers(db, target.id, skip=skip, limit=limit)
        if not pairs:
            return FollowerListResponse(items=[], total=total, skip=skip, limit=limit)

        user_ids = [u.id for u, _ in pairs]
        is_following_set = social_repo.batch_is_following(db, current_user.id, user_ids)
        return FollowerListResponse(
            items=[
                FollowerListItem(
                    username=u.username,
                    full_name=p.full_name,
                    avatar_color=p.avatar_color,
                    bio=p.bio,
                    is_following=u.id in is_following_set,
                )
                for u, p in pairs
            ],
            total=total,
            skip=skip,
            limit=limit,
        )

    def list_following(
        self,
        db: Session,
        current_user: User,
        username: str,
        skip: int = 0,
        limit: int = 20,
    ) -> FollowerListResponse:
        target = user_repo.get_by_username(db, username)
        if target is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        pairs, total = social_repo.get_following(db, target.id, skip=skip, limit=limit)
        if not pairs:
            return FollowerListResponse(items=[], total=total, skip=skip, limit=limit)

        user_ids = [u.id for u, _ in pairs]
        is_following_set = social_repo.batch_is_following(db, current_user.id, user_ids)
        return FollowerListResponse(
            items=[
                FollowerListItem(
                    username=u.username,
                    full_name=p.full_name,
                    avatar_color=p.avatar_color,
                    bio=p.bio,
                    is_following=u.id in is_following_set,
                )
                for u, p in pairs
            ],
            total=total,
            skip=skip,
            limit=limit,
        )


social_service = SocialService()
