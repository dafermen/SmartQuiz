# API

SmartQuiz is currently a client-only application. There is no required backend API.

## Local Data Interfaces

The app uses browser or native WebView storage for:

- question bank catalog;
- active bank id;
- per-bank progress;
- quiz attempts;
- learning state;
- favorites and missed questions;
- gamification profile;
- theme/profile settings;
- full backups.

## Import And Export Interfaces

Supported user-facing import formats:

- SmartQuiz bank JSON.
- Full backup JSON.
- Simple line format:

```text
question|A|B|C|D|0|explanation|module_1|beginner|Topic
```

Supported export formats:

- Active bank JSON.
- Full local backup JSON.

## Future API Notes

If a backend is added later, document:

- authentication model;
- request and response schemas;
- versioning strategy;
- migration path for existing local-first users;
- offline behavior when the backend is unavailable.

