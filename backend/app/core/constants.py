from typing import Literal

# ── Domain type aliases ───────────────────────────────────────────────────────
# Use these everywhere (schemas, services, validators) — never bare strings.

GoalType = Literal["weight_loss", "weight_gain", "muscle_gain", "maintenance"]

MealType = Literal["breakfast", "lunch", "dinner", "snack"]

ActivityType = Literal["workout", "meal", "weight"]

Gender = Literal["male", "female", "other", "prefer_not_to_say"]

MuscleGroup = Literal[
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "legs",
    "core",
    "cardio",
    "full_body",
    "other",
]

# ── Allowed values as sets (for runtime membership checks) ────────────────────
GOAL_TYPES: frozenset[str] = frozenset(GoalType.__args__)  # type: ignore[attr-defined]
MEAL_TYPES: frozenset[str] = frozenset(MealType.__args__)  # type: ignore[attr-defined]
ACTIVITY_TYPES: frozenset[str] = frozenset(ActivityType.__args__)  # type: ignore[attr-defined]
GENDERS: frozenset[str] = frozenset(Gender.__args__)  # type: ignore[attr-defined]
MUSCLE_GROUPS: frozenset[str] = frozenset(MuscleGroup.__args__)  # type: ignore[attr-defined]
