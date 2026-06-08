# FitTrack MVP — API Specification

**Version:** 1.1 (includes exercise library, soft delete, refresh token endpoints)
**Base URL:** `/api/v1`
**Authentication:** `Authorization: Bearer <access_token>`
**Content-Type:** `application/json`
**Timestamps:** ISO 8601 UTC (`2025-01-15T09:30:00Z`)
**IDs:** UUID v4

---

## Response Envelopes

### Single Resource
```json
{ ...resource fields }
```

### Paginated List
```json
{
  "items": [...],
  "total": 142,
  "skip": 0,
  "limit": 20
}
```

### Error
```json
{ "detail": "Human readable error message" }
```

### Validation Error (422)
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## HTTP Status Codes

| Code | Meaning | Used For |
|---|---|---|
| 200 | OK | Successful GET, PUT, DELETE with body |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE with no body |
| 400 | Bad Request | Business rule violation |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but wrong resource owner |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate unique resource |
| 422 | Unprocessable Entity | Pydantic validation failure |
| 500 | Internal Server Error | Unexpected backend failure |

---

## Complete Endpoint Reference

```
Auth
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/refresh
  POST   /api/v1/auth/logout

Profile
  GET    /api/v1/profile/me
  PUT    /api/v1/profile/me
  PUT    /api/v1/profile/onboarding
  GET    /api/v1/users
  GET    /api/v1/users/{username}
  GET    /api/v1/users/{username}/followers
  GET    /api/v1/users/{username}/following

Goals
  GET    /api/v1/goals/active
  POST   /api/v1/goals

Exercises
  GET    /api/v1/exercises
  POST   /api/v1/exercises

Workouts
  GET    /api/v1/workouts
  POST   /api/v1/workouts
  GET    /api/v1/workouts/{id}
  DELETE /api/v1/workouts/{id}

Nutrition
  GET    /api/v1/nutrition
  POST   /api/v1/nutrition
  DELETE /api/v1/nutrition/{id}
  GET    /api/v1/nutrition/daily-summary

Weight
  POST   /api/v1/weight
  GET    /api/v1/weight/history
  DELETE /api/v1/weight/{id}

Dashboard
  GET    /api/v1/dashboard/summary
  GET    /api/v1/dashboard/charts/weight
  GET    /api/v1/dashboard/charts/workouts
  GET    /api/v1/dashboard/charts/calories

Feed
  GET    /api/v1/feed/global
  GET    /api/v1/feed/following

Kudos
  POST   /api/v1/kudos/{feed_item_id}
  DELETE /api/v1/kudos/{feed_item_id}

Comments
  GET    /api/v1/comments/{feed_item_id}
  POST   /api/v1/comments/{feed_item_id}
  DELETE /api/v1/comments/{comment_id}

Follows
  POST   /api/v1/follows/{username}
  DELETE /api/v1/follows/{username}
```

**Total: 34 endpoints**

---

## Module 1 — Authentication

---

### `POST /auth/register`

**Auth required:** No

**Request**
```json
{
  "full_name": "Alex Johnson",
  "email": "alex@example.com",
  "username": "alexj",
  "password": "SecurePass123"
}
```

**Validation**
| Field | Rules |
|---|---|
| full_name | Required, 2–100 chars |
| email | Required, valid email, unique |
| username | Required, 3–20 chars, alphanumeric + underscore, unique |
| password | Required, min 8 chars |

**Response `201`**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alex@example.com",
  "username": "alexj",
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

**Errors:** `400` email/username taken · `422` validation

---

### `POST /auth/login`

**Auth required:** No

**Request**
```json
{
  "email": "alex@example.com",
  "password": "SecurePass123"
}
```

**Response `200`**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

**Errors:** `401` invalid credentials · `403` account deactivated

---

### `POST /auth/refresh`

**Auth required:** No

**Request**
```json
{ "refresh_token": "eyJhbGci..." }
```

**Response `200`**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

**Errors:** `401` refresh token invalid, expired, or revoked

---

