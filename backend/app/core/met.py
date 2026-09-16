"""
Calories-burned estimation from MET (Metabolic Equivalent of Task) values.

    kcal = MET x body_weight_kg x duration_hours

MET values are approximations drawn from the Compendium of Physical Activities
bands for resistance training (~3.5 light, ~5.0 general, ~6.0 vigorous) and
general cardio (~8.0). They are estimates, not measurements — two people doing
the same logged workout genuinely burn different amounts, and nothing here
accounts for intensity or rest.

Note the formula takes body weight only. Height is a BMR input and plays no
part in a MET calculation.
"""
from __future__ import annotations

# Exercise category -> MET. The `muscle_group` field already carries the
# category (it includes `cardio` and `full_body`), so no extra column is needed.
MET_BY_MUSCLE_GROUP: dict[str, float] = {
    "chest": 5.0,
    "back": 5.0,
    "shoulders": 5.0,
    "biceps": 3.5,
    "triceps": 3.5,
    "legs": 6.0,
    "core": 4.0,
    "cardio": 8.0,
    "full_body": 6.0,
    "other": 4.0,
}

# Used when a workout has no exercises, or only ones with unknown groups.
DEFAULT_MET = 5.0


def session_met(set_counts_by_group: dict[str, int]) -> float:
    """
    A single MET for a whole session, weighted by sets per muscle group.

    Duration is recorded once for the session, so a session spanning several
    categories needs one blended value. Set count is the best proxy available
    for how the time was divided — a 12-set leg session with 2 sets of curls
    should land near the legs MET, not halfway between the two.
    """
    total_sets = sum(set_counts_by_group.values())
    if total_sets <= 0:
        return DEFAULT_MET

    weighted = sum(
        MET_BY_MUSCLE_GROUP.get(group, DEFAULT_MET) * sets
        for group, sets in set_counts_by_group.items()
    )
    return weighted / total_sets


def calories_burned(
    met: float, weight_kg: float | None, duration_minutes: int | None
) -> float | None:
    """None when either input is missing — an estimate needs both."""
    if not weight_kg or not duration_minutes or duration_minutes <= 0:
        return None
    return round(met * weight_kg * (duration_minutes / 60.0), 1)
