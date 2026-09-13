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
- Full local backup JSON with catalog, bank-scoped progress, profile/theme data, preferences and a content summary.

Full-backup creation, validation and transactional restore live in:

```txt
src/components/data/fullBackupStorage.js
```

Android and iOS use the native share sheet for exported JSON. Web uses a normal file download.

## Executable Schemas

Runtime and CI schema contracts live in:

```txt
src/components/data/questionBankSchemas.js
```

The current contracts validate:

- individual question records;
- language maps such as `en` and `es`;
- question-bank imports;
- persisted catalog shape;
- full backup JSON.

Run:

```bash
npm run validate:schema
```

This validates bundled banks, answer indexes, duplicate ids, import shapes and full-backup shape.

## Future API Notes

If a backend is added later, document:

- authentication model;
- request and response schemas;
- versioning strategy;
- migration path for existing local-first users;
- offline behavior when the backend is unavailable.

See `docs/adr/0002-optional-cloud-sync.md` for the proposed opt-in synchronization boundary.
