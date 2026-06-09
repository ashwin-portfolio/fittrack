from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session, selectinload

from app.models.profile import Profile
from app.models.social import Comment, Follow, Kudos
from app.models.user import User


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

    def get_followers(
        self,
        db: Session,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[tuple[User, Profile]], int]:
        base = (
            select(User, Profile)
            .join(Follow, Follow.follower_id == User.id)
            .join(Profile, Profile.user_id == User.id)
            .where(Follow.following_id == user_id)
        )
        total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
        rows = db.execute(base.order_by(Follow.created_at.desc()).limit(limit).offset(skip)).all()
        return [(r.User, r.Profile) for r in rows], total

    def get_following(
        self,
        db: Session,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[tuple[User, Profile]], int]:
        base = (
            select(User, Profile)
            .join(Follow, Follow.following_id == User.id)
            .join(Profile, Profile.user_id == User.id)
            .where(Follow.follower_id == user_id)
        )
        total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
        rows = db.execute(base.order_by(Follow.created_at.desc()).limit(limit).offset(skip)).all()
        return [(r.User, r.Profile) for r in rows], total


social_repo = SocialRepository()
