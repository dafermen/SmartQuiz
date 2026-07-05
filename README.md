# SmartQuiz

SmartQuiz is a bilingual, JSON-powered quiz, study, and exam-simulation platform built with React, Vite, Tailwind CSS, Radix UI, Recharts, Framer Motion, and Capacitor.

The app runs without a backend. Question banks, progress, themes, limits, XP, favorites, missed questions, onboarding, and mobile preferences are stored locally. It can be published as a web app, installed as a PWA, or packaged for Android and iOS with Capacitor.

## Demo

Live demo: [https://smartquiz.innovalogic.tech/](https://smartquiz.innovalogic.tech/)

## What It Includes

- Multiple local question banks with separate progress, themes, limits, and XP.
- Bundled banks:
  - Cybersecurity Awareness.
  - US Citizenship 2025, English and Spanish.
  - CompTIA Security+ SY0-701 practice, English and Spanish.
- Question bank catalog manager with activation, search, sorting, pagination, duplication, import, export, and full backup.
- Visual question editor for creating, editing, duplicating, deleting, and overriding questions locally.
- Flexible question import:
  - SmartQuiz JSON.
  - Full backup JSON.
  - Simple line format: `question|A|B|C|D|0|explanation|module_1|beginner|Topic`.
- Study mode with explanations.
- Quiz mode with immediate feedback.
- Exam simulator mode with no immediate feedback.
- Favorite questions and missed-question review.
- Flashcards mode.
- Smart progress dashboard with score trend, category performance, difficulty performance, weak topics, favorites, missed questions, XP, and recent attempts.
- Theme Studio for per-bank branding.
- Onboarding with language, daily goal, and optional reminders.
- Mobile support through Capacitor for Android and iOS.
- Offline support through PWA service worker and bundled local JSON banks.
- Local notifications with `@capacitor/local-notifications`.

## Documentation

Start here depending on your role:

- [End User Guide](docs/USER_GUIDE.md)
- [Junior Developer Guide](docs/JUNIOR_DEVELOPER_GUIDE.md)
- [GitHub and Publishing Guide](docs/GITHUB_WORKFLOW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Code Map](docs/CODE_MAP.md)
- [QA Guide](docs/QA_GUIDE.md)

## Quick Start

```bash
npm install
npm run dev
```

Then open the local Vite URL.

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Sync mobile projects:

```bash
npx cap sync
```

Open Android:

```bash
npx cap open android
```

Open iOS:

```bash
npx cap open ios
```

## Question Schema

Each bank uses language keys such as `en` and `es`:

```json
{
  "en": [
    {
      "id": "sample-001",
      "category": "module_1",
      "block_id": 1,
      "block_name": "Topic name",
      "difficulty": "beginner",
      "tags": ["tag-one", "tag-two"],
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Teaching explanation."
    }
  ],
  "es": []
}
```

Supported difficulty values are `beginner`, `intermediate`, and `advanced`. The app also supports `correct_answers` for questions with more than one accepted answer.

## Local-First Privacy

SmartQuiz does not send attempts or question banks to a server. User data lives in browser or native WebView storage. Full backups can be exported manually from Settings.

## License

MIT. See [LICENSE](LICENSE).
