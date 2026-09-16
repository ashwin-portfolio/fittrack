"""
Consecutive-day streak calculation, shared by nutrition and workout streaks.

Lifted out of nutrition_service so both features count the same way — including
the grace rule below, which is easy to get subtly different if reimplemented.
"""
from __future__ import annotations

from datetime import date, timedelta


def compute_streaks(logged_dates: list[date]) -> tuple[int, int]:
    """Return (current_streak, longest_streak) in consecutive days."""
    if not logged_dates:
        return 0, 0

    unique_dates = sorted(set(logged_dates))

    longest = 1
    run = 1
    for i in range(1, len(unique_dates)):
        if (unique_dates[i] - unique_dates[i - 1]).days == 1:
            run += 1
        else:
            run = 1
        longest = max(longest, run)

    date_set = set(unique_dates)
    today = date.today()
    if today in date_set:
        cursor = today
    elif (today - timedelta(days=1)) in date_set:
        # Still "alive" until the day rolls over without today logged.
        cursor = today - timedelta(days=1)
    else:
        return 0, longest

    current = 0
    while cursor in date_set:
        current += 1
        cursor -= timedelta(days=1)
    return current, longest
