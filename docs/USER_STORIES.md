# FitTrack MVP — User Stories

**Version:** 1.0
**Total Stories:** 40 (36 original + 4 exercise library)
**Priority:** P1 = Must ship | P2 = Should ship | P3 = Nice to have

---

## Epic 1 — Authentication

---

### US-001 — Register an account
**As a** new user, **I want to** register with my name, email, username, and password, **so that** I can create a personal FitTrack account.

**Priority:** P1

**Acceptance Criteria:**
- Form fields: Full Name, Email, Username, Password, Confirm Password
- Email must be unique — show error if already registered
- Username must be unique, alphanumeric + underscore, 3–20 characters
- Password minimum 8 characters
- On success, redirect to profile onboarding
- On failure, show specific field-level error messages

---

### US-002 — Log in to my account
**As a** registered user, **I want to** log in with my email and password, **so that** I can access my personal data.

**Priority:** P1

**Acceptance Criteria:**
- Login with email + password
- Returns JWT access token and refresh token
- Invalid credentials show a generic error (do not reveal which field is wrong)
- On success, redirect to `/dashboard`
- Tokens stored securely

---

### US-003 — Log out
**As a** logged-in user, **I want to** log out, **so that** my session is cleared on this device.

**Priority:** P1

**Acceptance Criteria:**
- Logout button accessible from navigation on all pages
- Revokes refresh token server-side
- Clears tokens from client storage
- Redirects to `/login`
- Subsequent requests to protected routes are rejected

---

### US-004 — Stay logged in across sessions
**As a** returning user, **I want** my session to persist when I close and reopen the browser, **so that** I do not have to log in every time.

**Priority:** P1

**Acceptance Criteria:**
- Refresh token valid for 7 days
- Access token silently refreshed before expiry
- If refresh token is expired or revoked, user redirected to `/login`

---

### US-005 — Access protected pages
**As an** unauthenticated user, **I want to** be redirected to login when I visit a protected page, **so that** my data stays private.

**Priority:** P1

**Acceptance Criteria:**
- All routes except `/login`, `/register`, `/u/:username` require authentication
- Unauthenticated access redirects to `/login`
- After login, user is returned to the originally requested page

---

## Epic 2 — Profile & Onboarding

---

### US-006 — Complete profile setup after registration
**As a** new user, **I want to** enter my physical stats and fitness goal during onboarding, **so that** the app is personalized from the start.

**Priority:** P1

**Acceptance Criteria:**
- Onboarding shown immediately after registration
- Fields: Age, Gender, Height (cm), Current Weight (kg), Fitness Goal, Target Weight
- Fitness Goal options: Weight Loss, Weight Gain, Muscle Gain, Maintenance
- Target Weight hidden when goal is Maintenance
- Cannot access dashboard until onboarding is complete
- All fields required except Target Weight (when goal is Maintenance)

---

### US-007 — Edit my profile
**As a** registered user, **I want to** edit my profile details at any time, **so that** my data stays accurate as I progress.

**Priority:** P1

**Acceptance Criteria:**
- Edit form pre-filled with current values
- Can update: Name, Username, Bio, Age, Gender, Height, Goal, Target Weight
- Username change validates uniqueness
- Bio max 160 characters with live character counter
- Changes saved with success confirmation

---

### US-008 — Set my profile visibility
**As a** user, **I want to** choose whether my profile is public or private, **so that** I control who sees my activity.

**Priority:** P1

**Acceptance Criteria:**
- Toggle on profile page: Public / Private
- Public: shared activities visible to all; profile at `/u/:username` accessible
- Private: shared activities hidden from global feed; non-followers see limited info

---

### US-009 — View another user's public profile
**As any** user, **I want to** view another user's public profile page, **so that** I can see their stats and follow them.

**Priority:** P1

**Acceptance Criteria:**
- Accessible at `/u/:username` without authentication
- Shows: avatar, username, bio, follower count, following count, recent shared activities
- Follow / Unfollow button for authenticated users
- Private profiles show username and bio only

