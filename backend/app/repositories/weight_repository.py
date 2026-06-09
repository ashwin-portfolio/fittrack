from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.weight import WeightLog


class WeightRepository:
    def get_by_date(
        self, db: Session, user_id: uuid.UUID, log_date: date
    ) -> WeightLog | None:
        return db.scalar(
            select(WeightLog).where(
                WeightLog.user_id == user_id,
                WeightLog.log_date == log_date,
                WeightLog.deleted_at.is_(None),
            )
        )

    def get_previous(
        self, db: Session, user_id: uuid.UUID, before_date: date
    ) -> WeightLog | None:
        """Most recent active entry strictly before the given date."""
        return db.scalar(
            select(WeightLog)
            .where(
                WeightLog.user_id == user_id,
                WeightLog.log_date < before_date,
                WeightLog.deleted_at.is_(None),
            )
            .order_by(WeightLog.log_date.desc())
            .limit(1)
        )

    def upsert(
        self,
        db: Session,
        *,
        user_id: uuid.UUID,
        log_date: date,
        weight_kg: float,
        is_shared: bool,
    ) -> tuple[WeightLog, bool]:
        """Return (entry, is_new). Updates in-place if a log for that date exists."""
        existing = self.get_by_date(db, user_id, log_date)
        if existing:
            existing.weight_kg = weight_kg
            existing.is_shared = is_shared
            db.flush()
            return existing, False

        entry = WeightLog(
            user_id=user_id,
            log_date=log_date,
            weight_kg=weight_kg,
            is_shared=is_shared,
        )
        db.add(entry)
        db.flush()
        return entry, True

    def list_for_user(
        self, db: Session, user_id: uuid.UUID, *, since_date: date
    ) -> list[WeightLog]:
        """Active entries on or after since_date, ordered date ASC."""
        return list(
            db.scalars(
                select(WeightLog)
                .where(
                    WeightLog.user_id == user_id,
                    WeightLog.log_date >= since_date,
                    WeightLog.deleted_at.is_(None),
                )
                .order_by(WeightLog.log_date.asc())
            ).all()
        )

    def get_by_id(self, db: Session, entry_id: uuid.UUID) -> WeightLog | None:
        return db.scalar(
            select(WeightLog).where(
                WeightLog.id == entry_id,
                WeightLog.deleted_at.is_(None),
            )
        )

    def soft_delete(self, db: Session, entry: WeightLog) -> None:
        entry.deleted_at = datetime.now(timezone.utc)
        db.flush()


weight_repo = WeightRepository()
