from __future__ import annotations

import hashlib
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile import Profile


def _avatar_color(username: str) -> str:
    """Deterministic hex color from username (e.g. '#4A90D9')."""
    digest = hashlib.md5(username.lower().encode()).hexdigest()
    r = int(digest[0:2], 16) & 0xBF | 0x40  # keep in 64–255 range (readable)
    g = int(digest[2:4], 16) & 0xBF | 0x40
    b = int(digest[4:6], 16) & 0xBF | 0x40
    return f"#{r:02X}{g:02X}{b:02X}"


class ProfileRepository:
    def create(
        self,
        db: Session,
        *,
        user_id: uuid.UUID,
        full_name: str,
        username: str,
    ) -> Profile:
        profile = Profile(
            user_id=user_id,
            full_name=full_name,
            avatar_color=_avatar_color(username),
        )
        db.add(profile)
        db.flush()
        return profile

    def get_by_user_id(self, db: Session, user_id: uuid.UUID) -> Profile | None:
        return db.scalar(select(Profile).where(Profile.user_id == user_id))

    def update(self, db: Session, profile: Profile, fields: dict) -> Profile:
        for key, value in fields.items():
            setattr(profile, key, value)
        db.flush()
        return profile


profile_repo = ProfileRepository()