---

### US-010 — See my avatar from initials
**As a** user, **I want** an auto-generated avatar based on my initials, **so that** my profile looks complete without uploading a photo.

**Priority:** P1

**Acceptance Criteria:**
- Avatar generated from first letter of first and last name
- Background color derived deterministically from username
- Displayed in navbar, profile page, activity cards, and comments

---

## Epic 3 — Exercise Library

---

### US-011 — Search the exercise library
**As a** user logging a workout, **I want to** search for exercises by name or muscle group, **so that** I can quickly find the exercise I want.

**Priority:** P1

**Acceptance Criteria:**
- Search input with partial name match (case-insensitive)
- Filter by muscle group: chest / back / shoulders / biceps / triceps / legs / core / cardio / full_body / other
- Results show exercise name and muscle group
- System exercises and my custom exercises shown together
- Results appear within 200ms of typing

---

### US-012 — Create a custom exercise
**As a** user, **I want to** create a custom exercise when it is not in the library, **so that** I can track any movement I perform.

**Priority:** P1

**Acceptance Criteria:**
- "Create custom exercise" option available from the exercise search
- Fields: Exercise Name, Muscle Group (required)
- Custom exercise is immediately available to use in the current workout
- Custom exercises are visible only to the creating user
- Cannot duplicate exercise name within my own custom list

---

### US-013 — Use exercises from the library in a workout
**As a** user, **I want** my workout exercises to reference the exercise library, **so that** my history is consistent and searchable.

**Priority:** P1

**Acceptance Criteria:**
- Workout form uses exercise search / select instead of free-text input
- Selected exercise displays name and muscle group tag
- Multiple different exercises can be added to one session
- Exercise order can be rearranged

---

### US-014 — See last session weights for an exercise
**As a** user logging a workout, **I want to** see what weight I used for an exercise in my last session, **so that** I can aim for progressive overload.

**Priority:** P2

**Acceptance Criteria:**
- When an exercise is selected, show: "Last time: 3×10 @ 60kg" inline
- Only shown if a previous session with this exercise exists
- Does not block saving if no previous entry exists

---

## Epic 4 — Workout Tracking

---

### US-015 — Log a new workout session
**As a** user, **I want to** log a workout session with exercises and sets, **so that** I have a record of what I trained.

**Priority:** P1

**Acceptance Criteria:**
- Fields: Date (defaults to today), Session Name (optional), Notes (optional)
- Can add one or more exercises from library
- Each exercise has one or more sets (reps + weight)
- Can add/remove exercises and sets dynamically
- Save button disabled until at least one exercise with one set is added
- On save, redirected to workout history

---

### US-016 — Share a workout to the community feed
**As a** user, **I want to** optionally share my workout to the community, **so that** my followers can see my progress.

**Priority:** P1

**Acceptance Criteria:**
- "Share to Community" toggle on the workout form
- Default is off
- When on, workout appears in global and following feeds after saving
- Private profiles excluded from global feed

---

### US-017 — View my workout history
**As a** user, **I want to** see all my past workout sessions, **so that** I can review what I have done.

**Priority:** P1

**Acceptance Criteria:**
- List ordered by date (newest first)
- Each card shows: date, session name, number of exercises, total sets, total volume
- Expandable to see full exercise and set detail
- Pagination or infinite scroll (20 per page)

---

### US-018 — Delete a workout session
**As a** user, **I want to** delete a workout session, **so that** I can remove incorrect entries.

**Priority:** P1

**Acceptance Criteria:**
- Delete button on each workout card
- Confirmation dialog before deletion
- Soft delete — sets deleted_at timestamp (data recoverable by admin)
- If workout was shared to feed, feed item is also soft-deleted
- Workout disappears from history immediately

---

## Epic 5 — Nutrition Tracking

---

### US-019 — Log a meal
**As a** user, **I want to** log a meal with its nutritional information, **so that** I can track my daily intake.

