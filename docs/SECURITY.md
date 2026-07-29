# Security

SmartQuiz is local-first and does not send quiz attempts or custom banks to a backend.

## Main Risks

- Malformed or malicious imported JSON.
- Unsafe rendering of imported text.
- Local data loss through browser storage clearing.
- Dependency vulnerabilities.
- Service worker caching stale assets.
- Mobile permission misuse.

## Required Practices

- Treat imported banks and backups as untrusted input.
- Render question content as text unless a feature explicitly sanitizes rich content.
- Validate answer indexes and required fields.
- Keep backups user-controlled.
- Run dependency review before releases.
- Request only mobile permissions required by active features.

## Current Security Commands

```bash
npm audit --omit=dev
```

Use full `npm audit` when changing dependencies.

## Security Before Deployment

- [ ] Import validation reviewed if touched.
- [ ] Backup restore reviewed if touched.
- [ ] No secrets committed.
- [ ] `.env.example` documents expected variables without real values.
- [ ] Dependencies reviewed.
- [ ] Service worker behavior checked when caching changes.

