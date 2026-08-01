# CURRENT_STATUS.md

Last updated: 2026-08-01

## Current Phase

Documentation navigation standardization phase.

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

## Validation Completed

Completed on 2026-07-31:

```bash
npm run validate:schema
npm run lint
npm run build
```

Completed on 2026-08-01:

```bash
npm run docs:build
```

Pending for this documentation phase before release:

```bash
npm run validate:schema
npm test
npm run lint
npm run build
```

Recommended before a full release:

- Complete the deployment checklist in `docs/DEPLOYMENT.md`.
- Complete the remaining test matrix in `docs/TESTING.md`.
- Add browser-level automated coverage for settings, import/export, backup and bank-scoped storage.
- Verify `/docs/`, `/docs/architecture.html`, docs CSS and docs JavaScript from the production build or preview server.

## Next Steps

1. Add Vitest unit tests around storage/import/export helper modules.
2. Add Playwright smoke tests for quiz, settings, backup export and `/docs/` navigation.
3. Add fuzz cases for malformed banks and backups.
4. Add dependency/security automation to CI.
5. Decide whether mobile builds need their own CI workflow.