**Priority:** P1

**Acceptance Criteria:**
- Fields: Date (defaults to today), Meal Type, Food Name, Calories, Protein (g), Carbs (g), Fat (g)
- Meal types: Breakfast, Lunch, Dinner, Snack
- Calories required; macros optional
- On save, redirected to nutrition history

---

### US-020 — Share a meal to the community feed
**As a** user, **I want to** share a meal to the community, **so that** others can see what I am eating.

**Priority:** P2

**Acceptance Criteria:**
- "Share to Community" toggle on the meal form
- Default is off
- Meal card in feed shows: meal type, food name, total calories, macros

---

### US-021 — View my nutrition history
**As a** user, **I want to** see all my logged meals grouped by date, **so that** I can review my intake over time.

**Priority:** P1

**Acceptance Criteria:**
- Meals grouped by date, ordered newest first
- Each date shows: total calories, protein, carbs, fat for that day
- Individual meal entries listed under each date
- Can navigate between dates

---

### US-022 — Delete a nutrition entry
**As a** user, **I want to** delete a meal entry, **so that** I can remove incorrect logs.

**Priority:** P1

**Acceptance Criteria:**
- Delete button on each meal entry
- Confirmation dialog before deletion
- Soft delete — sets deleted_at timestamp
- If shared to feed, feed item is soft-deleted
- Daily totals recalculate immediately

---

### US-023 — See today's calorie and macro totals
**As a** user, **I want to** see a running total of today's calories and macros, **so that** I know how much I have eaten at a glance.

**Priority:** P1

**Acceptance Criteria:**
- Displayed on dashboard and nutrition page
- Updates as entries are added or deleted
- Shows: Calories, Protein (g), Carbs (g), Fat (g)

---

## Epic 6 — Weight Tracking

---

### US-024 — Log my body weight
**As a** user, **I want to** log my current body weight for today, **so that** I can track my weight over time.

**Priority:** P1

**Acceptance Criteria:**
- Fields: Date (defaults to today), Weight (kg)
- One entry per date — if today's entry exists, form shows current value for update
- Saved entry immediately reflected on dashboard and progress page

---

### US-025 — Share a weight milestone to the community
**As a** user, **I want to** share a weight log to the community, **so that** others can see my progress.

**Priority:** P2

**Acceptance Criteria:**
- "Share to Community" toggle on the weight log form
- Weight card in feed shows: weight logged, change from previous entry

---

### US-026 — View my weight history
**As a** user, **I want to** see all my past weight entries, **so that** I can review my progress over time.

**Priority:** P1

**Acceptance Criteria:**
- Displayed on progress page as a chart and as a list
- Chart shows last 30 days by default
- List shows: date, weight, delta from previous entry

---

## Epic 7 — Dashboard

---

### US-027 — See my fitness summary at a glance
**As a** user, **I want to** see a summary of my key stats when I open the app, **so that** I can quickly assess my progress.

**Priority:** P1

**Acceptance Criteria:**
- Dashboard shows: current weight, target weight, weight change
- Total workouts logged this week
- Total calories and protein logged today
- Last 5 personal activities (workouts, meals, weight logs)

---

### US-028 — View my weight trend chart
**As a** user, **I want to** see a chart of my weight over time, **so that** I can visualize whether I am on track.

**Priority:** P1

**Acceptance Criteria:**
- Line chart of weight logs for last 30 days
- X-axis: date; Y-axis: weight in kg
- If fewer than 2 entries, show empty state with prompt to log more

---

### US-029 — View my workout frequency chart
**As a** user, **I want to** see how often I have been working out, **so that** I can spot consistency gaps.

**Priority:** P1

**Acceptance Criteria:**
- Bar chart showing workouts per week for last 4 weeks
- Current week highlighted

---

### US-030 — View my daily calorie chart
**As a** user, **I want to** see my calorie intake over the last 7 days, **so that** I can spot patterns in my eating.

