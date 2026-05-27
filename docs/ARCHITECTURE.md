# SmartQuiz Architecture

SmartQuiz is a client-only React/Vite app. It reads localized question data from JSON, renders study and quiz flows, and stores progress in `localStorage`. There is no backend dependency, which keeps the project easy to publish, fork, and customize.

## Runtime Flow

1. `src/main.jsx` mounts React.
2. `src/App.jsx` renders routes and the global toaster.
3. `src/pages/index.jsx` defines lazy-loaded pages.
4. `src/pages/Layout.jsx` provides the app shell, navigation, and language switcher.
5. Pages load question data through `getQuestionsData()`.
6. UI copy and quiz rules can be customized through the local exam profile.

## Data

The sample bank lives at:

- `src/components/data/cybersecurityAwarenessQuestions.json`

The adapter lives at:

- `src/components/data/index.jsx`

Each question has:

- `id`
- `category`
- `block_id`
- `block_name`
- `difficulty`
- `tags`
- `question`
- `options`
- `correct_answer`
- `explanation`

The adapter normalizes optional metadata and adds a stable `question_key` for randomized tests, progress analytics, and language switching.

## Exam Profile

The editable exam profile lives in:

- `src/components/profile/examProfileStorage.js`

At runtime, profile edits are stored in:

- `smartquiz_exam_profile`

The profile controls app name, subtitle, hero copy, domain label, module labels/descriptions, passing score, quiz length, and category defaults. This keeps the visual interface reusable across domains while preserving generic category ids (`module_1`, `module_2`, `module_3`) for analytics and question matching.

## Quiz Behavior

- `Quiz.jsx` reads `?category=...` from the URL.
- Category tests filter the question bank by `category`.
- Mixed practice uses the full active language bank.
- Each selected test generates the configured number of randomized question keys.
- Smaller category banks can repeat questions, which keeps every module usable.
- Completed attempts are saved to `quiz_attempts` with score, timing, pass/fail state, and per-question answer details.
- Each completed quiz also updates local XP and level progress through the gamification layer.

## Local Storage

SmartQuiz uses browser storage only:

- `smartquiz_language`: selected language.
- `quiz_attempts`: completed attempts, scores, pass status, and time.
- `user_quiz_settings`: per-module limits and counters.
- `smartquiz_question_bank_customizations`: local question additions, edits, deletions, imports, and exports.
- `smartquiz_gamification_profile`: total XP, level, completed quizzes, passed quizzes, and perfect scores.
- `smartquiz_exam_profile`: app branding, module labels, passing score, and quiz length.
- `smartquiz_theme`: brand colors applied through CSS variables.

No private credentials, access codes, or backend secrets are required.

## Main Pages

- `Home`: module cards, summary stats, and use-case ideas.
- `Theory`: searchable study view backed by question explanations.
- `Quiz`: randomized test flow with scoring and feedback.
- `Progress`: learning level, chart, category performance, per-question review insights, and recent attempt history.
- `Settings`: local test limit, counter management, and question bank editing.

## Gamification

Gamification is intentionally local and optional. `src/components/gamification/gamification.js` calculates XP from quiz completion, correct answers, difficulty bonuses, passing, high scores, and perfect scores. The result screen displays the attempt reward, level progress, and lightweight celebration animation. Progress reads the same profile to show the current learning level.

## Question Bank Customization Layer

The bundled JSON file remains read-only at runtime. User edits are stored as a local customization layer:

- `customQuestions`: new user-created questions by language.
- `questionOverrides`: edits to bundled base questions by language and question id.
- `deletedQuestionKeys`: locally hidden question keys.

`getQuestionsData()` loads the bundled bank, applies deletions, applies overrides, and appends custom questions. This keeps the app static-hosting friendly while allowing rich editing in the browser.

## Customization Path

1. Add or replace a JSON question bank using generic module ids.
2. Update the exam profile defaults in `src/components/profile/examProfileStorage.js`, or edit labels directly in Settings.
3. Extend `LanguageProvider.jsx` and `SUPPORTED_QUESTION_LANGUAGES` when adding a new UI/content language such as French.
4. Optionally adjust colors, app name, and documentation.
5. Use Settings to create/export local question packs without editing source files.

## Publishing Notes

- `node_modules/` and `dist/` are ignored by git.
- The app contains no private email, access code, legacy exam asset, or proprietary brand dependency.
- Run `npm run build`, `npm run lint`, and the checks in `docs/QA_GUIDE.md` before publishing.
