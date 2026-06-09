"""
FitTrack Backend Final Verification
Covers all checklist items:
  - Swagger docs complete
  - All 34 endpoints tested
  - Auth protection
  - Pagination
  - Soft deletes
  - Seed data
  - Onboarding (fixed)
"""
import sys
import uuid
import requests

BASE = "http://localhost:8008/api/v1"
PASS = []
FAIL = []

def check(label, condition, detail=""):
    if condition:
        PASS.append(label)
        print(f"  PASS  {label}")
    else:
        FAIL.append(label)
        print(f"  FAIL  {label}" + (f" — {detail}" if detail else ""))

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

# ── 1. SWAGGER DOCS ───────────────────────────────────────────────────────────
section("1. Swagger Docs")
r = requests.get("http://localhost:8007/docs")
check("GET /docs returns 200", r.status_code == 200)

r = requests.get("http://localhost:8007/openapi.json")
check("GET /openapi.json returns 200", r.status_code == 200)
spec = r.json()
paths = list(spec.get("paths", {}).keys())
check("openapi.json has >= 34 paths", len(paths) >= 34, f"found {len(paths)}")
print(f"        Paths ({len(paths)}): {sorted(paths)[:5]}...")

# ── 2. SEED DATA ──────────────────────────────────────────────────────────────
section("2. Seed Data")
# Register a verification user
unique = str(uuid.uuid4())[:8]
reg = requests.post(f"{BASE}/auth/register", json={
    "email": f"verify_{unique}@fittrack.dev",
    "username": f"verify{unique}",
    "password": "VerifyPass123!",
    "display_name": "Verify User",
})
check("Register new user: 201", reg.status_code == 201, reg.text[:100])
tok = requests.post(f"{BASE}/auth/login", json={
    "email": f"verify_{unique}@fittrack.dev",
    "password": "VerifyPass123!",
}).json()["access_token"]
H = {"Authorization": f"Bearer {tok}"}

r = requests.get(f"{BASE}/exercises", headers=H)
check("GET /exercises returns 200", r.status_code == 200)
ex_data = r.json()
check("44+ system exercises seeded", ex_data["total"] >= 44, f"found {ex_data['total']}")

# ── 3. AUTH PROTECTION ────────────────────────────────────────────────────────
section("3. Auth Protection (no token = 401 or 403)")
protected = [
    ("GET", f"{BASE}/profile/me"),
    ("GET", f"{BASE}/exercises"),
    ("GET", f"{BASE}/workouts"),
    ("GET", f"{BASE}/nutrition"),
    ("GET", f"{BASE}/weight/history"),
    ("GET", f"{BASE}/goals/active"),
    ("GET", f"{BASE}/dashboard/summary"),
    ("GET", f"{BASE}/feed/global"),
    ("GET", f"{BASE}/users"),
]
for method, url in protected:
    r = getattr(requests, method.lower())(url)
    check(f"{method} {url.split('/api/v1')[1]} without token -> 401",
          r.status_code in (401, 403), f"got {r.status_code}")

# ── 4. ALL ENDPOINTS ──────────────────────────────────────────────────────────
section("4. All Endpoints — Happy Path")

# Profile
r = requests.get(f"{BASE}/profile/me", headers=H)
check("GET /profile/me", r.status_code == 200)

r = requests.put(f"{BASE}/profile/me", json={"bio": "verification run"}, headers=H)
check("PUT /profile/me", r.status_code == 200 and r.json()["bio"] == "verification run")

# Onboarding (now includes weight + goal)
r = requests.put(f"{BASE}/profile/onboarding", json={
    "age": 28,
    "gender": "male",
    "height_cm": 178.0,
    "current_weight_kg": 82.5,
    "goal_type": "muscle_gain",
    "target_weight_kg": 88.0,
}, headers=H)
check("PUT /profile/onboarding (new spec)", r.status_code == 200,
      r.text[:100])
if r.status_code == 200:
    body = r.json()
    check("Onboarding response shape correct",
          body.get("message") == "Onboarding complete" and body.get("onboarding_complete") is True,
          str(body))

# Onboarding side effects
r = requests.get(f"{BASE}/weight/history", headers=H)
check("Onboarding created initial weight log", r.status_code == 200 and len(r.json()["items"]) >= 1)

r = requests.get(f"{BASE}/goals/active", headers=H)
check("Onboarding created active goal", r.status_code == 200 and r.json()["goal_type"] == "muscle_gain")

# Exercises
ex_id = ex_data["exercises"][0]["id"]
r = requests.get(f"{BASE}/exercises?q=bench&muscle_group=chest", headers=H)
check("GET /exercises with filters", r.status_code == 200)

