# 🚀 Læringsapp (Learning App) Project

This is a private repository for a "Duolingo-like" mobile application aimed at Norwegian VGS (High School) students. The project's goal is to transform learning into an engaging and fun experience using gamification, social elements, and high-quality, curriculum-relevant quiz content based on the Norwegian "Kunnskapsløftet" (Udir).

## 🧰 Tech Stack

* **Frontend:** [React Native](https://reactnative.dev/) (with [Expo](https://expo.dev/))
* **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based)
* **Backend & Database:** [Convex](https://www.convex.dev/) (Serverless, Real-time Database & Functions)
* **Authentication:** [Convex Auth](https://docs.convex.dev/auth/introduction) (using `@convex-dev/auth` - `better-auth`)

## ⚡️ How to Run

You will need two terminals running simultaneously.

### 1. Prerequisites

* [Node.js](https://nodejs.org/en) (LTS)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [Expo Go app](https://expo.dev/go) on your phone (recommended) or a local simulator.

### 2. Install Dependencies

```bash
npm install
# OR
yarn
```

### 3. Run the Project

**Terminal 1: Start Convex Backend**

This command will watch your `/convex` directory for changes, automatically updating your database schema and backend functions.

```bash
npx convex dev
```

**Terminal 2: Start Expo Frontend**

This command will start the Expo development server.

```bash
npm start
# OR
expo start
```

Scan the QR code with the Expo Go app on your phone, or use the terminal prompts to open it in a local simulator (`i` for iOS, `a` for Android).

## 🗂️ Project Structure

**`/app` (Expo Frontend):** All frontend UI and client-side logic.
* `_layout.tsx`: Main app layout (ConvexProvider, navigation setup).
* `(auth)`: Screen group for unauthenticated users (e.g., login).
* `(app)`: Screen group for authenticated users (the main app).

**`/convex` (Convex Backend):** All backend logic and schema.
* `schema.ts`: Defines the database structure.
* `quizzes.ts`: Queries/mutations for quiz logic.
* `users.ts`: Queries/mutations for user profiles and leaderboards.
* `auth.ts`: Configuration for convexAuth.
* `http.ts`: Handles HTTP endpoints for auth callbacks.
* `seed_questions.ts`: Internal mutation to populate the database.

## 💾 Database Seeding

To populate the database with questions from `questions_data.json`, first ensure the JSON file is in the project's root directory. Then, run:

```bash
npx convex run seedQuestions
```

**Note:** This script is currently destructive. It deletes all existing questions before importing.

## 🗺️ MVP Project Board (Kanban)

### ✅ DONE

* Strategy: Project Description
* Strategy: Market Analysis
* Strategy: User Survey (25 responses)
* Strategy: Concept Validation (Analysis of survey results)
* Setup: Initialized Convex project (`convex.json`)
* Setup: Initialized Expo (React Native) project (`app.json`)
* Content: Created `questions_data.json` test file (English Grammar).
* Backend (DB): Wrote robust `seed_questions.ts` script.
* Backend (DB): Defined v1 Schema (`userProfiles`, `questions`, `quizAttempts`).
* Backend (API): Implemented v1 queries (`getQuiz`, `getLeaderboard`, `getUserProfile`).

### 🧑💻 IN PROGRESS (Started, Not Finished)

**Backend - Auth (`convex/auth.ts`)**
* Task: `convexAuth` is configured with the Email provider.
* Next Step (P0): Integrate a real email service (e.g., Resend) in `sendVerificationRequest` to replace `console.log`.
* Next Step (P0): Add email service API keys to Convex Environment Variables.

**Backend - Quiz Logic (`convex/quizzes.ts`)**
* Task: `submitQuizResults` correctly assigns points.
* Next Step (P1): Extend `submitQuizResults` to calculate and update `userProfile.level` based on total points.
* Next Step (P1): Create `internalMutation awardBadge(ctx, { userId, badgeName })` to be called from the `submitQuizResults` logic.

**Backend - DB Schema (`convex/schema.ts`)**
* Task: Main tables are defined.
* Next Step (P2): Define the new `challenges` table (e.g., `challengerId`, `recipientId`, `quizCategory`, `status`, `winnerId`).

### ✏️ TO DO (Backlog)

#### P0 - Critical Path (Must-Haves for v1)

**Content - Parser Script (HIGH PRIORITY)**
* [ ] Develop the parser script (as planned in Prosjektbeskrivelse) to read Udir exam files (PDF/DOCX) and output `questions_data.json` format.

**Frontend - Auth Flow (UI)**
* [ ] Wrap `app/_layout.tsx` in `<ConvexProvider>`.
* [ ] Implement auth state handling with `useConvexAuth()` to manage loading/auth/unauth states.
* [ ] Build `(auth)/login.tsx` screen with email `<TextInput>` and a `<Button>` that calls the `signIn` mutation.
* [ ] Build a "Check your email" confirmation screen.
* [ ] Implement router logic in `_layout.tsx` to automatically redirect users to `(app)` or `(auth)` based on auth state.

**Frontend - Core Quiz Flow (UI)**
* [ ] Create a `(app)/dashboard.tsx` screen.
* [ ] API: Create a new query `api.quizzes.getCategories` that returns all unique categories.
* [ ] UI: On dashboard, call `useQuery(api.quizzes.getCategories)` and render a list/grid of buttons for each category.
* [ ] Build `(app)/quiz/[category].tsx` screen.
* [ ] UI: Use `useQuery(api.quizzes.getQuiz, { category: ... })` to fetch questions.
* [ ] UI: Build the UI to display one question at a time and store answers in `useState`.
* [ ] Build `(app)/quiz/results.tsx` screen.
* [ ] UI: Call `useMutation(api.quizzes.submitQuizResults)` on completion and display the returned score.

#### P1 - MVP Essentials (Should Have)

**Content - Collection**
* [ ] Gather Udir exam papers for Norsk and Samfunnsfag.
* [ ] Run parser script on new content, clean the output JSON.
* [ ] Run `npx convex run seedQuestions` to import all MVP subjects.

**Frontend - Profile & Gamification (UI)**
* [ ] Implement Tab Navigation in `(app)/_layout.tsx` (e.g., "Home", "Leaderboard", "Profile").
* [ ] Build `(app)/leaderboard.tsx` screen using `useQuery(api.users.getLeaderboard)`.
* [ ] Build `(app)/profile.tsx` screen using `useQuery(api.users.getUserProfile)` to display points, level, and (future) badges.
* [ ] Add a "Sign Out" button to the profile that calls the `signOut` mutation.

#### P2 - MVP Social Features (Nice to Have)

**Backend - Challenges**
* [ ] Write mutations for `createChallenge`, `acceptChallenge`, `submitChallengeResult`.
* [ ] Write a query `getMyChallenges` to list pending/completed challenges for the logged-in user.

**Frontend - Challenges (UI)**
* [ ] Build UI to "Challenge a Friend" (requires a user search feature).
* [ ] Build UI to display pending and completed challenges on the user's profile or dashboard.