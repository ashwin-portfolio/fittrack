from __future__ import annotations

import uuid
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.feed_repository import feed_repo
from app.repositories.weight_repository import weight_repo
from app.schemas.weight import WeightHistoryResponse, WeightLogRequest, WeightLogResponse


class WeightService:
    def upsert(
        self, db: Session, current_user: User, body: WeightLogRequest
    ) -> tuple[WeightLogResponse, bool]:
        entry, is_new = weight_repo.upsert(
            db,
            user_id=current_user.id,
            log_date=body.log_date,
            weight_kg=body.weight_kg,
            is_shared=body.is_shared,
        )
        if is_new and body.is_shared:
            feed_repo.create_feed_item(
                db, user_id=current_user.id, activity_type="weight",
                weight_log_id=entry.id,
            )
        prev = weight_repo.get_previous(db, current_user.id, body.log_date)
        delta_kg = round(body.weight_kg - prev.weight_kg, 2) if prev else None
        return (
            WeightLogResponse(
                id=entry.id,
                log_date=entry.log_date,
                weight_kg=entry.weight_kg,
                delta_kg=delta_kg,
                is_shared=entry.is_shared,
                created_at=entry.created_at,
            ),
            is_new,
        )

    def history(
        self, db: Session, current_user: User, days: int = 30
    ) -> WeightHistoryResponse:
        since = date.today() - timedelta(days=days)
        entries = weight_repo.list_for_user(db, current_user.id, since_date=since)

        if not entries:
            return WeightHistoryResponse(
                items=[],
                first_weight_kg=None,
                latest_weight_kg=None,
                total_change_kg=None,
            )

        # Look up the entry just before the window so the first item gets a delta
        pre_window = weight_repo.get_previous(db, current_user.id, entries[0].log_date)
        prev_weight = pre_window.weight_kg if pre_window else None

        items: list[WeightLogResponse] = []
        for entry in entries:
            delta_kg = (
                round(entry.weight_kg - prev_weight, 2)
                if prev_weight is not None
                else None
            )
            items.append(
                WeightLogResponse(
                    id=entry.id,
                    log_date=entry.log_date,
                    weight_kg=entry.weight_kg,
                    delta_kg=delta_kg,
                    is_shared=entry.is_shared,
                    created_at=entry.created_at,
                )
            )
            prev_weight = entry.weight_kg

        first_kg = entries[0].weight_kg
        latest_kg = entries[-1].weight_kg
        return WeightHistoryResponse(
            items=items,
            first_weight_kg=first_kg,
            latest_weight_kg=latest_kg,
            total_change_kg=round(latest_kg - first_kg, 2),
        )

    def delete(
        self, db: Session, current_user: User, entry_id: uuid.UUID
    ) -> None:
        entry = weight_repo.get_by_id(db, entry_id)
        if entry is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Weight log not found."
            )
        if entry.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied."
            )
        feed_repo.soft_delete_by_weight(db, entry.id)
        weight_repo.soft_delete(db, entry)


weight_service = WeightService()
