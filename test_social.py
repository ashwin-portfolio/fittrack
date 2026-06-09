import requests, sys

BASE = "http://localhost:8006/api/v1"

def login(email, pw):
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": pw})
    assert r.status_code == 200, f"Login failed: {r.json()}"
    return {"Authorization": f"Bearer {r.json()['access_token']}"}

# Register two test users
for u, e, n in [
    ("socialtest1", "social1@example.com", "Social User One"),
    ("socialtest2", "social2@example.com", "Social User Two"),
]:
    r = requests.post(f"{BASE}/auth/register", json={
        "email": e, "username": u, "password": "TestPass123!", "display_name": n
    })
    if r.status_code not in (201, 409):
        print(f"Register {u}: {r.status_code} {r.json()}")

H1 = login("social1@example.com", "TestPass123!")
H2 = login("social2@example.com", "TestPass123!")

# ── Create shared workout (user1) ─────────────────────────────────────────────
r = requests.get(f"{BASE}/exercises?limit=2", headers=H1)
ex_ids = [e["id"] for e in r.json()["exercises"][:2]]

r = requests.post(f"{BASE}/workouts", json={
    "session_date": "2026-06-09",
    "name": "Push Day",
    "is_shared": True,
    "exercises": [
        {"exercise_id": ex_ids[0], "sets": [{"set_number": 1, "reps": 10, "weight_kg": 60.0}]},
        {"exercise_id": ex_ids[1], "sets": [{"set_number": 1, "reps": 8, "weight_kg": 80.0}]},
    ]
}, headers=H1)
print(f"POST /workouts (shared): {r.status_code}")
assert r.status_code == 201

# Create shared nutrition (user1)
r = requests.post(f"{BASE}/nutrition", json={
    "entry_date": "2026-06-09", "meal_type": "lunch",
    "food_name": "Chicken Rice", "calories": 620, "protein_g": 48.0,
    "is_shared": True
}, headers=H1)
print(f"POST /nutrition (shared): {r.status_code}")
assert r.status_code == 201

# ── GET /feed/global ──────────────────────────────────────────────────────────
r = requests.get(f"{BASE}/feed/global", headers=H2)
print(f"\nGET /feed/global: {r.status_code}")
data = r.json()
print(f"  total: {data['total']}")
for item in data["items"]:
    print(f"  [{item['activity_type']}] {item['user']['username']} — kudos:{item['kudos_count']} comments:{item['comment_count']}")
    if item["workout"]:
        print(f"    workout: {item['workout']['name']} — {item['workout']['exercise_count']} exercises")

assert data["total"] > 0, "Expected feed items"
feed_item_id = data["items"][0]["id"]

# ── POST /kudos/{id} ─────────────────────────────────────────────────────────
r = requests.post(f"{BASE}/kudos/{feed_item_id}", headers=H2)
print(f"\nPOST /kudos: {r.status_code}")
print(r.json())
assert r.status_code == 200 and r.json()["has_kudos"] == True

# Cannot kudos own activity
r = requests.post(f"{BASE}/kudos/{feed_item_id}", headers=H1)
print(f"POST /kudos (own activity): {r.status_code} {r.json()['detail']}")
assert r.status_code == 400

# Already kudosed
r = requests.post(f"{BASE}/kudos/{feed_item_id}", headers=H2)
print(f"POST /kudos (duplicate): {r.status_code} {r.json()['detail']}")
assert r.status_code == 400

# ── POST /comments/{id} ───────────────────────────────────────────────────────
r = requests.post(f"{BASE}/comments/{feed_item_id}", json={"content": "Amazing workout!"}, headers=H2)
print(f"\nPOST /comments: {r.status_code}")
comment = r.json()
print(comment)
comment_id = comment["id"]
assert r.status_code == 201 and comment["is_own"] == True

# ── GET /comments/{id} ────────────────────────────────────────────────────────
r = requests.get(f"{BASE}/comments/{feed_item_id}", headers=H1)
print(f"\nGET /comments: {r.status_code}")
cdata = r.json()
print(f"  total: {cdata['total']}, is_own for user1: {cdata['items'][0]['is_own']}")
assert cdata["total"] == 1 and cdata["items"][0]["is_own"] == False  # viewing user is user1, comment is by user2

# ── DELETE /comments/{id} ─────────────────────────────────────────────────────
r = requests.delete(f"{BASE}/comments/{comment_id}", headers=H2)
print(f"\nDELETE /comments: {r.status_code}")
assert r.status_code == 204

# ── DELETE /kudos/{id} ────────────────────────────────────────────────────────
r = requests.delete(f"{BASE}/kudos/{feed_item_id}", headers=H2)
print(f"\nDELETE /kudos: {r.status_code}")
print(r.json())
assert r.status_code == 200 and r.json()["has_kudos"] == False

# ── POST /follows/{username} ─────────────────────────────────────────────────
r = requests.post(f"{BASE}/follows/socialtest1", headers=H2)
print(f"\nPOST /follows/socialtest1: {r.status_code}")
print(r.json())
assert r.status_code == 200 and r.json()["is_following"] == True

# Already following
r = requests.post(f"{BASE}/follows/socialtest1", headers=H2)
print(f"POST /follows (duplicate): {r.status_code} {r.json()['detail']}")
assert r.status_code == 400

# Cannot follow self
r = requests.post(f"{BASE}/follows/socialtest2", headers=H2)
print(f"POST /follows (self): {r.status_code} {r.json()['detail']}")
assert r.status_code == 400

# ── GET /feed/following ───────────────────────────────────────────────────────
r = requests.get(f"{BASE}/feed/following", headers=H2)
print(f"\nGET /feed/following: {r.status_code}")
fdata = r.json()
print(f"  total: {fdata['total']}, items: {len(fdata['items'])}")
assert fdata["total"] > 0, "Expected following feed items"

# ── DELETE /follows/{username} ────────────────────────────────────────────────
r = requests.delete(f"{BASE}/follows/socialtest1", headers=H2)
print(f"\nDELETE /follows/socialtest1: {r.status_code}")
print(r.json())
assert r.status_code == 200 and r.json()["is_following"] == False

# ── GET /users ────────────────────────────────────────────────────────────────
r = requests.get(f"{BASE}/users?q=social", headers=H1)
print(f"\nGET /users?q=social: {r.status_code}")
udata = r.json()
print(f"  total: {udata['total']}")
for u in udata["items"]:
    print(f"  {u['username']}: followers={u['follower_count']}, is_following={u['is_following']}")

# ── GET /users/{username} ─────────────────────────────────────────────────────
r = requests.get(f"{BASE}/users/socialtest2", headers=H1)
print(f"\nGET /users/socialtest2: {r.status_code}")
print(r.json())

# ── GET /users/{username}/followers ───────────────────────────────────────────
r = requests.post(f"{BASE}/follows/socialtest1", headers=H2)  # re-follow
r = requests.get(f"{BASE}/users/socialtest1/followers", headers=H1)
print(f"\nGET /users/socialtest1/followers: {r.status_code}")
print(r.json())

# ── GET /users/{username}/following ───────────────────────────────────────────
r = requests.get(f"{BASE}/users/socialtest2/following", headers=H1)
print(f"\nGET /users/socialtest2/following: {r.status_code}")
print(r.json())

print("\n--- All social tests passed ---")
