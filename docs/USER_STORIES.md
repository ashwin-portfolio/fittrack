FitTrack MVP — Step 2: User Stories
Format: As a [user type], I want to [action], so that [benefit]. Each story includes Acceptance Criteria and Priority (P1 = must ship, P2 = should ship, P3 = nice to have in MVP).
________________________________________
Epic 1 — Authentication
________________________________________
US-001 — Register an account As a new user, I want to register with my name, email, username, and password, so that I can create a personal FitTrack account.
Priority: P1
Acceptance Criteria:
•	Form fields: Full Name, Email, Username, Password, Confirm Password
•	Email must be unique — show error if already registered
•	Username must be unique, alphanumeric, 3–20 characters
•	Password minimum 8 characters
•	On success, redirect to profile onboarding
•	On failure, show specific field-level error messages
________________________________________
US-002 — Log in to my account As a registered user, I want to log in with my email and password, so that I can access my personal data.
Priority: P1
Acceptance Criteria:
•	Login with email + password
•	Returns JWT access token and refresh token
•	Invalid credentials show a generic error (do not reveal which field is wrong)
•	On success, redirect to /dashboard
•	Token stored securely in HTTP-only cookie or localStorage
________________________________________
US-003 — Log out As a logged-in user, I want to log out, so that my session is cleared on this device.
Priority: P1
Acceptance Criteria:
•	Logout button accessible from navigation on all pages
•	Clears token from client storage
•	Redirects to /login
•	Subsequent requests to protected routes are rejected
________________________________________
US-004 — Stay logged in across sessions As a returning user, I want my session to persist when I close and reopen the browser, so that I do not have to log in every time.
Priority: P1
Acceptance Criteria:
•	Refresh token valid for 7 days
•	Access token silently refreshed before expiry
•	If refresh token is expired, user is redirected to /login
________________________________________
US-005 — Access protected pages As an unauthenticated user, I want to be redirected to login when I visit a protected page, so that my data stays private.
Priority: P1
Acceptance Criteria:
•	All routes except /login, /register, /u/:username require authentication
•	Unauthenticated access redirects to /login
•	After login, user is returned to the originally requested page
________________________________________
Epic 2 — Profile & Onboarding
________________________________________
US-006 — Complete profile setup after registration As a new user, I want to enter my physical stats and fitness goal during onboarding, so that the app is personalized to my needs from the start.
Priority: P1
Acceptance Criteria:
•	Onboarding screen shown immediately after registration
•	Fields: Age, Gender (Male / Female / Other / Prefer not to say), Height (cm), Current Weight (kg), Fitness Goal, Target Weight
•	Fitness Goal options: Weight Loss, Weight Gain, Muscle Gain, Maintenance
•	Target Weight field hidden when goal is Maintenance
•	Cannot access dashboard until onboarding is complete
•	All fields required except Target Weight (when goal is Maintenance)
________________________________________
US-007 — Edit my profile As a registered user, I want to edit my profile details at any time, so that my data stays accurate as I progress.
Priority: P1
Acceptance Criteria:
•	Edit form pre-filled with current values
•	Can update: Name, Username, Bio, Age, Gender, Height, Goal, Target Weight
•	Username change validates uniqueness
•	Bio max 160 characters with live character counter
•	Changes saved immediately with success confirmation
________________________________________
US-008 — Set my profile visibility As a user, I want to choose whether my profile is public or private, so that I control who sees my activity.
Priority: P1
Acceptance Criteria:
•	Toggle on profile page: Public / Private
•	Public: activities shared to feed are visible to all users; profile page accessible at /u/:username
•	Private: shared activities hidden from global feed; profile page shows limited info to non-followers
________________________________________
US-009 — View my public profile As any user, I want to view another user's public profile page, so that I can see their stats, activity, and follow them.
Priority: P1
Acceptance Criteria:
•	Accessible at /u/:username without authentication
•	Shows: avatar (initials), username, bio, follower count, following count, recent shared activities
•	Shows Follow / Unfollow button for authenticated users
•	Private profiles show username and bio only with a "This profile is private" message
________________________________________
US-010 — See my avatar from initials As a user, I want an auto-generated avatar based on my initials, so that my profile looks complete without needing to upload a photo.
Priority: P1
Acceptance Criteria:
•	Avatar generated from first letter of first and last name
•	Consistent background color derived from username (deterministic, not random)
•	Displayed in navbar, profile page, activity cards, and comments
________________________________________
Epic 3 — Workout Tracking
________________________________________
US-011 — Log a new workout session As a user, I want to log a workout session with exercises and sets, so that I have a record of what I trained.
Priority: P1
Acceptance Criteria:
•	Fields: Date (defaults to today), Session Name (optional), Notes (optional)
•	Can add one or more exercises
•	Each exercise has a name and one or more sets
•	Each set has: Reps, Weight (kg)
•	Can add/remove exercises and sets dynamically
•	Save button disabled until at least one exercise with one set is added
•	On save, redirected to workout history
________________________________________
US-012 — Share a workout to the community feed As a user, I want to optionally share my workout to the community, so that my followers can see my progress.
Priority: P1
Acceptance Criteria:
•	"Share to Community" toggle on the workout logging form
•	Default is off
•	When on, workout appears in global feed and followers' feed after saving
•	Shared workouts respect profile visibility (private profiles excluded from global feed)
________________________________________
US-013 — View my workout history As a user, I want to see all my past workout sessions, so that I can review what I have done.
Priority: P1
Acceptance Criteria:
•	List of workout sessions ordered by date (newest first)
•	Each card shows: date, session name, number of exercises, total sets
•	Expandable to see full exercise and set detail
•	Pagination or infinite scroll (20 per page)
________________________________________
US-014 — Delete a workout session As a user, I want to delete a workout session, so that I can remove incorrect entries.
Priority: P1
Acceptance Criteria:
•	Delete button on each workout card (or detail page)
•	Confirmation dialog before deletion
•	If workout was shared to feed, feed item is also removed
•	Deletion is permanent
________________________________________
US-015 — See previous session weights while logging As a user, I want to see what weight I used for an exercise in my last session, so that I can aim for progressive overload.
Priority: P2
Acceptance Criteria:
•	When user types an exercise name that matches a previous session, show last session's sets inline
•	Display: "Last time: 3×10 @ 60kg"
•	Does not block saving if no previous entry exists
________________________________________
Epic 4 — Nutrition Tracking
________________________________________
US-016 — Log a meal As a user, I want to log a meal with its nutritional information, so that I can track my daily intake.
Priority: P1
Acceptance Criteria:
•	Fields: Date (defaults to today), Meal Type, Food Name, Calories, Protein (g), Carbs (g), Fat (g)
•	Meal types: Breakfast, Lunch, Dinner, Snack
•	Calories field required; macros optional
•	On save, redirected to nutrition history
________________________________________
US-017 — Share a meal to the community feed As a user, I want to share a meal to the community, so that others can see what I am eating.
Priority: P2
Acceptance Criteria:
•	"Share to Community" toggle on the meal logging form
•	Default is off
•	Meal card in feed shows: meal type, food name, total calories, macros
________________________________________
US-018 — View my nutrition history As a user, I want to see all my logged meals grouped by date, so that I can review my intake over time.
Priority: P1
Acceptance Criteria:
•	Meals grouped by date, ordered newest first
•	Each date shows: total calories, total protein, total carbs, total fat for that day
•	Individual meal entries listed under each date with full macro breakdown
•	Can navigate between dates
________________________________________
US-019 — Delete a nutrition entry As a user, I want to delete a meal entry, so that I can remove incorrect logs.
Priority: P1
Acceptance Criteria:
•	Delete button on each meal entry
•	Confirmation dialog before deletion
•	If shared to feed, feed item is removed
•	Totals for the day recalculate immediately
________________________________________
US-020 — See today's calorie and macro totals As a user, I want to see a running total of today's calories and macros, so that I know how much I have eaten today at a glance.
Priority: P1
Acceptance Criteria:
•	Displayed on both the dashboard and the nutrition page
•	Updates in real time as entries are added or deleted
•	Shows: Calories, Protein (g), Carbs (g), Fat (g)
________________________________________
Epic 5 — Weight Tracking
________________________________________
US-021 — Log my body weight As a user, I want to log my current body weight for today, so that I can track my weight over time.
Priority: P1
Acceptance Criteria:
•	Fields: Date (defaults to today), Weight (kg)
•	Only one entry per date — if entry for today exists, form shows current value for update
•	Saved entry immediately reflected on dashboard and progress page
________________________________________
US-022 — Share a weight milestone to the community As a user, I want to share a weight log to the community, so that others can see my progress.
Priority: P2
Acceptance Criteria:
•	"Share to Community" toggle on the weight log form
•	Weight card in feed shows: weight logged, change from previous entry (e.g. "−0.5kg from last log")
________________________________________
US-023 — View my weight history As a user, I want to see all my past weight entries, so that I can review my progress over time.
Priority: P1
Acceptance Criteria:
•	Displayed on the progress page as a chart and as a list
•	Chart shows last 30 days by default; user can change range
•	List shows: date, weight, delta from previous entry
________________________________________
Epic 6 — Dashboard
________________________________________
US-024 — See my fitness summary at a glance As a user, I want to see a summary of my key stats when I open the app, so that I can quickly assess my progress.
Priority: P1
Acceptance Criteria:
•	Dashboard shows: current weight, target weight, weight change
•	Total workouts logged this week
•	Total calories and protein logged today
•	Last 5 personal activities (workouts, meals, weight logs)
________________________________________
US-025 — View my weight trend chart As a user, I want to see a chart of my weight over time, so that I can visualize whether I am on track.
Priority: P1
Acceptance Criteria:
•	Line chart of weight logs for last 30 days
•	X-axis: date; Y-axis: weight in kg
•	If fewer than 2 entries, show an empty state with a prompt to log more
________________________________________
US-026 — View my workout frequency chart As a user, I want to see how often I have been working out, so that I can spot consistency gaps.
Priority: P1
Acceptance Criteria:
•	Bar chart showing number of workouts per week for the last 4 weeks
•	Current week highlighted
________________________________________
US-027 — View my daily calorie chart As a user, I want to see my calorie intake over the last 7 days, so that I can spot patterns in my eating.
Priority: P1
Acceptance Criteria:
•	Bar chart of total daily calories for the last 7 days
•	Today shown on the rightmost bar
•	Zero shown for days with no entries (not skipped)
________________________________________
Epic 7 — Community Feed
________________________________________
US-028 — View the global community feed As a user, I want to see a feed of all public shared activities from other users, so that I can stay motivated and connected.
Priority: P1
Acceptance Criteria:
•	Feed shows shared workouts, meals, and weight logs from all public profiles
•	Ordered by most recent first
•	Each card shows: avatar, username, activity type, summary, time ago
•	Infinite scroll with 20 items per page
________________________________________
US-029 — View my following feed As a user, I want to see a feed of activities from only the users I follow, so that I can focus on people I care about.
Priority: P1
Acceptance Criteria:
•	Tab or toggle to switch between Global and Following feed
•	Following feed is empty with a prompt to follow users if following count is zero
•	Same card format as global feed
________________________________________
US-030 — Filter the community feed As a user, I want to filter the feed by activity type, so that I can focus on workouts, meals, or weight entries.
Priority: P2
Acceptance Criteria:
•	Filter options: All, Workouts, Nutrition, Weight
•	Filter persists while browsing the feed
•	Filter does not affect the Following / Global tab selection
________________________________________
US-031 — Give Kudos to an activity As a user, I want to give Kudos to someone's activity, so that I can show appreciation and encouragement.
Priority: P1
Acceptance Criteria:
•	Kudos button on every activity card (thumbs up or star icon)
•	Kudos count updates immediately (optimistic update)
•	Button state changes to indicate I have given Kudos
•	I can click again to remove my Kudos
•	Cannot Kudos my own activity
________________________________________
US-032 — Comment on an activity As a user, I want to leave a comment on a shared activity, so that I can engage with other users.
Priority: P1
Acceptance Criteria:
•	Comment input visible below each activity card (collapsed by default, expands on click)
•	Comment shows: avatar initials, username, text, timestamp
•	Comment appears immediately after posting (optimistic update)
•	Comments ordered oldest first within a card
•	I can delete my own comments; cannot delete others
________________________________________
US-033 — Discover users to follow As a user, I want to browse and search for other users, so that I can build my following list.
Priority: P1
Acceptance Criteria:
•	Discover page at /community/discover
•	Search by username or name
•	Results show: avatar, username, bio, follower count, Follow button
•	Follow state updates immediately
________________________________________
Epic 8 — Follow System
________________________________________
US-034 — Follow a user As a user, I want to follow another user, so that their activities appear in my following feed.
Priority: P1
Acceptance Criteria:
•	Follow button on profile page and discover page
•	Follow action updates follower count immediately
•	Following feed updates to include their future activities
•	Cannot follow myself
________________________________________
US-035 — Unfollow a user As a user, I want to unfollow a user, so that I can manage who I see in my feed.
Priority: P1
Acceptance Criteria:
•	Unfollow button replaces Follow button after following
•	Confirmation not required (low stakes action)
•	Following feed no longer shows their activities after unfollow
________________________________________
US-036 — View my followers and following lists As a user, I want to see who follows me and who I follow, so that I can manage my social connections.
Priority: P1
Acceptance Criteria:
•	Followers and Following counts shown on my profile
•	Clickable to open a modal or page listing users
•	Each entry shows: avatar, username, bio, Follow/Unfollow button
________________________________________
________________________________________
Story Summary
Epic	Stories	P1	P2	P3
Authentication	5	5	0	0
Profile & Onboarding	5	4	1	0
Workout Tracking	5	4	1	0
Nutrition Tracking	5	4	1	0
Weight Tracking	3	2	1	0
Dashboard	4	4	0	0
Community Feed	6	4	2	0
Follow System	3	3	0	0
Total	36	30	6	0
________________________________________
User Stories Status: COMPLETE — 36 stories across 8 epics

