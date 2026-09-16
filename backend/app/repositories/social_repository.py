from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import NamedTuple

from sqlalchemy import func, select, tuple_
from sqlalchemy.orm import Session, selectinload

from app.models.profile import Profile
from app.models.social import Comment, Follow, Kudos
from app.models.user import User


class FollowListRow(NamedTuple):
    """A follow-list entry plus the sort key needed to build the next cursor."""

    user: User
    profile: Profile
    follow_created_at: datetime
    follow_id: uuid.UUID


class SocialRepository:
    # ── Kudos ─────────────────────────────────────────────────────────────────

    def get_kudos(
        self, db: Session, user_id: uuid.UUID, feed_item_id: uuid.UUID
    ) -> Kudos | None:
        return db.scalar(
            select(Kudos).where(
                Kudos.user_id == user_id,
                Kudos.feed_item_id == feed_item_id,
            )
        )

    def add_kudos(
        self, db: Session, user_id: uuid.UUID, feed_item_id: uuid.UUID
    ) -> Kudos:
        k = Kudos(user_id=user_id, feed_item_id=feed_item_id)
        db.add(k)
        db.flush()
        return k

    def remove_kudos(self, db: Session, kudos: Kudos) -> None:
        db.delete(kudos)
        db.flush()

    def kudos_count(self, db: Session, feed_item_id: uuid.UUID) -> int:
        return db.scalar(
            select(func.count(Kudos.id)).where(Kudos.feed_item_id == feed_item_id)
        ) or 0

    def batch_kudos_counts(
        self, db: Session, feed_item_ids: list[uuid.UUID]
    ) -> dict[uuid.UUID, int]:
        rows = db.execute(
            select(Kudos.feed_item_id, func.count(Kudos.id).label("cnt"))
            .where(Kudos.feed_item_id.in_(feed_item_ids))
            .group_by(Kudos.feed_item_id)
        ).all()
        return {r.feed_item_id: r.cnt for r in rows}

    def batch_has_kudos(
        self, db: Session, user_id: uuid.UUID, feed_item_ids: list[uuid.UUID]
    ) -> set[uuid.UUID]:
        rows = db.execute(
            select(Kudos.feed_item_id).where(
                Kudos.user_id == user_id,
                Kudos.feed_item_id.in_(feed_item_ids),
            )
        ).all()
        return {r.feed_item_id for r in rows}

    # ── Comments ──────────────────────────────────────────────────────────────

    def list_comments(
        self, db: Session, feed_item_id: uuid.UUID
    ) -> list[Comment]:
        return list(
            db.scalars(
                select(Comment)
                .options(selectinload(Comment.user).selectinload(User.profile))
                .where(
                    Comment.feed_item_id == feed_item_id,
                    Comment.deleted_at.is_(None),
                )
                .order_by(Comment.created_at.asc())
            ).all()
        )

    def add_comment(
        self, db: Session, *, user_id: uuid.UUID, feed_item_id: uuid.UUID, content: str
    ) -> Comment:
        c = Comment(user_id=user_id, feed_item_id=feed_item_id, content=content)
        db.add(c)
        db.flush()
        db.refresh(c, ["user"])
        db.refresh(c.user, ["profile"])
        return c

    def get_comment_by_id(self, db: Session, comment_id: uuid.UUID) -> Comment | None:
        return db.scalar(
            select(Comment).where(
                Comment.id == comment_id,
                Comment.deleted_at.is_(None),
            )
        )

    def soft_delete_comment(self, db: Session, comment: Comment) -> None:
        comment.deleted_at = datetime.now(timezone.utc)
        db.flush()

    def comment_count(self, db: Session, feed_item_id: uuid.UUID) -> int:
        return db.scalar(
            select(func.count(Comment.id)).where(
                Comment.feed_item_id == feed_item_id,
                Comment.deleted_at.is_(None),
            )
        ) or 0

    def batch_comment_counts(
        self, db: Session, feed_item_ids: list[uuid.UUID]
    ) -> dict[uuid.UUID, int]:
        rows = db.execute(
            select(Comment.feed_item_id, func.count(Comment.id).label("cnt"))
            .where(
                Comment.feed_item_id.in_(feed_item_ids),
                Comment.deleted_at.is_(None),
            )
            .group_by(Comment.feed_item_id)
        ).all()
        return {r.feed_item_id: r.cnt for r in rows}

    # ── Follows ───────────────────────────────────────────────────────────────

    def get_follow(
        self, db: Session, follower_id: uuid.UUID, following_id: uuid.UUID
    ) -> Follow | None:
        return db.scalar(
            select(Follow).where(
                Follow.follower_id == follower_id,
                Follow.following_id == following_id,
            )
        )

    def add_follow(
        self, db: Session, follower_id: uuid.UUID, following_id: uuid.UUID
    ) -> Follow:
        f = Follow(follower_id=follower_id, following_id=following_id)
        db.add(f)
        db.flush()
        return f

    def remove_follow(self, db: Session, follow: Follow) -> None:
        db.delete(follow)
        db.flush()

    def follower_count(self, db: Session, user_id: uuid.UUID) -> int:
        return db.scalar(
            select(func.count(Follow.id)).where(Follow.following_id == user_id)
        ) or 0

    def following_count(self, db: Session, user_id: uuid.UUID) -> int:
        return db.scalar(
            select(func.count(Follow.id)).where(Follow.follower_id == user_id)
        ) or 0

    # ── User listing ──────────────────────────────────────────────────────────

    def search_public_users(
        self,
        db: Session,
        *,
        exclude_user_id: uuid.UUID,
        q: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[tuple[User, Profile]], int]:
        base = (
            select(User, Profile)
            .join(Profile, Profile.user_id == User.id)
            .where(
                Profile.is_public.is_(True),
                User.id != exclude_user_id,
                User.is_active.is_(True),
            )
        )
        if q:
            pattern = f"%{q}%"
            from sqlalchemy import or_
            base = base.where(
                or_(User.username.ilike(pattern), Profile.full_name.ilike(pattern))
            )

        total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
        rows = db.execute(
            base.order_by(User.username.asc()).limit(limit).offset(skip)
        ).all()
        return [(r.User, r.Profile) for r in rows], total

    def batch_follower_counts(
        self, db: Session, user_ids: list[uuid.UUID]
    ) -> dict[uuid.UUID, int]:
        rows = db.execute(
            select(Follow.following_id, func.count(Follow.id).label("cnt"))
            .where(Follow.following_id.in_(user_ids))
            .group_by(Follow.following_id)
        ).all()
        return {r.following_id: r.cnt for r in rows}

    def batch_is_following(
        self, db: Session, follower_id: uuid.UUID, following_ids: list[uuid.UUID]
    ) -> set[uuid.UUID]:
        rows = db.execute(
            select(Follow.following_id).where(
                Follow.follower_id == follower_id,
                Follow.following_id.in_(following_ids),
            )
        ).all()
        return {r.following_id for r in rows}

    def _follow_list(
        self,
        db: Session,
        *,
        listed_side,        # Follow column holding the user being listed
        owner_side,         # Follow column holding whose list this is
        user_id: uuid.UUID,
        cursor: tuple[datetime, uuid.UUID] | None,
        limit: int,
    ) -> tuple[list[FollowListRow], bool]:
        """
        One page of a follow list, newest first, keyset-paginated.

        Ordered by (created_at, id) descending. The id breaks ties because
        follows created in one transaction share a created_at to the
        microsecond — ordering on the timestamp alone would let rows shift
        between pages.
        """
        stmt = (
            select(
                User,
                Profile,
                Follow.created_at.label("follow_created_at"),
                Follow.id.label("follow_id"),
            )
            .join(Follow, listed_side == User.id)
            .join(Profile, Profile.user_id == User.id)
            .where(owner_side == user_id)
        )

        if cursor is not None:
            # Row-value comparison: strictly past the last row of the previous
            # page. Unlike OFFSET, this does not shift when rows are added or
            # removed while the reader is paging.
            stmt = stmt.where(tuple_(Follow.created_at, Follow.id) < cursor)

        # Fetch one extra to learn whether a further page exists, which avoids
        # a COUNT on every page.
        rows = db.execute(
            stmt.order_by(Follow.created_at.desc(), Follow.id.desc()).limit(limit + 1)
        ).all()

        has_more = len(rows) > limit
        return (
            [
                FollowListRow(r.User, r.Profile, r.follow_created_at, r.follow_id)
                for r in rows[:limit]
            ],
            has_more,
        )

    def get_followers(
        self,
        db: Session,
        user_id: uuid.UUID,
        *,
        cursor: tuple[datetime, uuid.UUID] | None = None,
        limit: int = 20,
    ) -> tuple[list[FollowListRow], bool]:
        return self._follow_list(
            db,
            listed_side=Follow.follower_id,
            owner_side=Follow.following_id,
            user_id=user_id,
            cursor=cursor,
            limit=limit,
        )

    def get_following(
        self,
        db: Session,
        user_id: uuid.UUID,
        *,
        cursor: tuple[datetime, uuid.UUID] | None = None,
        limit: int = 20,
    ) -> tuple[list[FollowListRow], bool]:
        return self._follow_list(
            db,
            listed_side=Follow.following_id,
            owner_side=Follow.follower_id,
            user_id=user_id,
            cursor=cursor,
            limit=limit,
        )


social_repo = SocialRepository()
