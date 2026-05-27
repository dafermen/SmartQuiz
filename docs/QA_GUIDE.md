# QA Guide

## Smoke Test

1. Run `npm install`.
2. Run `npm run dev`.
3. Open the Vite URL.
4. Confirm the header shows `SmartQuiz`.
5. Confirm the app opens directly without login or access code.
6. Switch language between EN and ES.

## Home

- Module cards appear for phishing awareness, malware basics, safe data habits, and mixed practice.
- Each card shows a question count and local test limit badge.
- The study card opens the theory page.

## Quiz

Validate each category:

- `module_1`
- `module_2`
- `module_3`
- `practice_quiz`

Expected behavior:

- The test picker opens.
- Questions render with four options.
- Submit shows correct/incorrect feedback and explanation.
- The final screen shows score, pass/fail status, and retry/home actions.
- The final screen awards XP, shows the current level, and celebrates passing or high scores.
- Completed tests appear in progress.

## Theory

- Category filter works.
- Topic filter works.
- Each card shows question text, category badge, difficulty, tags, and explanation.

## Progress

- Empty state appears before attempts.
- After a completed test, totals, pass rate, best score, average time, chart, and recent attempts update.
- Learning level and total XP appear after completing a quiz.
- Category performance shows accuracy and attempt counts by module.
- Per-question review cards appear after completing a new quiz attempt.

## Settings

- Edit the exam profile name, subtitle, passing score, and questions per test.
- Save the exam profile and confirm Home, Quiz, Progress, and the browser title reflect the update.
- Edit module labels/descriptions in EN/ES and confirm Home/Theory/Quiz/Progress use the new labels.
- Confirm Settings shows generic module names such as `Modulo 1` / `Module 1`, not cybersecurity-specific internal keys.
- Confirm the language note explains that the starter app currently ships with EN/ES content.
- Apply a Theme Studio preset and confirm header, module cards, buttons, charts, and preview colors update after saving.
- Change a single color manually, save, refresh the browser, and confirm the color persists.
- Restore the default theme and confirm the SmartQuiz palette returns.
- Restore the default exam profile and confirm the cybersecurity sample labels return.
- Limits save to local storage.
- Counters reset without deleting attempt history.
- Values clamp between 1 and 100.

## Question CRUD

- Create a new question and confirm it appears in the list.
- Use search to find the new question.
- Change rows per page and confirm pagination updates without losing filters.
- Move between pages and confirm the range indicator is correct.
- Edit the question text, options, correct answer, and explanation.
- Set difficulty and comma-separated tags, then confirm they appear in study mode and quiz questions.
- Confirm the editor opens in a side panel and closes after saving.
- Duplicate the question and confirm a second custom record appears.
- Delete one custom question and confirm it disappears.
- Edit a bundled base question and confirm it is marked as edited.
- Delete a bundled base question and confirm it is hidden locally.
- Export JSON and confirm it includes `customizations`.
- Import the exported JSON and confirm the question bank restores.
- Restore the sample bank and confirm local edits are removed.

## Question Bank Manager

- Add a new question in EN and confirm it appears in the list.
- Edit a base question and confirm its badge changes to edited base.
- Delete a custom question and confirm it disappears.
- Delete a base question and confirm it no longer appears in Theory/Quiz.
- Export JSON and confirm the downloaded file contains `customizations`.
- Paste the exported JSON into import and confirm questions restore.
- Restore the sample bank and confirm custom edits are removed.
- Switch to ES and repeat add/edit validation for Spanish content.

## Automated Checks

Run:

```bash
npm run build
npm run lint
```

Expected result:

- Build exits successfully.
- Lint exits successfully with no errors.

## Brand Check Before Publishing

Run:

```bash
rg -n "legacy-brand|private-email|private-apk|old-domain|old-exam-category" --glob '!node_modules/**' --glob '!dist/**'
```

Expected result: no matches.
