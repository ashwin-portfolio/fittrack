"""
Opaque keyset-pagination cursors.

A cursor encodes the sort key of the last row on a page: a timestamp plus a
UUID tiebreaker. The timestamp alone is not enough — rows inserted in the same
transaction share one to the microsecond, so a cursor built from it would skip
or repeat rows at the page boundary. The (created_at, id) pair is unique and
totally ordered, so the next page resumes exactly after the last row even if
rows are inserted or deleted in between (which OFFSET cannot promise).

The encoding is base64 only so callers treat it as opaque and do not build
their own — it is not a security boundary, and decoded values are still used
purely as a sort-key comparison, never as a filter on ownership.
"""
from __future__ import annotations

import base64
import binascii
import uuid
from datetime import datetime


def encode_cursor(created_at: datetime, row_id: uuid.UUID) -> str:
    raw = f"{created_at.isoformat()}|{row_id}"
    # Strip '=' padding for a URL-friendly value; decode_cursor restores it.
    return base64.urlsafe_b64encode(raw.encode()).decode().rstrip("=")


def decode_cursor(cursor: str) -> tuple[datetime, uuid.UUID]:
    """Raises ValueError on anything malformed — callers map it to a 400."""
    try:
        padded = cursor + "=" * (-len(cursor) % 4)
        raw = base64.urlsafe_b64decode(padded.encode()).decode()
    except (binascii.Error, UnicodeDecodeError) as exc:
        raise ValueError("Cursor is not valid base64.") from exc

    timestamp, separator, row_id = raw.partition("|")
    if not separator:
        raise ValueError("Cursor is missing its id component.")

    return datetime.fromisoformat(timestamp), uuid.UUID(row_id)
