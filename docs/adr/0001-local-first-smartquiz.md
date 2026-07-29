# ADR 0001: Local-First SmartQuiz

## Status

Accepted

## Context

SmartQuiz supports multiple personal question banks, offline study, progress tracking, themes and mobile packaging. The app does not currently require centralized accounts or server-side persistence.

## Decision

Keep SmartQuiz local-first. Store banks, progress, themes, XP, favorites, missed questions and backups in browser or native WebView storage.

## Consequences

Positive:

- Works without a backend.
- Supports offline usage.
- Keeps personal study data private by default.
- Simplifies GitHub Pages deployment.

Tradeoffs:

- Users must manage backups when switching devices or browsers.
- Cross-device sync requires a future architecture decision.
- Browser storage clearing can remove local progress.

