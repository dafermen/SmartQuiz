# AGENTS.md

## Mandatory Context

SmartQuiz lives at `C:\Projects\SmartQuiz`.

Repository:

```text
https://github.com/dafermen/SmartQuiz.git
```

Public demo:

```text
https://smartquiz.innovalogic.tech/
```

## First Steps For Future Codex Sessions

1. Read `CURRENT_STATUS.md`.
2. Read this file.
3. Run `git status -sb`.
4. Inspect existing docs before creating new docs.
5. Preserve local-first behavior unless the user explicitly approves a backend.

## Validation Rules

Before deployment:

- Run `npm run lint`.
- Run `npm run build`.
- Review `docs/TESTING.md`.
- Review `docs/DEPLOYMENT.md`.

If touching mobile:

- Run `npm run cap:sync`.
- Smoke test Android/iOS as applicable.

If touching imports/backups/storage:

- Validate normal, malformed and large JSON inputs.
- Confirm progress remains scoped to the active bank.

## Documentation Rules

Update documentation when changing:

- bank schema;
- import/export;
- backup/restore;
- quiz/exam behavior;
- mobile/offline behavior;
- deployment;
- security assumptions;
- test strategy.

## Do Not

- Do not clear user storage without an export/backup path.
- Do not mix progress between banks.
- Do not copy proprietary question banks without permission.
- Do not deploy without build validation.