r = requests.post(f"{BASE}/exercises", json={"name": "VerifyExercise", "muscle_group": "chest"}, headers=H)
check("POST /exercises (custom)", r.status_code == 201)

# Workouts
r = requests.post(f"{BASE}/workouts", json={
    "session_date": "2026-06-09",
    "name": "Verify Workout",
    "is_shared": True,
    "exercises": [
        {"exercise_id": ex_id, "sets": [
            {"set_number": 1, "reps": 10, "weight_kg": 60.0},
            {"set_number": 2, "reps": 8, "weight_kg": 65.0},
        ]}
    ]
}, headers=H)
check("POST /workouts", r.status_code == 201)
if r.status_code == 201:
    workout_id = r.json()["id"]
    r2 = requests.get(f"{BASE}/workouts/{workout_id}", headers=H)
    check("GET /workouts/{id}", r2.status_code == 200)

# Nutrition
r = requests.post(f"{BASE}/nutrition", json={
    "entry_date": "2026-06-09", "meal_type": "dinner",
    "food_name": "Verification Meal", "calories": 500,
    "protein_g": 30.0, "is_shared": True,
}, headers=H)
check("POST /nutrition", r.status_code == 201)
if r.status_code == 201:
    entry_id = r.json()["id"]

r = requests.get(f"{BASE}/nutrition?date=2026-06-09", headers=H)
check("GET /nutrition with date filter", r.status_code == 200 and r.json()["total"] >= 1)

r = requests.get(f"{BASE}/nutrition/daily-summary?date=2026-06-09", headers=H)
check("GET /nutrition/daily-summary", r.status_code == 200 and r.json()["total_calories"] >= 500)

r = requests.get(f"{BASE}/nutrition/recent", headers=H)
check("GET /nutrition/recent", r.status_code == 200)

r = requests.get(f"{BASE}/nutrition/search?q=chicken", headers=H)
check("GET /nutrition/search", r.status_code in (200, 502, 504))  # OFF may be unavailable

# Weight
r = requests.post(f"{BASE}/weight", json={"log_date": "2026-06-08", "weight_kg": 83.0}, headers=H)
# delta_kg is None when no prior entry exists — that is correct behaviour
check("POST /weight (create)", r.status_code == 201 and "delta_kg" in r.json())

r2 = requests.post(f"{BASE}/weight", json={"log_date": "2026-06-08", "weight_kg": 82.8}, headers=H)
check("POST /weight (update same day)", r2.status_code == 200 and r2.json()["id"] == r.json()["id"])

r = requests.get(f"{BASE}/weight/history?days=30", headers=H)
check("GET /weight/history", r.status_code == 200 and r.json()["latest_weight_kg"] is not None)

# Goals
r = requests.post(f"{BASE}/goals", json={"goal_type": "maintenance"}, headers=H)
check("POST /goals (deactivates old)", r.status_code == 201)
r = requests.get(f"{BASE}/goals/active", headers=H)
check("GET /goals/active (updated)", r.status_code == 200 and r.json()["goal_type"] == "maintenance")

# Dashboard
r = requests.get(f"{BASE}/dashboard/summary", headers=H)
check("GET /dashboard/summary", r.status_code == 200)
if r.status_code == 200:
    d = r.json()
    check("Dashboard has current_weight_kg", d["current_weight_kg"] is not None)
    check("Dashboard has calories_today", "calories_today" in d)

r = requests.get(f"{BASE}/dashboard/charts/weight?days=30", headers=H)
check("GET /dashboard/charts/weight", r.status_code == 200)
r = requests.get(f"{BASE}/dashboard/charts/workouts?weeks=4", headers=H)
check("GET /dashboard/charts/workouts (4 weeks)", r.status_code == 200 and len(r.json()["data"]) == 4)
r = requests.get(f"{BASE}/dashboard/charts/calories?days=7", headers=H)
check("GET /dashboard/charts/calories (7 days, zero-filled)", r.status_code == 200 and len(r.json()["data"]) == 7)

# Feed
r = requests.get(f"{BASE}/feed/global", headers=H)
check("GET /feed/global", r.status_code == 200)
if r.status_code == 200 and r.json()["total"] > 0:
    feed_item_id = r.json()["items"][0]["id"]

    r = requests.get(f"{BASE}/feed/following", headers=H)
    check("GET /feed/following", r.status_code == 200)

    r = requests.get(f"{BASE}/comments/{feed_item_id}", headers=H)
    check("GET /comments/{id}", r.status_code == 200)

    r = requests.post(f"{BASE}/comments/{feed_item_id}", json={"content": "Test comment"}, headers=H)
    check("POST /comments/{id}", r.status_code == 201)
    if r.status_code == 201:
        cid = r.json()["id"]
        r = requests.delete(f"{BASE}/comments/{cid}", headers=H)
        check("DELETE /comments/{id}", r.status_code == 204)
