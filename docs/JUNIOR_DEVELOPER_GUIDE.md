# SmartQuiz Junior Developer Guide

This guide explains the project for a junior developer who needs to maintain, customize, or extend SmartQuiz.

## Mental Model

SmartQuiz is a frontend-only app.

There is no database server. The app reads bundled JSON files and stores user changes in local storage.

The main idea is:

1. A bank provides questions.
2. A profile describes how that bank should look and behave.
3. A theme controls colors.
4. The quiz records attempts.
5. Progress reads those attempts and learning state.

## Install And Run

```bash
npm install
npm run dev
```

Validation:

```bash
npm run lint
npm run build
```

Mobile sync:

```bash
npx cap sync
```

## Important Folders

```txt
src/
  components/
    data/
    gamification/
    language/
    mobile/
    profile/
    quiz/
    settings/
    theme/
    theory/
    ui/
  pages/
docs/
public/
android/
ios/
scripts/
```

## Entry Points

- `src/main.jsx`: mounts React.
- `src/App.jsx`: initializes native mobile behavior, service worker, notifications, routes, and toaster.
- `src/pages/index.jsx`: defines lazy-loaded routes.
- `src/pages/Layout.jsx`: wraps the app in `LanguageProvider`, renders navigation, applies theme, and shows onboarding.

Important: components that call `useLanguage()` must be inside `LanguageProvider`. `Layout.jsx` provides it.

## Pages

- `Home.jsx`: dashboard, module cards, quick actions, and summary stats.
- `Theory.jsx`: study mode.
- `Quiz.jsx`: practice, exam simulator, favorites review, and missed-question review.
- `Flashcards.jsx`: card-based review.
- `Progress.jsx`: analytics and recent attempts.
- `Settings.jsx`: admin workspace.

## Question Bank System

The active bank catalog lives in:

```txt
src/components/data/questionBankCatalogStorage.js
```

It defines bundled banks:

- Cybersecurity Awareness.
- US Citizenship 2025.
- CompTIA Security+ SY0-701.

The catalog stores:

- `activeBankId`
- `banks`
- `baseQuestions`
- `customizations`
- `profile`
- `theme`

The active bank is read by:

```txt
src/components/data/index.jsx
```

That adapter normalizes each question and applies local customizations.

## Question Customizations

Runtime edits do not rewrite source JSON files.

They are stored as:

- `customQuestions`
- `questionOverrides`
- `deletedQuestionKeys`

Code:

```txt
src/components/data/questionBankStorage.js
```

UI:

```txt
src/components/settings/QuestionBankManager.jsx
```

## Learning State

Favorites, missed questions, onboarding, and mobile settings are handled in:

```txt
src/components/data/learningStorage.js
```

Learning state stores:

- `favorites`
- `mistakes`
- `questionStats`

`Quiz.jsx` calls `recordQuestionAnswer()` after each answer.

`QuestionCard.jsx` calls `toggleQuestionFavorite()`.

`Progress.jsx` reads learning state to show weak topics, difficulty stats, favorites, and missed questions.

## Local Storage Scope

Many keys are scoped per active bank through:

```txt
src/components/data/activeBankStorage.js
```

This prevents one bank's progress from mixing with another bank's progress.

Examples:

- `quiz_attempts`
- `user_quiz_settings`
- `gamification_profile`
- `learning_state`

## Quiz Modes

`Quiz.jsx` reads query parameters:

```txt
/Quiz?category=module_1
/Quiz?category=practice_quiz&mode=exam
/Quiz?category=practice_quiz&mode=favorites
/Quiz?category=practice_quiz&mode=mistakes
```

Modes:

- `practice`: immediate feedback.
- `exam`: no immediate feedback.
- `favorites`: review favorite questions.
- `mistakes`: review missed questions.

Review modes do not consume normal test limits.

## Flashcards

`Flashcards.jsx` reads the active question bank and filters by:

- all questions.
- favorites.
- missed questions.

It does not create attempts. It is a study tool.

## Exam Profile

Profile storage:

```txt
src/components/profile/examProfileStorage.js
```

Profile controls:

- app name.
- subtitle.
- hero headline.
- description.
- passing score.
- questions per test.
- categories.
- visible labels.

The IDs should stay generic, usually:

- `module_1`
- `module_2`
- `module_3`
- `practice_quiz`

Visible labels can be changed per bank.

## Theme System

Theme storage:

```txt
src/components/theme/themeStorage.js
```

Theme UI:

```txt
src/components/settings/ThemeStudio.jsx
```

Themes are applied as CSS variables. Each bank can keep a separate theme.

## Language System

Translations live in:

```txt
src/components/language/LanguageProvider.jsx
```

Current supported UI languages:

- `en`
- `es`

When adding a UI label, add it to both languages.

## Mobile System

Mobile-related files:

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

Capacitor plugins currently include:

- Filesystem.
- Keyboard.
- Local Notifications.
- Preferences.
- Share.
- Splash Screen.
- Status Bar.

Android notification permission is declared in:

```txt
android/app/src/main/AndroidManifest.xml
```

## Adding A New Bundled Bank

1. Create a JSON file in `src/components/data/`.
2. Import it in `questionBankCatalogStorage.js`.
3. Create a theme object.
4. Create a profile object.
5. Add the bank to `createDefaultCatalog()`.
6. Run:

```bash
npm run lint
npm run build
npx cap sync
```

## Common Bugs

### `useLanguage must be used within a LanguageProvider`

Cause: a component using `useLanguage()` is rendered outside `Layout`.

Fix: move it inside `LayoutContent`, or wrap it in `LanguageProvider`.

### New text shows as key name

Cause: missing translation key.

Fix: add the key to both `en` and `es` in `LanguageProvider.jsx`.

### A bank change does not refresh UI

Cause: missing event dispatch or listener.

Expected events:

- `smartquiz-question-bank-catalog-updated`
- `smartquiz-question-bank-updated`
- `smartquiz-exam-profile-updated`
- `smartquiz-theme-updated`
- `smartquiz-learning-state-updated`

### Progress mixes across banks

Cause: direct `localStorage` access instead of scoped helpers.

Fix: use `readScopedJson()` and `writeScopedJson()`.

## Before Committing

Always run:

```bash
npm run lint
npm run build
```

If mobile files changed:

```bash
npx cap sync
```
