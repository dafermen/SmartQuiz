# QA Guide

Use this guide before publishing or pushing major changes.

## Automated Checks

Run:

```bash
npm run lint
npm run build
```

If mobile or Capacitor files changed:

```bash
npx cap sync
```

Optional dependency check:

```bash
npm audit
```

## First Load

1. Run `npm run dev`.
2. Open the Vite URL.
3. Confirm the app opens without console errors.
4. Confirm onboarding appears on a fresh local storage profile.
5. Select language, daily goal, and reminder preference.
6. Confirm the app reaches Home.

## Language

Test both:

- English.
- Spanish.

Confirm these areas update:

- Navigation.
- Home.
- Quiz.
- Flashcards.
- Progress.
- Settings tabs.
- Question bank manager.
- Onboarding.
- Mobile settings.

## Question Banks

Go to `Settings > Question Banks`.

Validate:

- Search works.
- Sort columns work.
- Pagination works.
- Active bank badge appears.
- Activate Cybersecurity.
- Activate US Citizenship 2025.
- Activate CompTIA Security+ SY0-701.
- Duplicate a bank.
- Create a bank with each template:
  - General.
  - Certification.
  - Citizenship.
- Export active bank.
- Export full backup.
- Import full backup.

## Home

Validate for each bundled bank:

- Hero copy changes.
- Theme changes.
- Question count changes.
- Module labels change.
- Start Practice opens quiz.
- Study Question Bank opens Theory.
- Exam Simulator opens quiz in exam mode.
- Favorites opens review mode.
- Missed Questions opens review mode.
- Flashcards opens card mode.

## Practice Quiz

For each category:

- `module_1`
- `module_2`
- `module_3`
- `practice_quiz`

Expected:

- Test picker appears.
- Questions render.
- Four options appear.
- Submit gives immediate feedback.
- Explanation appears.
- Favorite star works.
- Next question works.
- Final results appear.
- Attempt appears in Progress.

## Exam Simulator

Open:

```txt
/Quiz?category=practice_quiz&mode=exam
```

Expected:

- Start button appears directly.
- No immediate feedback appears after answering.
- Questions advance after submit.
- Result appears at the end.
- Attempt is saved.

## Favorites

1. Start a quiz.
2. Mark a question as favorite.
3. Finish or return Home.
4. Open Favorites.

Expected:

- Favorite count updates.
- Favorite review shows the saved question.
- Removing favorite updates the list.

## Missed Questions

1. Answer a question incorrectly.
2. Return Home.
3. Open Missed Questions.

Expected:

- Missed count updates.
- Missed-question review shows the missed question.
- Review mode does not consume normal test limits.

## Flashcards

Validate filters:

- All questions.
- Favorites.
- Missed questions.

Expected:

- Card shows question first.
- Reveal shows answer and explanation.
- Previous and Next work.
- Favorite star works.

## Theory

Expected:

- Category filter works.
- Topic filter works.
- Explanations render.
- Difficulty and tags render.
- Data changes when active bank changes.

## Progress

Before attempts:

- Empty state appears.

After attempts:

- Total tests updates.
- Pass rate updates.
- Best score updates.
- Average time updates.
- XP and level update.
- Score trend appears.
- Category stats appear.
- Questions to review appear.
- Difficulty stats appear.
- Weak topics appear.
- Favorites and missed counts appear.

## Question Manager

Go to `Settings > Question Manager`.

Validate:

- Search works.
- Language switch works.
- Category filter works.
- Source filter works.
- Pagination works.
- Add question.
- Edit question.
- Duplicate question.
- Delete custom question.
- Edit bundled question as local override.
- Delete bundled question locally.
- Export JSON.
- Import JSON.
- Import simple text format:

```txt
What is MFA?|Password only|Second factor|Open Wi-Fi|No login|1|MFA adds another verification factor.|module_1|beginner|Identity
```

Expected:

- Imported question appears in the selected language.
- Imported question appears in Theory and Quiz.

## Exam Profile

Go to `Settings > Exam Profile`.

Validate:

- App name saves.
- Subtitle saves.
- Hero copy saves.
- Passing score saves.
- Questions per test saves.
- Module labels save in English and Spanish.
- Reset profile works.

## Theme Studio

Validate:

- Presets apply.
- Manual colors apply.
- Save persists after refresh.
- Reset returns default.
- Home and Progress reflect theme.

## Test Limits

Validate:

- Limits save.
- Counters increase after normal practice/exam.
- Review modes do not increase counters.
- Reset counters works.
- Attempt history remains.

## Mobile Settings

Go to `Settings > Mobile`.

Validate:

- Daily goal saves.
- Reminder hour saves.
- Reminder toggle saves.
- Native notification permission is requested on device when reminders are enabled.

## Offline

Web/PWA:

1. Open the app online.
2. Let the service worker register.
3. Refresh once.
4. Disconnect network.
5. Reload.

Expected:

- App shell loads.
- Bundled/local banks are usable.
- Local progress remains.

Native:

- Confirm bundled banks load without network.
- Confirm imported banks remain after restart.

## Android

After `npx cap sync`:

- Open Android Studio.
- Build debug.
- Confirm app opens.
- Confirm notification permission prompt on Android 13+ when enabling reminders.
- Confirm icons and splash screen.

## iOS

After `npx cap sync`:

- Open Xcode on macOS.
- Build simulator/device.
- Confirm app opens.
- Confirm notification permission prompt when enabling reminders.
- Confirm icons and splash screen.

## GitHub Publishing Checklist

Before commit:

```bash
git status
npm run lint
npm run build
npx cap sync
```

Before public release, also review:

```bash
rg -n "password|secret|token|apikey|api_key|private|keystore" --glob "!node_modules/**" --glob "!dist/**"
```

Expected:

- No private secrets committed.
- No `node_modules`.
- No `dist` unless intentionally publishing build output.
