# Code Map

## App Shell

- `src/main.jsx`: React entry point.
- `src/App.jsx`: top-level app component.
- `src/pages/index.jsx`: router and lazy page loading.
- `src/pages/Layout.jsx`: header, drawer navigation, language switcher, footer.
- `src/components/brand/brand.js`: shared product constants.

## Pages

- `src/pages/Home.jsx`: dashboard, module cards, and project use cases.
- `src/pages/Theory.jsx`: study mode using question explanations.
- `src/pages/Quiz.jsx`: randomized test generation, scoring, attempt persistence, and gamification updates.
- `src/pages/Progress.jsx`: learning level, saved attempt metrics, category performance, question review insights, and chart.
- `src/pages/Settings.jsx`: local limits and counter reset.

## Data

- `src/components/data/cybersecurityAwarenessQuestions.json`: sample cybersecurity awareness bank.
- `src/components/data/index.jsx`: question bank adapter and optional video hook.
- `src/components/data/questionBankStorage.js`: local customization storage, normalization, and import/export support helpers.
- `src/components/profile/examProfileStorage.js`: editable exam profile, module labels, passing score, quiz length, and defaults.
- `src/components/gamification/gamification.js`: XP, level, reward calculation, and local gamification profile storage.

## State And Persistence

- `smartquiz_language`: selected UI/data language.
- `quiz_attempts`: completed quiz attempts used by Progress.
- `user_quiz_settings`: category limits and taken counters used by Home, Quiz, and Settings.
- `smartquiz_question_bank_customizations`: local question bank edits used by Home, Theory, Quiz, and Settings.
- `smartquiz_gamification_profile`: XP, level, and quiz reward totals used by Quiz and Progress.
- `smartquiz_exam_profile`: editable exam profile used by Layout, Home, Theory, Quiz, Progress, and Settings.

## Components

- `src/components/quiz/CategoryCard.jsx`: module cards.
- `src/components/quiz/QuestionCard.jsx`: interactive question and feedback.
- `src/components/quiz/ResultsCard.jsx`: emotional result summary, XP reward, level progress, and celebration animation.
- `src/components/quiz/TestLimitBadge.jsx`: local limit indicator.
- `src/components/settings/QuestionBankManager.jsx`: local question CRUD, base overrides, delete, import, export, and reset.
- `src/components/theory/TheoryCard.jsx`: study card with explanation.
- `src/components/language/LanguageProvider.jsx`: English/Spanish strings and language state.
- `src/components/ui/*`: reusable UI primitives.

## Styling

- `src/index.css`: Tailwind base and design tokens.
- `src/App.css`: app-level styles.
- `tailwind.config.js`: Tailwind configuration.

## Best Places To Customize

- New brand name: `src/components/brand/brand.js`.
- New app/profile copy: Settings UI or `src/components/profile/examProfileStorage.js`.
- New categories: update the question bank categories and `src/components/profile/examProfileStorage.js`.
- New translations: `src/components/language/LanguageProvider.jsx`.
- Gamification tuning: `src/components/gamification/gamification.js`.
- New visual identity: `src/index.css`, `src/pages/Layout.jsx`, and `src/pages/Home.jsx`.
- Question editing workflow: `src/components/settings/QuestionBankManager.jsx`.