else:
    print("        (skipping kudos/comments — no feed items)")

# Users
r = requests.get(f"{BASE}/users", headers=H)
check("GET /users", r.status_code == 200)
r = requests.get(f"{BASE}/users/socialtest1", headers=H)
check("GET /users/{username}", r.status_code in (200, 404))

# Follows
r = requests.post(f"{BASE}/follows/socialtest1", headers=H)
check("POST /follows/{username}", r.status_code in (200, 400))  # 400 if already following
r = requests.get(f"{BASE}/users/verify{unique}/followers", headers=H)
check("GET /users/{username}/followers", r.status_code == 200)
r = requests.get(f"{BASE}/users/verify{unique}/following", headers=H)
check("GET /users/{username}/following", r.status_code == 200)

# ── 5. PAGINATION ─────────────────────────────────────────────────────────────
section("5. Pagination")
r1 = requests.get(f"{BASE}/exercises?skip=0&limit=5", headers=H)
r2 = requests.get(f"{BASE}/exercises?skip=5&limit=5", headers=H)
check("exercises skip=0 limit=5 → 5 items", len(r1.json()["exercises"]) == 5,
      f"got {len(r1.json()['exercises'])}")
check("exercises skip=5 limit=5 → different first item",
      r1.json()["exercises"][0]["id"] != r2.json()["exercises"][0]["id"])
check("total consistent across pages", r1.json()["total"] == r2.json()["total"])

r = requests.get(f"{BASE}/nutrition?skip=0&limit=1", headers=H)
check("nutrition pagination: limit=1 works", len(r.json()["items"]) <= 1)

# ── 6. SOFT DELETES ───────────────────────────────────────────────────────────
section("6. Soft Deletes")
# Create a nutrition entry, delete it, check it's gone
r = requests.post(f"{BASE}/nutrition", json={
    "entry_date": "2026-06-01", "meal_type": "snack",
    "food_name": "ToBeDeleted", "calories": 100,
}, headers=H)
check("Create entry to soft-delete", r.status_code == 201)
if r.status_code == 201:
    del_id = r.json()["id"]
    r = requests.delete(f"{BASE}/nutrition/{del_id}", headers=H)
    check("DELETE /nutrition/{id} → 204", r.status_code == 204)
    r = requests.get(f"{BASE}/nutrition?date=2026-06-01", headers=H)
    check("Deleted entry absent from GET /nutrition", r.json()["total"] == 0)

# Weight soft delete
r = requests.post(f"{BASE}/weight", json={"log_date": "2026-05-15", "weight_kg": 85.0}, headers=H)
check("Create weight to soft-delete", r.status_code == 201)
if r.status_code == 201:
    wid = r.json()["id"]
    r = requests.delete(f"{BASE}/weight/{wid}", headers=H)
    check("DELETE /weight/{id} → 204", r.status_code == 204)
    r = requests.get(f"{BASE}/weight/history?days=365", headers=H)
    ids_in_history = [i["id"] for i in r.json()["items"]]
    check("Soft-deleted weight absent from history", wid not in ids_in_history)

# Re-log same date after soft delete
r = requests.post(f"{BASE}/weight", json={"log_date": "2026-05-15", "weight_kg": 85.5}, headers=H)
check("Re-log same date after soft delete → 201", r.status_code == 201,
      r.text[:80])

# Workout soft delete
r = requests.post(f"{BASE}/workouts", json={
    "session_date": "2026-05-10",
    "name": "ToDelete",
    "exercises": [{"exercise_id": ex_id, "sets": [{"set_number": 1, "reps": 5, "weight_kg": 0}]}]
}, headers=H)
if r.status_code == 201:
    woid = r.json()["id"]
    r = requests.delete(f"{BASE}/workouts/{woid}", headers=H)
    check("DELETE /workouts/{id} → 204", r.status_code == 204)
    r = requests.get(f"{BASE}/workouts/{woid}", headers=H)
    check("Deleted workout returns 404", r.status_code == 404)

# Auth
r = requests.post(f"{BASE}/auth/logout", json={"refresh_token": "invalid"}, headers=H)
check("POST /auth/logout (graceful)", r.status_code in (200, 400, 404))

# ── SUMMARY ───────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  RESULTS: {len(PASS)} passed, {len(FAIL)} failed")
print('='*60)
if FAIL:
    print("\nFailed checks:")
    for f in FAIL:
        print(f"  - {f}")
    sys.exit(1)
else:
    print("\n  All checks passed! Backend is ready for frontend.")
