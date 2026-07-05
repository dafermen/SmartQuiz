# Code Map

This map shows where the main SmartQuiz features live.

## App Shell

- `src/main.jsx`: React entry point.
- `src/App.jsx`: native setup, service worker setup, notification setup, routes, toaster.
- `src/pages/index.jsx`: React Router routes and lazy loading.
- `src/pages/Layout.jsx`: `LanguageProvider`, header, drawer, mobile nav, theme application, onboarding.
- `src/App.css`: app-level responsive and mobile styles.
- `src/index.css`: Tailwind and design tokens.

## Pages

- `src/pages/Home.jsx`: dashboard, bank summary, quick actions, module cards.
- `src/pages/Theory.jsx`: study mode.
- `src/pages/Quiz.jsx`: practice, exam simulator, favorites review, missed review.
- `src/pages/Flashcards.jsx`: flashcard review.
- `src/pages/Progress.jsx`: analytics, XP, weak topics, recent attempts.
- `src/pages/Settings.jsx`: tabbed admin workspace.

## Data And Storage

- `src/components/data/cybersecurityAwarenessQuestions.json`: bundled cybersecurity bank.
- `src/components/data/usCitizenship2025Questions.json`: bundled US Citizenship 2025 bank.
- `src/components/data/comptiaSecurity701Questions.json`: bundled Security+ SY0-701 bank.
- `src/components/data/index.jsx`: active-bank question adapter.
- `src/components/data/questionBankCatalogStorage.js`: multi-bank catalog.
- `src/components/data/questionBankStorage.js`: local question customizations.
- `src/components/data/activeBankStorage.js`: per-bank scoped local storage.
- `src/components/data/learningStorage.js`: favorites, mistakes, question stats, onboarding, mobile settings.

## Domain Configuration

- `src/components/profile/examProfileStorage.js`: exam profile defaults and persistence.
- `src/components/theme/themeStorage.js`: theme presets, theme persistence, CSS variable application.
- `src/components/language/LanguageProvider.jsx`: English and Spanish UI strings.
- `src/components/brand/brand.js`: shared product constants.

## Quiz Components

- `src/components/quiz/CategoryCard.jsx`: module cards.
- `src/components/quiz/QuestionCard.jsx`: answer selection, feedback, explanations, favorites.
- `src/components/quiz/ResultsCard.jsx`: final result, pass/fail, XP, level progress.
- `src/components/quiz/TestLimitBadge.jsx`: remaining attempts.

## Settings Components

- `src/components/settings/QuestionBankCatalogManager.jsx`: banks table, activation, import/export, full backup, templates.
- `src/components/settings/QuestionBankManager.jsx`: visual question editor and flexible import.
- `src/components/settings/ThemeStudio.jsx`: theme editor.

## Study Components

- `src/components/theory/TheoryCard.jsx`: study cards.

## Mobile Components

- `src/components/mobile/mobileApp.js`: native mobile configuration.
- `src/components/mobile/pwa.js`: service worker registration.
- `src/components/mobile/notifications.js`: local daily reminders.
- `src/components/mobile/Onboarding.jsx`: first-run setup.
- `public/sw.js`: offline service worker.
- `public/manifest.webmanifest`: PWA manifest.
- `capacitor.config.json`: Capacitor app config.
- `android/`: Android native project.
- `ios/`: iOS native project.

## Scripts

- `scripts/generate-mobile-assets.py`: app icons and splash assets.
- `scripts/generate-citizenship-bank.py`: citizenship bank generation.
- `scripts/generate-security701-bank.py`: Security+ bank generation.

## UI Primitives

- `src/components/ui/*`: reusable Radix/shadcn-style components.

## Best Places To Customize

- Add a bank: `questionBankCatalogStorage.js`.
- Edit bundled JSON: `src/components/data/*.json`.
- Change labels: Settings or `examProfileStorage.js`.
- Change colors: Theme Studio or `themeStorage.js`.
- Add translations: `LanguageProvider.jsx`.
- Change quiz behavior: `Quiz.jsx` and `QuestionCard.jsx`.
- Change analytics: `Progress.jsx` and `learningStorage.js`.
- Change mobile onboarding: `Onboarding.jsx`.
- Change notifications: `notifications.js`.
