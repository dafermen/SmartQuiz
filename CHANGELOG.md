# Changelog

All notable changes to SmartQuiz should be documented here.

## Unreleased

- Added reproducible desktop and mobile screenshots from the real application.
- Added an illustrated application tour to the end-user guide and README.
- Documented the GitHub Pages production topology, DNS destination, and why Docker or SSH deployment is not currently required.
- Added 24 Vitest unit, contract and property tests with enforced coverage floors.
- Added eight Playwright flows for desktop and mobile emulation, including portable backup export and restore.
- Rejected empty direct-language question-bank imports through the executable schema.
- Added transactional full-backup helpers and native Android/iOS JSON sharing.
- Updated compatible dependencies and reduced `npm audit` findings to zero.
- Added CI coverage, browser tests, dependency review, Dependabot, scheduled security audit, Android APK and iOS simulator workflows.
- Added ADR 0002 for a future optional cloud-sync boundary without changing the local-first architecture.
- Restored governance and continuity documents to their canonical repository-root locations.
- Added `npm start` to run the complete local application on port `5172`.
- Added standard repository documentation structure.
- Added GitHub issue templates, pull request template and CI workflow.
- Added deployment, operations, security and troubleshooting docs.
- Added `AGENTS.md` and `CURRENT_STATUS.md` for future Codex continuity.
## 2026-08-01

- Added a generated documentation site under `/docs/` using the repository Markdown files as source.
- Added `npm run docs:build` and made production builds regenerate the docs site before Vite builds the app.
- Added visible in-app access to documentation from the header and side drawer.