### `POST /auth/logout`

**Auth required:** Yes

**Request**
```json
{ "refresh_token": "eyJhbGci..." }
```

**Response `200`**
```json
{ "message": "Logged out successfully" }
```

> Revokes the refresh token server-side. Client must also clear local token storage.

---

## Module 2 — Profile

---

### `GET /profile/me`

**Auth required:** Yes

**Response `200`**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alex@example.com",
  "username": "alexj",
  "full_name": "Alex Johnson",
  "age": 28,
  "gender": "male",
  "height_cm": 178.0,
  "bio": "Gym rat. Bench press enthusiast.",
  "is_public": true,
  "avatar_color": "#4F46E5",
  "onboarding_complete": true,
  "follower_count": 24,
  "following_count": 18,
  "created_at": "2025-01-10T08:00:00Z"
}
```

---

### `PUT /profile/me`

**Auth required:** Yes

**Request**
```json
{
  "full_name": "Alex Johnson",
  "username": "alexj_fit",
  "bio": "Getting stronger every day.",
  "age": 28,
  "gender": "male",
  "height_cm": 178.0,
  "is_public": true
}
```

**Validation**
| Field | Rules |
|---|---|
| full_name | Optional, 2–100 chars |
| username | Optional, 3–20 chars, unique |
| bio | Optional, max 160 chars |
| age | Optional, 10–120 |
| gender | Optional, male / female / other / prefer_not_to_say |
| height_cm | Optional, 50–300 |
| is_public | Optional, boolean |

**Response `200`** — Updated profile (same shape as GET)

**Errors:** `400` username taken · `422` validation

---

### `PUT /profile/onboarding`

**Auth required:** Yes

**Request**
```json
{
  "age": 28,
  "gender": "male",
  "height_cm": 178.0,
  "current_weight_kg": 82.5,
  "goal_type": "muscle_gain",
  "target_weight_kg": 88.0
}
```

**Validation**
| Field | Rules |
|---|---|
| age | Required, 10–120 |
| gender | Required |
| height_cm | Required, 50–300 |
| current_weight_kg | Required, 20–500 |
| goal_type | Required, weight_loss / weight_gain / muscle_gain / maintenance |
| target_weight_kg | Required unless goal_type = maintenance |

**Response `200`**
```json
{ "message": "Onboarding complete", "onboarding_complete": true }
```

---

### `GET /users`

Discover and search users. Powers the `/community/discover` page (US-036).

**Auth required:** Yes

**Query Params**
| Param | Type | Default | Description |
|---|---|---|---|
| q | string | null | Partial match on username or full_name (case-insensitive) |
| skip | int | 0 | |
| limit | int | 20 | Max 50 |

**Response `200`**
```json
{
  "items": [
    {
      "username": "marcus_lifts",
      "full_name": "Marcus Lee",
      "avatar_color": "#10B981",
      "bio": "Powerlifter.",
      "follower_count": 47,
      "is_following": false
    }
  ],
  "total": 12,
  "skip": 0,
  "limit": 20
}
```

> Results exclude the requesting user. Only public profiles are returned.
> `is_following` reflects the requesting user's current follow state.

---

### `GET /users/{username}`

**Auth required:** No

**Response `200`**
```json
{
  "username": "alexj",
  "full_name": "Alex Johnson",
  "bio": "Gym rat.",
  "avatar_color": "#4F46E5",
  "is_public": true,
  "follower_count": 24,
  "following_count": 18,
  "is_following": false,
  "recent_activities": [
    {
      "id": "feed-item-uuid",
      "activity_type": "workout",
      "summary": "Push Day — 4 exercises, 16 sets",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

> `is_following` is `null` when unauthenticated. `recent_activities` is `[]` for private profiles.

**Errors:** `404` username not found

---

### `GET /users/{username}/followers`

**Auth required:** Yes · **Query:** `skip`, `limit` (default 20)

**Response `200`**
```json
{
  "items": [
    {
      "username": "priya_fit",
      "full_name": "Priya Sharma",
      "avatar_color": "#EC4899",
      "bio": "Weight loss journey.",
      "is_following": true
    }
  ],
  "total": 24,
  "skip": 0,
  "limit": 20
}
```

---

### `GET /users/{username}/following`

**Auth required:** Yes

**Response `200`** — Same shape as `/followers`

---

## Module 3 — Goals

---

### `GET /goals/active`

**Auth required:** Yes

**Response `200`**
```json
{
  "id": "goal-uuid",
  "goal_type": "muscle_gain",
  "target_weight_kg": 88.0,
  "is_active": true,
  "created_at": "2025-01-10T08:00:00Z"
}
```

---

### `POST /goals`

Creates a new goal and deactivates the current active goal.

**Auth required:** Yes

**Request**
```json
{
  "goal_type": "weight_loss",
  "target_weight_kg": 75.0
}
```

**Response `201`**
```json
{
  "id": "new-goal-uuid",
  "goal_type": "weight_loss",
  "target_weight_kg": 75.0,
  "is_active": true,
  "created_at": "2025-01-20T09:00:00Z"
}
```

---

## Module 4 — Exercises

---

### `GET /exercises`

**Auth required:** Yes

**Query Params**
| Param | Type | Default | Description |
|---|---|---|---|
| q | string | null | Partial name search (case-insensitive) |
| muscle_group | string | null | Filter by muscle group |
| include_custom | bool | true | Include user's custom exercises |

**Response `200`**
```json
{
  "items": [
    {
      "id": "exercise-uuid",
      "name": "Bench Press",
      "muscle_group": "chest",
      "is_system": true,
      "created_by_user_id": null
    },
    {
      "id": "custom-uuid",
      "name": "Cable Fly Variation",
      "muscle_group": "chest",
      "is_system": false,
      "created_by_user_id": "user-uuid"
    }
  ]
}
```

---

### `POST /exercises`

Create a custom exercise.

**Auth required:** Yes

**Request**
```json
{
  "name": "Cable Fly Variation",
  "muscle_group": "chest"
}
```

**Validation**
| Field | Rules |
|---|---|
| name | Required, 1–100 chars |
| muscle_group | Required, one of: chest / back / shoulders / biceps / triceps / legs / core / cardio / full_body / other |

**Response `201`**
```json
{
  "id": "new-exercise-uuid",
  "name": "Cable Fly Variation",
  "muscle_group": "chest",
  "is_system": false,
  "created_by_user_id": "user-uuid"
}
```

---

## Module 5 — Workouts

---

### `GET /workouts`

**Auth required:** Yes · **Query:** `skip` (0), `limit` (20, max 50)

**Response `200`**
```json
{
  "items": [
    {
      "id": "session-uuid",
      "session_date": "2025-01-15",
      "name": "Push Day",
      "notes": "Felt strong today.",
      "is_shared": true,
      "exercise_count": 4,
      "total_sets": 16,
      "total_volume_kg": 3240.0,
      "exercises": [
        {
          "id": "workout-exercise-uuid",
          "exercise": {
            "id": "exercise-uuid",
            "name": "Bench Press",
            "muscle_group": "chest"
          },
          "order_index": 0,
          "sets": [
            { "set_number": 1, "reps": 10, "weight_kg": 60.0 },
            { "set_number": 2, "reps": 8,  "weight_kg": 65.0 },
            { "set_number": 3, "reps": 6,  "weight_kg": 70.0 }
          ]
        }
      ],
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "skip": 0,
  "limit": 20
}
```

---

### `POST /workouts`

**Auth required:** Yes

**Request**
```json
{
  "session_date": "2025-01-15",
  "name": "Push Day",
  "notes": "Felt strong today.",
  "is_shared": true,
  "exercises": [
    {
      "exercise_id": "exercise-uuid-bench-press",
      "order_index": 0,
      "sets": [
        { "set_number": 1, "reps": 10, "weight_kg": 60.0 },
        { "set_number": 2, "reps": 8,  "weight_kg": 65.0 },
        { "set_number": 3, "reps": 6,  "weight_kg": 70.0 }
      ]
    },
    {
      "exercise_id": "exercise-uuid-overhead-press",
      "order_index": 1,
      "sets": [
        { "set_number": 1, "reps": 10, "weight_kg": 40.0 },
        { "set_number": 2, "reps": 8,  "weight_kg": 42.5 }
      ]
    }
  ]
}
```

**Validation**
| Field | Rules |
|---|---|
| session_date | Required, valid date |
| name | Optional, max 100 chars |
| notes | Optional, max 1000 chars |
| is_shared | Optional, boolean, default false |
| exercises | Required, min 1 item |
| exercises[].exercise_id | Required, must exist in library |
| exercises[].sets | Required, min 1 item |
| sets[].reps | Required, 1–999 |
| sets[].weight_kg | Required, 0–1000 (0 = bodyweight) |

**Response `201`** — Full workout object (same as GET item)

---

### `GET /workouts/{id}`

**Auth required:** Yes

**Response `200`** — Full workout object

**Errors:** `403` not owner · `404` not found

---

### `DELETE /workouts/{id}`

Soft delete — sets `deleted_at`, does not remove from database.

**Auth required:** Yes

**Response `204`** — No content

**Errors:** `403` not owner · `404` not found

---

## Module 6 — Nutrition

---

### `GET /nutrition`

**Auth required:** Yes · **Query:** `date` (YYYY-MM-DD), `skip` (0), `limit` (20)

**Response `200`**
```json
{
  "items": [
    {
      "id": "nutrition-uuid",
      "entry_date": "2025-01-15",
      "meal_type": "breakfast",
      "food_name": "Oats with banana",
      "calories": 420.0,
      "protein_g": 14.0,
      "carbs_g": 72.0,
      "fat_g": 8.0,
      "is_shared": false,
      "created_at": "2025-01-15T07:30:00Z"
    }
  ],
  "total": 8,
  "skip": 0,
  "limit": 20
}
```

---

### `GET /nutrition/daily-summary`

**Auth required:** Yes · **Query:** `date` (YYYY-MM-DD, default today)

**Response `200`**
```json
{
  "date": "2025-01-15",
  "total_calories": 1840.0,
  "total_protein_g": 142.0,
  "total_carbs_g": 210.0,
  "total_fat_g": 52.0,
  "entry_count": 4
}
```

---

### `POST /nutrition`

**Auth required:** Yes

**Request**
```json
{
  "entry_date": "2025-01-15",
  "meal_type": "lunch",
  "food_name": "Grilled chicken with rice",
  "calories": 620.0,
  "protein_g": 48.0,
  "carbs_g": 65.0,
  "fat_g": 12.0,
  "is_shared": false
}
```

**Validation**
| Field | Rules |
|---|---|
| entry_date | Required, valid date |
| meal_type | Required, breakfast / lunch / dinner / snack |
| food_name | Required, 1–200 chars |
| calories | Required, 0–10000 |
| protein_g | Optional, 0–1000 |
| carbs_g | Optional, 0–1000 |
| fat_g | Optional, 0–1000 |
| is_shared | Optional, boolean, default false |

**Response `201`** — Full nutrition entry object

---

### `DELETE /nutrition/{id}`

Soft delete.

**Auth required:** Yes

**Response `204`** — No content

**Errors:** `403` not owner · `404` not found

---

## Module 7 — Weight

---

### `POST /weight`

Log or update today's weight (upsert by date).

**Auth required:** Yes

**Request**
```json
{
  "log_date": "2025-01-15",
  "weight_kg": 81.8,
  "is_shared": false
}
```

**Validation**
| Field | Rules |
|---|---|
| log_date | Required, valid date |
| weight_kg | Required, 20.0–500.0 |
| is_shared | Optional, boolean, default false |

**Response `200` or `201`**
```json
{
  "id": "weight-uuid",
  "log_date": "2025-01-15",
  "weight_kg": 81.8,
  "delta_kg": -0.4,
  "is_shared": false,
  "created_at": "2025-01-15T08:00:00Z"
}
```

> `delta_kg` is the difference from the previous log entry. `null` on first entry.

---

### `GET /weight/history`

**Auth required:** Yes · **Query:** `days` (int, default 30)

**Response `200`**
```json
{
  "items": [
    {
      "id": "weight-uuid",
      "log_date": "2025-01-15",
      "weight_kg": 81.8,
      "delta_kg": -0.4,
      "created_at": "2025-01-15T08:00:00Z"
    }
  ],
  "first_weight_kg": 85.0,
  "latest_weight_kg": 81.8,
  "total_change_kg": -3.2
}
```

---

### `DELETE /weight/{id}`

Hard delete (no soft delete on weight logs).

**Auth required:** Yes

**Response `204`** — No content

---

## Module 8 — Dashboard

---

### `GET /dashboard/summary`

**Auth required:** Yes

**Response `200`**
```json
{
  "current_weight_kg": 81.8,
  "target_weight_kg": 88.0,
  "weight_change_kg": -3.2,
  "workouts_this_week": 4,
  "calories_today": 1840.0,
  "protein_today_g": 142.0,
  "recent_activities": [
    {
      "type": "workout",
      "label": "Push Day — 4 exercises",
      "occurred_at": "2025-01-15T10:30:00Z"
    },
    {
      "type": "meal",
      "label": "Lunch — 620 kcal",
      "occurred_at": "2025-01-15T13:00:00Z"
    },
    {
      "type": "weight",
      "label": "81.8 kg logged",
      "occurred_at": "2025-01-15T08:00:00Z"
    }
  ]
}
```

---

### `GET /dashboard/charts/weight`

**Auth required:** Yes · **Query:** `days` (int, default 30)

**Response `200`**
```json
{
  "data": [
    { "date": "2025-01-01", "weight_kg": 85.0 },
    { "date": "2025-01-07", "weight_kg": 84.1 },
    { "date": "2025-01-15", "weight_kg": 81.8 }
  ]
}
```

---

### `GET /dashboard/charts/workouts`

**Auth required:** Yes · **Query:** `weeks` (int, default 4)

**Response `200`**
```json
{
  "data": [
    { "week": "Dec 23", "count": 3 },
    { "week": "Dec 30", "count": 5 },
    { "week": "Jan 06", "count": 4 },
    { "week": "Jan 13", "count": 4 }
  ]
}
```

---

### `GET /dashboard/charts/calories`

**Auth required:** Yes · **Query:** `days` (int, default 7)

**Response `200`**
```json
{
  "data": [
    { "date": "2025-01-09", "calories": 2100.0 },
    { "date": "2025-01-10", "calories": 1950.0 },
    { "date": "2025-01-11", "calories": 0.0 },
    { "date": "2025-01-15", "calories": 1840.0 }
  ]
}
```

> Zero-filled for days with no entries. All `days` always returned.

---

## Module 9 — Community Feed

---

### `GET /feed/global`

**Auth required:** Yes

**Query Params**
| Param | Type | Default | Description |
|---|---|---|---|
| skip | int | 0 | |
| limit | int | 20 | Max 50 |
| type | string | null | workout / meal / weight |

**Response `200`**
```json
{
  "items": [
    {
      "id": "feed-item-uuid",
      "activity_type": "workout",
      "user": {
        "username": "alexj",
        "full_name": "Alex Johnson",
        "avatar_color": "#4F46E5"
      },
      "workout": {
        "session_date": "2025-01-15",
        "name": "Push Day",
        "exercise_count": 4,
        "total_sets": 16,
        "total_volume_kg": 3240.0,
        "exercises": ["Bench Press", "Overhead Press", "Tricep Dips", "Lateral Raises"]
      },
      "meal": null,
      "weight": null,
      "kudos_count": 12,
      "comment_count": 3,
      "has_kudos": true,
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": "feed-item-uuid-2",
      "activity_type": "meal",
      "user": {
        "username": "priya_fit",
        "full_name": "Priya Sharma",
        "avatar_color": "#EC4899"
      },
      "workout": null,
      "meal": {
        "meal_type": "lunch",
        "food_name": "Grilled chicken with rice",
        "calories": 620.0,
        "protein_g": 48.0,
        "carbs_g": 65.0,
        "fat_g": 12.0
      },
      "weight": null,
      "kudos_count": 5,
      "comment_count": 1,
      "has_kudos": false,
      "created_at": "2025-01-15T13:00:00Z"
    }
  ],
  "total": 240,
  "skip": 0,
  "limit": 20
}
```

> `has_kudos` — whether the requesting user has given Kudos to this item.

---

### `GET /feed/following`

**Auth required:** Yes · **Query:** Same as `/feed/global`

**Response `200`** — Same shape as `/feed/global`

---

## Module 10 — Social (Kudos & Comments)

---

### `POST /kudos/{feed_item_id}`

**Auth required:** Yes

**Response `200`**
```json
{
  "feed_item_id": "feed-item-uuid",
  "kudos_count": 13,
  "has_kudos": true
}
```

**Errors:** `400` cannot Kudos own activity · `400` already given Kudos · `404` not found

---

### `DELETE /kudos/{feed_item_id}`

**Auth required:** Yes

**Response `200`**
```json
{
  "feed_item_id": "feed-item-uuid",
  "kudos_count": 12,
  "has_kudos": false
}
```

---

### `GET /comments/{feed_item_id}`

**Auth required:** Yes

**Response `200`**
```json
{
  "items": [
    {
      "id": "comment-uuid",
      "user": {
        "username": "marcus_lifts",
        "full_name": "Marcus Lee",
        "avatar_color": "#10B981"
      },
      "content": "Beast mode! What was your PR on bench?",
      "is_own": false,
      "created_at": "2025-01-15T11:00:00Z"
    }
  ],
  "total": 3
}
```

> `is_own` — true if the comment belongs to the requesting user. Soft-deleted comments are excluded from results.

---

### `POST /comments/{feed_item_id}`

**Auth required:** Yes

**Request**
```json
{ "content": "Crushing it! Keep it up!" }
```

**Validation:** `content` required, 1–500 chars

**Response `201`**
```json
{
  "id": "new-comment-uuid",
  "user": {
    "username": "alexj",
    "full_name": "Alex Johnson",
    "avatar_color": "#4F46E5"
  },
  "content": "Crushing it! Keep it up!",
  "is_own": true,
  "created_at": "2025-01-15T11:15:00Z"
}
```

---

### `DELETE /comments/{comment_id}`

Soft delete — sets `deleted_at`. Comment disappears from feed responses.

**Auth required:** Yes

**Response `204`** — No content

**Errors:** `403` not own comment · `404` not found

---

## Module 11 — Follows

---

### `POST /follows/{username}`

**Auth required:** Yes

**Response `200`**
```json
{
  "username": "marcus_lifts",
  "is_following": true,
  "follower_count": 47
}
```

**Errors:** `400` cannot follow yourself · `400` already following · `404` user not found

---

### `DELETE /follows/{username}`

**Auth required:** Yes

**Response `200`**
```json
{
  "username": "marcus_lifts",
  "is_following": false,
  "follower_count": 46
}
```

---

## Soft Delete Behaviour (API)

| Endpoint | HTTP Method | Returns | DB Operation |
|---|---|---|---|
| `DELETE /workouts/{id}` | DELETE | 204 | Sets `deleted_at` |
| `DELETE /nutrition/{id}` | DELETE | 204 | Sets `deleted_at` |
| `DELETE /weight/{id}` | DELETE | 204 | Hard delete |
| `DELETE /comments/{id}` | DELETE | 204 | Sets `deleted_at` |

> Soft-deleted records are excluded from all GET responses automatically via repository-level filters.
> When a workout is soft-deleted, its corresponding `activity_feed_items` record is also soft-deleted in the same transaction.
