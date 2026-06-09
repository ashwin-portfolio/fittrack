import requests

BASE = "http://localhost:8005/api/v1"

token = requests.post(f"{BASE}/auth/login", json={
    "email": "weighttest@example.com",
    "password": "TestPass123!"
}).json()["access_token"]
H = {"Authorization": f"Bearer {token}"}

# Seed data: log weight, add nutrition, create workout
requests.post(f"{BASE}/weight", json={"log_date": "2026-05-20", "weight_kg": 83.0}, headers=H)
requests.post(f"{BASE}/weight", json={"log_date": "2026-06-01", "weight_kg": 82.0}, headers=H)
requests.post(f"{BASE}/weight", json={"log_date": "2026-06-09", "weight_kg": 81.5}, headers=H)

requests.post(f"{BASE}/nutrition", json={
    "entry_date": "2026-06-09", "meal_type": "breakfast",
    "food_name": "Oats", "calories": 350, "protein_g": 12.0
}, headers=H)
requests.post(f"{BASE}/nutrition", json={
    "entry_date": "2026-06-09", "meal_type": "lunch",
    "food_name": "Chicken Rice", "calories": 620, "protein_g": 48.0
}, headers=H)

# ── GET /dashboard/summary ────────────────────────────────────────────────────
r = requests.get(f"{BASE}/dashboard/summary", headers=H)
print(f"GET /dashboard/summary: {r.status_code}")
data = r.json()
print(f"  current_weight_kg: {data['current_weight_kg']}")
print(f"  target_weight_kg:  {data['target_weight_kg']}")
print(f"  weight_change_kg:  {data['weight_change_kg']}")
print(f"  workouts_this_week:{data['workouts_this_week']}")
print(f"  calories_today:    {data['calories_today']}")
print(f"  protein_today_g:   {data['protein_today_g']}")
print(f"  recent_activities ({len(data['recent_activities'])}):")
for a in data["recent_activities"]:
    print(f"    [{a['type']}] {a['label']}")

# ── GET /dashboard/charts/weight ──────────────────────────────────────────────
r = requests.get(f"{BASE}/dashboard/charts/weight?days=30", headers=H)
print(f"\nGET /dashboard/charts/weight: {r.status_code}")
wdata = r.json()["data"]
for pt in wdata:
    print(f"  {pt['date']} → {pt['weight_kg']} kg")

# ── GET /dashboard/charts/workouts ────────────────────────────────────────────
r = requests.get(f"{BASE}/dashboard/charts/workouts?weeks=4", headers=H)
print(f"\nGET /dashboard/charts/workouts: {r.status_code}")
for wk in r.json()["data"]:
    print(f"  Week {wk['week']}: {wk['count']} sessions")

# ── GET /dashboard/charts/calories ────────────────────────────────────────────
r = requests.get(f"{BASE}/dashboard/charts/calories?days=7", headers=H)
print(f"\nGET /dashboard/charts/calories: {r.status_code}")
for day in r.json()["data"]:
    print(f"  {day['date']}: {day['calories']} kcal")

print("\nAll dashboard endpoints responded correctly.")
