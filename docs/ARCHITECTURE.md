# SmartQuiz Architecture

SmartQuiz is a client-only React/Vite application with optional native packaging through Capacitor. It uses local JSON question banks, local storage, a PWA service worker, and native mobile plugins. There is no backend requirement.

## High-Level Flow

1. `src/main.jsx` mounts React.
2. `src/App.jsx` initializes native helpers, registers the service worker, configures daily reminders, renders routes, and mounts the toaster.
3. `src/pages/index.jsx` defines lazy-loaded routes.
4. `src/pages/Layout.jsx` wraps the app in `LanguageProvider`, renders navigation, applies the active theme, and mounts onboarding.
5. Pages read questions through `getQuestionsData()`.
6. Storage helpers scope user data to the active question bank.

## Major Systems

### Question Bank Catalog

File:

```txt
src/components/data/questionBankCatalogStorage.js
```

Responsibilities:

- Defines bundled banks.
- Stores active bank ID.
- Normalizes imported banks.
- Saves the bank catalog.
- Activates, duplicates, adds, and deletes banks.
- Keeps per-bank profile and theme.

Bundled banks:

- Cybersecurity Awareness.
- US Citizenship 2025.
- CompTIA Security+ SY0-701.

### Question Adapter

File:

```txt
src/components/data/index.jsx
```

Responsibilities:

- Reads the active bank.
- Normalizes question records.
- Adds stable `question_key`.
- Applies local edits.
- Hides locally deleted questions.
- Appends custom questions.

### Question Customization Layer

File:

```txt
src/components/data/questionBankStorage.js
```

Runtime question changes are stored locally instead of rewriting bundled JSON.

Customization fields:

- `customQuestions`
- `questionOverrides`
- `deletedQuestionKeys`

### Scoped Storage

File:

```txt
src/components/data/activeBankStorage.js
```

This prevents progress from different banks from mixing.

Scoped records include:

- `quiz_attempts`
- `user_quiz_settings`
- `gamification_profile`
- `learning_state`

### Learning State

File:

```txt
src/components/data/learningStorage.js
```

Stores:

- favorites.
- missed questions.
- per-question stats.
- onboarding state.
- mobile settings.

`Quiz.jsx` records answers. `QuestionCard.jsx` toggles favorites. `Progress.jsx` reads analytics.

### Exam Profile

File:

```txt
src/components/profile/examProfileStorage.js
```

Controls:

- app name.
- subtitle.
- headline.
- description.
- domain.
- passing score.
- questions per test.
- tests per category.
- category labels and descriptions.

Each bank can have its own profile.

### Theme

File:

```txt
src/components/theme/themeStorage.js
```

Controls:

- primary color.
- secondary color.
- accent color.
- background.
- surface.
- text.
- muted.
- success.
- warning.
- danger.

The active theme is applied through CSS variables.

### Gamification

File:

```txt
src/components/gamification/gamification.js
```

Calculates:

- XP.
- levels.
- completion rewards.
- correct-answer rewards.
- difficulty bonuses.
- passing and high-score bonuses.

Gamification is scoped to the active bank.

### Mobile And Offline

Files:

```txt
src/components/mobile/mobileApp.js
src/components/mobile/pwa.js
src/components/mobile/notifications.js
src/components/mobile/Onboarding.jsx
public/sw.js
capacitor.config.json
android/
ios/
```

Responsibilities:

- native status bar.
- splash screen.
- keyboard behavior.
- PWA service worker registration.
- offline runtime cache.
- onboarding.
- local notifications.
- Android/iOS sync through Capacitor.

## Page Responsibilities

### Home

Shows:

- active bank summary.
- question count.
- attempts and average score.
- module cards.
- study entry.
- exam simulator.
- missed-question review.
- favorite-question review.
- flashcards.

### Theory

Study mode with filters and explanations.

### Quiz

Supports:

- practice mode.
- exam simulator mode.
- favorites review.
- missed-question review.

URL examples:

```txt
/Quiz?category=module_1
/Quiz?category=practice_quiz&mode=exam
/Quiz?category=practice_quiz&mode=favorites
/Quiz?category=practice_quiz&mode=mistakes
```

### Flashcards

Card-based review for all, favorite, or missed questions.

### Progress

Shows:

- score trend.
- pass rate.
- best score.
- average time.
- XP and level.
- category performance.
- difficulty performance.
- weak topics.
- questions to review.
- recent attempts.

### Settings

Tabbed admin workspace:

- Question Banks.
- Exam Profile.
- Theme Studio.
- Question Manager.
- Test Limits.
- Mobile.

## Local Storage Overview

Global keys:

- `smartquiz_language`
- `smartquiz_question_bank_catalog`
- `smartquiz_onboarding`
- `smartquiz_mobile_settings`

Scoped keys:

- `quiz_attempts`
- `user_quiz_settings`
- `gamification_profile`
- `learning_state`

Legacy or compatibility keys may still be migrated by storage helpers.

## Data Safety

SmartQuiz is local-first:

- No backend.
- No API key required.
- No server-side database.
- No automatic upload of attempts.

Users should export a full backup before clearing browser data or moving devices.

## Build And Mobile Sync

```bash
npm run lint
npm run build
npx cap sync
```

Capacitor copies the latest web build into Android and iOS projects.
