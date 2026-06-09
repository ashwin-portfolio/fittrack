import requests

BASE = "http://localhost:8003/api/v1"

# --- Login to get token ---
r = requests.post(f"{BASE}/auth/login", json={
    "email": "weighttest@example.com",
    "password": "TestPass123!"
})
print(f"Login: {r.status_code}")
if r.status_code != 200:
    print(r.json())
    exit(1)

token = r.json()["access_token"]
H = {"Authorization": f"Bearer {token}"}

# --- POST /weight (create first entry) ---
r = requests.post(f"{BASE}/weight", json={
    "log_date": "2026-06-05",
    "weight_kg": 82.5,
    "is_shared": False
}, headers=H)
print(f"\nPOST /weight day1: {r.status_code}")
print(r.json())

# --- POST /weight (second day — should show delta) ---
r = requests.post(f"{BASE}/weight", json={
    "log_date": "2026-06-06",
    "weight_kg": 82.1,
    "is_shared": False
}, headers=H)
print(f"\nPOST /weight day2: {r.status_code}")
print(r.json())

# --- POST /weight (update same day — should be 200) ---
r = requests.post(f"{BASE}/weight", json={
    "log_date": "2026-06-06",
    "weight_kg": 82.0,
    "is_shared": False
}, headers=H)
print(f"\nPOST /weight day2 update: {r.status_code}")
print(r.json())

# --- POST /weight (today) ---
r = requests.post(f"{BASE}/weight", json={
    "log_date": "2026-06-09",
    "weight_kg": 81.6,
    "is_shared": False
}, headers=H)
print(f"\nPOST /weight today: {r.status_code}")
data = r.json()
print(data)
today_id = data.get("id")

# --- GET /weight/history ---
r = requests.get(f"{BASE}/weight/history?days=30", headers=H)
print(f"\nGET /weight/history: {r.status_code}")
print(r.json())

# --- DELETE /weight/{id} ---
if today_id:
    r = requests.delete(f"{BASE}/weight/{today_id}", headers=H)
    print(f"\nDELETE /weight/{today_id}: {r.status_code}")

# --- GET history after delete (today's entry should be gone) ---
r = requests.get(f"{BASE}/weight/history?days=30", headers=H)
print(f"\nGET /weight/history after delete: {r.status_code}")
print(r.json())

# --- Validation check — weight out of range ---
r = requests.post(f"{BASE}/weight", json={
    "log_date": "2026-06-09",
    "weight_kg": 10.0
}, headers=H)
print(f"\nPOST /weight (invalid weight 10kg): {r.status_code}")
print(r.json())
