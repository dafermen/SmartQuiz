# CURRENT_STATUS.md

Last updated: 2026-09-13

## Current Phase

Quality automation and release-hardening phase.

## Completed

- SmartQuiz web app is deployed at `https://smartquiz.innovalogic.tech/`.
- GitHub Pages deploy uses `npm run deploy`.
- `package.json` includes `homepage`, `predeploy` and `deploy`.
- `public/CNAME` points to `smartquiz.innovalogic.tech`.
- Existing docs include user, architecture, code map, GitHub workflow, QA and junior developer guides.
- Added standard documentation structure:
  - development;
  - API/local interfaces;
  - testing strategy;
  - deployment;
  - operations;
  - security;
  - troubleshooting;
  - ADR.
- Added GitHub templates and CI workflow.
- Added `AGENTS.md` for future Codex sessions.
- Added executable Zod schemas for question-bank imports, catalogs and full backups.
- Added `npm run validate:schema` and `npm test` as the first automated contract/invariant validation layer.
- Updated CI to run schema validation before build.
- Added a generated static documentation site under `/docs/` using the existing Markdown files as source.
- Added `npm run docs:build` and wired `npm run build` to regenerate docs before the Vite build.
- Added visible app navigation to `/docs/` from the header and side drawer.
- Restored repository governance files (`AGENTS.md`, `CURRENT_STATUS.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, and `THIRD_PARTY_LICENSES.md`) to the repository root after an accidental local move.
- Added `npm start` as the single command for running the complete local application at `http://127.0.0.1:5172/`.
- Added Vitest, jsdom and fast-check with 24 passing unit, contract and property tests.
- Added enforced coverage floors for critical storage, schema, backup, gamification, profile and theme modules.
- Added Playwright with eight passing flows across desktop Chromium and Pixel 7 emulation.
- Added tested full-backup export/restore and native Android/iOS JSON sharing.
- Added scheduled security audit, dependency review and Dependabot configuration; local audit reports zero known vulnerabilities.
- Added Android and iOS GitHub Actions workflows. Android unit tests and debug APK assembly pass locally.
- Added reproducible screenshots of the real desktop and mobile application to the README and end-user guide. Refresh them with `npm run docs:screenshots` while the app is running on port `5172`.
- Confirmed that production DNS points to GitHub Pages; SmartQuiz does not currently require Docker or an SSH server deployment.
- Added ADR 0002 for a future opt-in cloud-sync boundary; no backend is implemented.

## Validation Completed

Completed on 2026-07-31:

```bash
npm run validate:schema
npm run lint
npm run build
```

Completed on 2026-09-13:

```bash
npm run test:coverage
npm run test:e2e:only
npm run lint
npm run security:audit
npm run build
npm run docs:screenshots
npx cap sync android
android/gradlew testDebugUnitTest assembleDebug
```

Recommended before a full release:

- Complete the deployment checklist in `docs/DEPLOYMENT.md`.
- Review the first Android and iOS workflow runs after pushing this phase.
- Perform physical-device smoke tests for native sharing and notifications.
- Configure signed Android/iOS release builds before store publication.

## Next Steps

1. Raise critical-module coverage toward 75%, prioritizing theme persistence and gamification updates.
2. Add fuzz cases for large backups, duplicate IDs and simple-line imports.
3. Add complete quiz/exam/offline Playwright scenarios and accessibility checks.
4. Review mobile CI results and add signed release workflows when store credentials are available.
5. Select a cloud provider only after explicit approval of ADR 0002, privacy requirements and operating cost.
