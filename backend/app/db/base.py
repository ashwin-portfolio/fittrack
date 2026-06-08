# Import Base and every model here so Alembic autogenerate sees all metadata.
# Add each new model import as it is created.
from app.models.base import Base  # noqa: F401
from app.models.exercise import Exercise  # noqa: F401
from app.models.feed import ActivityFeedItem  # noqa: F401
from app.models.goal import Goal  # noqa: F401
from app.models.nutrition import NutritionEntry  # noqa: F401
from app.models.profile import Profile  # noqa: F401
from app.models.refresh_token import RefreshToken  # noqa: F401
from app.models.social import Comment, Follow, Kudos  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.weight import WeightLog  # noqa: F401
from app.models.workout import ExerciseSet, WorkoutExercise, WorkoutSession  # noqa: F401
