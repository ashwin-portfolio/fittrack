from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def get_by_id(self, db: Session, user_id: uuid.UUID) -> User | None:
        return db.get(User, user_id)

    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.scalar(select(User).where(User.email == email.lower()))

    def get_by_username(self, db: Session, username: str) -> User | None:
        return db.scalar(select(User).where(User.username == username.lower()))

    def create(
        self,
        db: Session,
        *,
        email: str,
        username: str,
        hashed_password: str,
    ) -> User:
        user = User(
            email=email.lower(),
            username=username.lower(),
            hashed_password=hashed_password,
        )
        db.add(user)
        db.flush()  # populate user.id before returning
        return user


user_repo = UserRepository()
