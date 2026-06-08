# FitTrack MVP — Entity Relationship Diagram

**Version:** 2.1 (Final — includes exercise library, soft delete, refresh tokens)
**Database:** PostgreSQL
**ORM:** SQLAlchemy 2.0

---

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                               USERS                                   │
│  id (PK, UUID) · email (UQ) · username (UQ) · hashed_password        │
│  is_active · created_at · updated_at                                  │
└──────────┬───────────────────────────────────────────────────────────┘
           │ 1
     ┌─────┼──────────────────────────────────────────────────────┐
     │     │                 │              │            │         │
     │ 1   │ 1               │ *            │ *          │ *       │ *
     ▼     ▼                 ▼              ▼            ▼         ▼
┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐
│PROFILES│ │  GOALS   │ │REFRESH   │ │EXERCISES │ │WORKOUT │ │  NUTRITION   │
│        │ │          │ │TOKENS    │ │(custom)  │ │SESSION │ │  ENTRIES     │
│id      │ │id        │ │          │ │          │ │        │ │              │
│user_id │ │user_id   │ │id        │ │id        │ │id      │ │id            │
│full_   │ │goal_type │ │user_id   │ │name      │ │user_id │ │user_id       │
│  name  │ │target_   │ │token_    │ │muscle_   │ │session │ │entry_date    │
│age     │ │  weight  │ │  hash    │ │  group   │ │  _date │ │meal_type     │
│gender  │ │is_active │ │expires_at│ │is_system │ │name    │ │food_name     │
│height  │ │          │ │revoked_at│ │created_  │ │notes   │ │calories      │
│bio     │ │          │ │          │ │  by_     │ │is_     │ │protein_g     │
│is_     │ │          │ │          │ │  user_id │ │  shared│ │carbs_g       │
│  public│ │          │ │          │ │          │ │deleted │ │fat_g         │
│avatar_ │ │          │ │          │ │          │ │  _at   │ │barcode*      │
│  color │ │          │ │          │ │          │ │        │ │is_shared     │
│onboard │ │          │ │          │ │          │ │        │ │deleted_at    │
└────────┘ └──────────┘ └──────────┘ └────┬─────┘ └───┬────┘ └──────────────┘
                                           │ 1         │ 1
                                           │           ▼
                                           │    ┌──────────────────┐
                                           │    │WORKOUT_EXERCISES │
                                           │    │                  │
                                           └───►│id                │
                                                │session_id (FK)   │
                                                │exercise_id (FK)  │
                                                │order_index       │
                                                └────────┬─────────┘
                                                         │ 1
                                                         ▼
                                                ┌──────────────────┐
                                                │  EXERCISE_SETS   │
                                                │                  │
                                                │id                │
                                                │exercise_id (FK)  │
                                                │set_number        │
                                                │reps              │
                                                │weight_kg         │
                                                └──────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                           WEIGHT_LOGS                                             │
│  id · user_id (FK) · log_date · weight_kg · is_shared · created_at · updated_at  │
│  UNIQUE(user_id, log_date)                                                        │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         ACTIVITY_FEED_ITEMS                                       │
│  id · user_id (FK) · activity_type · is_public · deleted_at · created_at         │
│  workout_session_id (FK, nullable)                                                │
│  nutrition_entry_id (FK, nullable)                                                │
│  weight_log_id      (FK, nullable)                                                │
│  CHECK: exactly one FK column is NOT NULL                                         │
└────────────┬─────────────────────────────────────────────────────────────────────┘
             │ 1
    ┌────────┴──────────┐
    │ *                 │ *
    ▼                   ▼
┌──────────┐     ┌──────────────────────┐
│  KUDOS   │     │       COMMENTS        │
│          │     │                       │
│id        │     │id                     │
│user_id   │     │user_id (FK)           │
│feed_     │     │feed_item_id (FK)      │
│  item_id │     │content                │
│          │     │deleted_at             │
│UNIQUE    │     │                       │
│(user_id, │     │                       │
│feed_item)│     │                       │
└──────────┘     └──────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│                               FOLLOWS                                             │
│  id · follower_id (FK→users) · following_id (FK→users) · created_at              │
│  UNIQUE(follower_id, following_id)                                                │
│  CHECK: follower_id != following_id                                               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Definitions

