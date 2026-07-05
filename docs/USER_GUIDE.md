# SmartQuiz End User Guide

This guide is for learners, instructors, and non-technical administrators using SmartQuiz from the browser or mobile app.

## First Start

When the app opens for the first time, SmartQuiz shows an onboarding dialog.

You can choose:

- Interface language: English or Spanish.
- Daily goal: number of questions you want to practice.
- Daily reminder: optional local notification on mobile.

These settings are stored on your device. You can change mobile settings later in `Settings > Mobile`.

## Home

The Home page is your main study dashboard.

You will see:

- Current active question bank.
- Total questions available.
- Attempts completed.
- Average score.
- Module cards for the current bank.
- Quick actions:
  - Start practice.
  - Study question bank.
  - Exam simulator.
  - Missed questions.
  - Favorite questions.
  - Flashcards.

## Switching Question Banks

Go to `Settings > Question Banks`.

From there you can:

- Activate a different bank.
- Search banks.
- Sort by name, questions, attempts, and scores.
- Change page size.
- Duplicate a bank.
- Delete a local bank.
- Create a new bank from a template.
- Import a bank from JSON.
- Export the active bank.
- Export or import a full backup.

Each bank keeps its own:

- Questions.
- Theme.
- Exam profile.
- Progress.
- Test limits.
- XP.
- Favorites.
- Missed questions.

## Built-In Banks

SmartQuiz currently includes:

- Cybersecurity Awareness.
- US Citizenship 2025.
- CompTIA Security+ SY0-701.

You can add more banks from Settings.

## Study Mode

Open `Theory` or press `Study Question Bank` from Home.

Study mode lets you:

- Read questions before taking a test.
- Filter by category.
- Filter by topic.
- Review explanations.
- See difficulty and tags.

Use this mode before a quiz when you want to learn calmly.

## Practice Quiz

Open a module card or press `Start Practice`.

Practice mode:

- Shows one question at a time.
- Lets you select an answer.
- Gives immediate feedback.
- Shows the explanation after answering.
- Records your answer for progress tracking.
- Adds missed questions to your review bank automatically.

You can mark any question as favorite with the star button.

## Exam Simulator

Open `Exam Simulator` from Home.

Exam simulator mode:

- Uses randomized questions.
- Does not show immediate feedback.
- Feels closer to a real exam.
- Shows the score and result after finishing.
- Saves the attempt in progress.

Use this mode when you want to measure readiness.

## Favorite Questions

While answering or studying, press the star button on a question.

Favorite questions are useful for:

- Questions you want to revisit.
- Questions with important explanations.
- Questions you want to discuss with someone else.

Open `Favorites` from Home to practice only those questions.

## Missed Questions

When you answer incorrectly, SmartQuiz automatically saves that question in the missed-question bank.

Open `Missed Questions` from Home to focus on weak areas.

Review mode does not consume normal test limits.

## Flashcards

Open `Flashcards` from Home.

Flashcards let you:

- Review all questions.
- Review only favorites.
- Review only missed questions.
- Reveal the answer when ready.
- Read the explanation after revealing.

This is best for quick repetition and memorization.

## Progress

The Progress page shows:

- Total tests.
- Pass rate.
- Best score.
- Average time.
- XP and level.
- Score trend.
- Category performance.
- Questions to review.
- Difficulty performance.
- Weak topics.
- Favorite count.
- Missed-question count.
- Recent attempts.

Use Progress to decide what to study next.

## Settings

Settings is organized into tabs.

### Question Banks

Manage multiple banks and backups.

### Exam Profile

Change:

- App name.
- Subtitle.
- Description.
- Passing score.
- Questions per test.
- Module names and descriptions.

### Theme Studio

Change the visual identity of the active bank.

Each bank can have different colors. For example, Security+ can use a technology/security palette while Citizenship can use a civic palette.

### Question Manager

Create and edit questions visually.

You can edit:

- Category.
- Difficulty.
- Tags.
- Topic.
- Question text.
- Four answer options.
- Correct answer.
- Explanation.

### Test Limits

Change how many attempts are allowed per module.

Resetting counters does not delete historical attempts.

### Mobile

Change:

- Daily goal.
- Reminder hour.
- Local reminder on/off.

## Importing Questions

SmartQuiz supports multiple import styles.

### SmartQuiz JSON

Import a complete SmartQuiz bank from `Settings > Question Banks > Import`.

### Full Backup

Use full backup when moving all banks and progress to another device.

The backup includes:

- Banks.
- Questions.
- Progress.
- Themes.
- Limits.
- XP.
- Favorites.
- Missed questions.
- Onboarding.
- Mobile settings.

### Simple Text Format

In `Settings > Question Manager`, import one question per line:

```txt
What is MFA?|Password only|Second factor|Open Wi-Fi|No login|1|MFA adds another verification factor.|module_1|beginner|Identity
```

The correct answer is zero-based:

- `0` means option A.
- `1` means option B.
- `2` means option C.
- `3` means option D.

## Offline Use

SmartQuiz is designed to work offline after the app shell and assets are cached.

Offline-friendly data:

- Bundled question banks.
- Local imports.
- Progress.
- Favorites.
- Missed questions.
- Themes.
- Settings.

If you are using the web app, open it once while online before relying on offline mode.

## Privacy

SmartQuiz is local-first. It does not upload your answers to a server.

If you clear browser data or uninstall the app, local progress may be lost unless you exported a full backup.
