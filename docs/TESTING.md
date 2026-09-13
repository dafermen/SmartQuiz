# Testing Strategy

SmartQuiz must be validated before every deployment. The automated baseline now includes schema contracts, Vitest unit/property tests, coverage thresholds, Playwright browser tests, lint, dependency audit and production build.

## Automated Baseline

- 24 unit, property and contract checks across six files.
- Fast-check generated cases for answer indexes, option collections and normalization invariants.
- Coverage floor: 58% statements, 52% branches, 65% functions and 60% lines across critical data, backup, scoring, profile and theme modules.
- Eight Playwright checks across desktop Chromium and Pixel 7 emulation.
- Browser coverage for Home, Settings, the bank administrator, documentation, full-backup export and full-backup restore.
- GitHub Actions workflows for CI, dependency review, scheduled security audit, Android APK build and iOS simulator build.

## Required Before Deployment

1. **Acceptance tests**
   - Confirm the main user flows work: select bank, study, quiz, exam simulator, flashcards, favorites, missed questions, settings, import/export, backup and restore.

2. **Unit tests**
   - Cover pure functions for scoring, normalization, storage scoping, bank import/export, themes, XP and progress calculations.

3. **Property and invariant tests**
   - Verify invariants such as stable question keys, no progress leakage across banks, score within `0..100`, and backup restore preserving required collections.
   - Current automated coverage: Vitest and fast-check verify generated answer bounds, stable keys, four-option normalization, XP ranges and bank-scoped storage.

4. **Mutation testing**
   - Target scoring, answer checking, question normalization and import validation once unit coverage is mature.

5. **Fuzzing**
   - Current automated coverage includes malformed JSON, empty banks and generated invalid answer indexes. Large files, simple-line imports and duplicate-id fuzzing remain pending.

6. **Integration tests**
   - Validate page-level flows that combine catalog, active bank, storage, quiz attempts and progress dashboard.

7. **Contract tests**
   - Validate accepted question-bank schema, full-backup schema and any future API schema.
   - Current automated coverage: `src/components/data/questionBankSchemas.js` defines executable Zod contracts for question-bank imports, catalogs and full backups.

8. **End-to-end tests**
   - Run browser flows for Home, Theory, Quiz, Exam, Settings, bank manager, import/export and offline reload.

9. **Regression tests**
   - Add a test for each fixed production bug or previously broken workflow.

10. **Security tests**
   - Check dependency audit, unsafe HTML rendering, import sanitization, service worker scope, and local-storage handling.

11. **Concurrency and resilience**
   - Validate repeated imports, rapid bank switching, multiple tabs, offline/online transitions and interrupted backup restore.

12. **Performance and resources**
   - Check bundle size, initial load, large banks, dashboard rendering, mobile memory and service-worker cache behavior.

13. **Compatibility and deployment**
   - Validate GitHub Pages build, SPA fallback, custom domain CNAME, PWA installability, Android Capacitor sync and iOS Capacitor sync.

## Current Commands

```bash
npm run lint
npm run validate:schema
npm test
npm run test:coverage
npm run test:e2e
npm run security:audit
npm run build
npm run preview
npm run deploy
```

## Deployment Gate

Do not deploy until:

- critical acceptance flows pass manually or through automation;
- `npm run test:coverage` passes;
- `npm run test:e2e` passes;
- `npm run lint` passes;
- `npm run security:audit` passes;
- `npm run build` passes;
- import/export and backup behavior has been checked if touched;
- `docs/DEPLOYMENT.md` checklist is complete.
