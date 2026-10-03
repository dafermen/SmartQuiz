# CURRENT_STATUS.md

## Documentation web navigation v1 — local candidate, 2026-10-03

InnovaLogic documentation theme, reading paths and reading controls are implemented. Production build and browser at 1440 and 390 px PASS, including the final compact mobile header. The existing dependency audit gate remains failed. See [navigation maintenance and evidence](docs/WEB_NAVIGATION.md). GitHub and server delivery of this revision are pending; earlier deployment status below remains historical evidence.

Last updated: 2026-10-03

## Documentation delivery checkpoint — 2026-10-03

- The generated portal includes the canonical documentation map at `/docs/documentation-map.html`; internal status navigation was checked on desktop and mobile.
- Local validation: lint PASS; 24 unit/property/contract tests and coverage floors PASS; production build PASS; all 8 Playwright checks PASS. The map also passed at 1440px and 390px with its status link resolving, no JavaScript errors and no horizontal overflow.
- Compatible brace-expansion patches were applied in the lockfile. The complete dependency audit still reports 7 high entries caused by one braces advisory (GHSA-vfj7-8cjw-p6xm), affecting build/deployment tools. npm reports braces 3.0.3 as latest; its proposed Tailwind 4 migration is outside this documentation change. The former zero-alert result below is historical.
- Publication of source documentation and deployment of `/docs/` are tracked separately. The prepared documentation candidate has not been deployed. The security gate remains failed; no full application release or mobile package is approved by this checkpoint.
- Next: resolve the build-tool advisory or obtain an explicit, documentation-only delivery exception before publishing static `/docs/` assets. Preserve the existing application assets and CNAME if that scoped delivery is authorized.

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
- Standardized CI, Android, iOS, and security workflows on Node.js 22 to satisfy the Capacitor 8 runtime requirement.
- Updated official GitHub Actions to supported Node.js 24-based releases; Android and iOS workflows now run when their own definitions change.
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

## DOC-STD-20261002 — Organización documental

El [mapa documental](docs/README.md) identifica fuentes canónicas y reglas de mantenimiento. Se conservan los hitos de implementación y la aceptación pendiente. Esta entrega documental registra validación y publicación por separado.