### `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, default gen_random_uuid() | |
| email | VARCHAR(255) | NOT NULL, UNIQUE | |
| username | VARCHAR(20) | NOT NULL, UNIQUE | alphanumeric + underscore |
| hashed_password | VARCHAR(255) | NOT NULL | bcrypt hash |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### `profiles`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users(id), UNIQUE, NOT NULL | one-to-one |
| full_name | VARCHAR(100) | NOT NULL | |
| age | SMALLINT | NULL | 10–120 check at app layer |
| gender | VARCHAR(20) | NULL | male/female/other/prefer_not_to_say |
| height_cm | FLOAT | NULL | |
| bio | VARCHAR(160) | NULL | |
| is_public | BOOLEAN | NOT NULL, DEFAULT true | |
| avatar_color | VARCHAR(7) | NOT NULL | hex color, deterministic from username |
| onboarding_complete | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### `goals`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users(id), NOT NULL | |
| goal_type | VARCHAR(20) | NOT NULL | weight_loss / weight_gain / muscle_gain / maintenance |
| target_weight_kg | FLOAT | NULL | null when goal = maintenance |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | one active goal per user at a time |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### `refresh_tokens`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users(id), NOT NULL | |
| token_hash | VARCHAR(64) | NOT NULL, UNIQUE | SHA-256 hex of raw token |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| revoked_at | TIMESTAMPTZ | NULL | null = active; set on logout |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### `exercises`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(100) | NOT NULL | |
| muscle_group | VARCHAR(30) | NOT NULL | see enum below |
| is_system | BOOLEAN | NOT NULL, DEFAULT false | true = pre-seeded library |
| created_by_user_id | UUID | FK → users(id) ON DELETE SET NULL, NULL | null for system exercises |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Muscle Group Values:** `chest` · `back` · `shoulders` · `biceps` · `triceps` · `legs` · `core` · `cardio` · `full_body` · `other`

---

### `workout_sessions`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users(id), NOT NULL | |
| session_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | |
| name | VARCHAR(100) | NULL | e.g. "Push Day" |
| notes | TEXT | NULL | |
| is_shared | BOOLEAN | NOT NULL, DEFAULT false | |
| deleted_at | TIMESTAMPTZ | NULL | **soft delete** |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### `workout_exercises`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| session_id | UUID | FK → workout_sessions(id) ON DELETE CASCADE | |
| exercise_id | UUID | FK → exercises(id) ON DELETE RESTRICT | references library |
| order_index | SMALLINT | NOT NULL, DEFAULT 0 | ordering within session |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### `exercise_sets`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| exercise_id | UUID | FK → workout_exercises(id) ON DELETE CASCADE | |
| set_number | SMALLINT | NOT NULL | 1-based |
| reps | SMALLINT | NOT NULL | |
| weight_kg | FLOAT | NOT NULL, DEFAULT 0 | 0 = bodyweight |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### `nutrition_entries`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users(id), NOT NULL | |
| entry_date | DATE | NOT NULL | |
| meal_type | VARCHAR(20) | NOT NULL | breakfast / lunch / dinner / snack |
| food_name | VARCHAR(200) | NOT NULL | |
| calories | FLOAT | NOT NULL | kcal |
| protein_g | FLOAT | NULL | |
| carbs_g | FLOAT | NULL | |
| fat_g | FLOAT | NULL | |
| barcode | VARCHAR(50) | NULL | **reserved for Phase 2** |
| food_db_ref_id | UUID | NULL | **reserved for Phase 2** |
| is_shared | BOOLEAN | NOT NULL, DEFAULT false | |
| deleted_at | TIMESTAMPTZ | NULL | **soft delete** |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### `weight_logs`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users(id), NOT NULL | |
| log_date | DATE | NOT NULL | |
| weight_kg | FLOAT | NOT NULL | |
| is_shared | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| **UNIQUE** | | (user_id, log_date) | one entry per day |

---

### `activity_feed_items`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users(id), NOT NULL | |
| activity_type | VARCHAR(20) | NOT NULL | workout / meal / weight |
| workout_session_id | UUID | FK → workout_sessions(id) ON DELETE CASCADE, NULL | |
| nutrition_entry_id | UUID | FK → nutrition_entries(id) ON DELETE CASCADE, NULL | |
| weight_log_id | UUID | FK → weight_logs(id) ON DELETE CASCADE, NULL | |
| is_public | BOOLEAN | NOT NULL, DEFAULT true | |
| deleted_at | TIMESTAMPTZ | NULL | **soft delete** |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| **CHECK** | | exactly one FK column is NOT NULL | enforced at DB + app layer |

---

### `kudos`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users(id), NOT NULL | who gave kudos |
| feed_item_id | UUID | FK → activity_feed_items(id) ON DELETE CASCADE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| **UNIQUE** | | (user_id, feed_item_id) | one kudos per user per item |

---

### `comments`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users(id), NOT NULL | |
| feed_item_id | UUID | FK → activity_feed_items(id) ON DELETE CASCADE | |
| content | TEXT | NOT NULL | max 500 chars at app layer |
| deleted_at | TIMESTAMPTZ | NULL | **soft delete** |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### `follows`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| follower_id | UUID | FK → users(id), NOT NULL | who follows |
| following_id | UUID | FK → users(id), NOT NULL | who is followed |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| **UNIQUE** | | (follower_id, following_id) | |
| **CHECK** | | follower_id != following_id | cannot follow yourself |