**Priority:** P1

**Acceptance Criteria:**
- Bar chart of total daily calories for last 7 days
- Today on the rightmost bar
- Zero shown for days with no entries

---

## Epic 8 — Community Feed

---

### US-031 — View the global community feed
**As a** user, **I want to** see a feed of all public shared activities, **so that** I can stay motivated and connected.

**Priority:** P1

**Acceptance Criteria:**
- Feed shows shared workouts, meals, and weight logs from all public profiles
- Ordered by most recent first
- Each card shows: avatar, username, activity type, summary, time ago
- Infinite scroll with 20 items per page

---

### US-032 — View my following feed
**As a** user, **I want to** see a feed of activities from only the users I follow, **so that** I can focus on people I care about.

**Priority:** P1

**Acceptance Criteria:**
- Tab or toggle to switch between Global and Following feed
- Following feed shows empty state with prompt to follow users if following count is zero

---

### US-033 — Filter the community feed
**As a** user, **I want to** filter the feed by activity type, **so that** I can focus on workouts, meals, or weight entries.

**Priority:** P2

**Acceptance Criteria:**
- Filter options: All, Workouts, Nutrition, Weight
- Filter persists while browsing the feed

---

### US-034 — Give Kudos to an activity
**As a** user, **I want to** give Kudos to someone's activity, **so that** I can show appreciation and encouragement.

**Priority:** P1

**Acceptance Criteria:**
- Kudos button on every activity card
- Kudos count updates immediately (optimistic update)
- Button state changes to indicate Kudos given
- Click again to remove Kudos
- Cannot Kudos own activity

---

### US-035 — Comment on an activity
**As a** user, **I want to** leave a comment on a shared activity, **so that** I can engage with other users.

**Priority:** P1

**Acceptance Criteria:**
- Comment input below each activity card (collapsed by default)
- Comment shows: avatar initials, username, text, timestamp
- Appears immediately after posting (optimistic update)
- Comments ordered oldest first
- Can delete own comments (soft delete)

---

### US-036 — Discover users to follow
**As a** user, **I want to** browse and search for other users, **so that** I can build my following list.

**Priority:** P1

**Acceptance Criteria:**
- Discover page at `/community/discover`
- Search by username or name
- Results show: avatar, username, bio, follower count, Follow button
- Follow state updates immediately

---

## Epic 9 — Follow System

---

### US-037 — Follow a user
**As a** user, **I want to** follow another user, **so that** their activities appear in my following feed.

**Priority:** P1

**Acceptance Criteria:**
- Follow button on profile page and discover page
- Follow action updates follower count immediately
- Following feed updates to include their future activities
- Cannot follow myself

---

### US-038 — Unfollow a user
**As a** user, **I want to** unfollow a user, **so that** I can manage who I see in my feed.

**Priority:** P1

**Acceptance Criteria:**
- Unfollow button replaces Follow after following
- No confirmation required
- Following feed no longer shows their activities after unfollow

---

### US-039 — View my followers and following lists
**As a** user, **I want to** see who follows me and who I follow, **so that** I can manage my social connections.

**Priority:** P1

**Acceptance Criteria:**
- Followers and Following counts shown on profile
- Clickable to open modal listing users
- Each entry shows: avatar, username, bio, Follow/Unfollow button

---

## Story Summary

| Epic | Stories | P1 | P2 |
|---|---|---|---|
| Authentication | 5 | 5 | 0 |
| Profile & Onboarding | 5 | 5 | 0 |
| Exercise Library | 4 | 3 | 1 |
| Workout Tracking | 4 | 3 | 1 |
| Nutrition Tracking | 5 | 4 | 1 |
| Weight Tracking | 3 | 2 | 1 |
| Dashboard | 4 | 4 | 0 |
| Community Feed | 5 | 4 | 1 |
| Follow System | 3 | 3 | 0 |
| **Total** | **39** | **33** | **6** |