---

## Index Reference

```sql
-- users
CREATE UNIQUE INDEX idx_users_email      ON users(email);
CREATE UNIQUE INDEX idx_users_username   ON users(username);

-- profiles
CREATE UNIQUE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX        idx_profiles_public  ON profiles(is_public);

-- goals
CREATE INDEX idx_goals_user_id     ON goals(user_id);
CREATE INDEX idx_goals_user_active ON goals(user_id, is_active);

-- refresh_tokens
CREATE INDEX        idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE UNIQUE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- exercises
CREATE INDEX idx_exercises_name         ON exercises(name);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_system       ON exercises(is_system);

-- workout_sessions
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, session_date);
CREATE INDEX idx_workout_sessions_shared    ON workout_sessions(is_shared);
CREATE INDEX idx_workout_sessions_deleted   ON workout_sessions(deleted_at);

-- workout_exercises
CREATE INDEX idx_workout_exercises_session ON workout_exercises(session_id, order_index);

-- exercise_sets
CREATE INDEX idx_exercise_sets_exercise ON exercise_sets(exercise_id, set_number);

-- nutrition_entries
CREATE INDEX idx_nutrition_user_date ON nutrition_entries(user_id, entry_date);
CREATE INDEX idx_nutrition_shared    ON nutrition_entries(is_shared);
CREATE INDEX idx_nutrition_deleted   ON nutrition_entries(deleted_at);

-- weight_logs
CREATE UNIQUE INDEX idx_weight_logs_user_date ON weight_logs(user_id, log_date);

-- activity_feed_items
CREATE INDEX idx_feed_public_created ON activity_feed_items(is_public, created_at);
CREATE INDEX idx_feed_user_created   ON activity_feed_items(user_id, created_at);
CREATE INDEX idx_feed_type           ON activity_feed_items(activity_type);
CREATE INDEX idx_feed_deleted        ON activity_feed_items(deleted_at);

-- kudos
CREATE UNIQUE INDEX idx_kudos_user_item ON kudos(user_id, feed_item_id);
CREATE INDEX        idx_kudos_feed_item ON kudos(feed_item_id);

-- comments
CREATE INDEX idx_comments_feed_item ON comments(feed_item_id, created_at);
CREATE INDEX idx_comments_deleted   ON comments(deleted_at);

-- follows
CREATE UNIQUE INDEX idx_follows_pair      ON follows(follower_id, following_id);
CREATE INDEX        idx_follows_follower  ON follows(follower_id);
CREATE INDEX        idx_follows_following ON follows(following_id);
```

---

## Key Relationships

```
users           1 ──── 1   profiles
users           1 ──── *   goals
users           1 ──── *   refresh_tokens
users           1 ──── *   exercises          (custom only)
users           1 ──── *   workout_sessions
workout_sessions 1 ─── *   workout_exercises
exercises        1 ─── *   workout_exercises
workout_exercises 1 ── *   exercise_sets
users           1 ──── *   nutrition_entries
users           1 ──── *   weight_logs
users           1 ──── *   activity_feed_items
activity_feed_items 1 ─ *  kudos
activity_feed_items 1 ─ *  comments
users           * ──── *   users              (via follows — self-referential)
```

---

## Soft Delete Behaviour

| Table | deleted_at | Read Filter | Write on Delete |
|---|---|---|---|
| workout_sessions | ✓ | WHERE deleted_at IS NULL | SET deleted_at = now() |
| nutrition_entries | ✓ | WHERE deleted_at IS NULL | SET deleted_at = now() |
| activity_feed_items | ✓ | WHERE deleted_at IS NULL | SET deleted_at = now() |
| comments | ✓ | WHERE deleted_at IS NULL | SET deleted_at = now() |
| All others | — | No filter needed | Hard delete (N/A) |

> Service layer is responsible for cascading soft deletes: when a workout_session is soft-deleted, the corresponding activity_feed_item is also soft-deleted in the same transaction.

---

## Forward Compatibility

| Future Feature | Schema Impact | Migration Required |
|---|---|---|
| Community Groups | Add `communities`, `community_members`, `community_posts` tables | New tables only |
| Barcode scanning | `barcode` + `food_db_ref_id` already present in `nutrition_entries` | None |
| Exercise video/instructions | Add `description`, `video_url` columns to `exercises` | Column additions |
| Notifications | Add `notifications` table referencing users + polymorphic entity | New table only |
| Profile photos | Add `avatar_url` column to `profiles` | Single column addition |
| Challenges | Add `challenges`, `challenge_participants` tables | New tables only |
| Multi-unit support | All weight stored as kg; add `unit_preference` to `profiles` | Single column addition |
| Refresh token rotation | Already implemented via `revoked_at` column | None |
| Exercise soft delete | Add `deleted_at` to `exercises` | Single column addition |
