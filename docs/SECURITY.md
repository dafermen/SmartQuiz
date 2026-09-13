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
npm run security:audit
```

The audit includes runtime and development dependencies and fails on high-severity findings. Dependabot, dependency review and a scheduled GitHub Actions audit provide repository-level follow-up.

Validated on 2026-09-13: `npm audit` reported zero known vulnerabilities after compatible dependency updates.

## Security Before Deployment

- [ ] Import validation reviewed if touched.
- [ ] Backup restore reviewed if touched.
- [ ] No secrets committed.
- [ ] `.env.example` documents expected variables without real values.
- [ ] `npm run security:audit` passes.
- [ ] Service worker behavior checked when caching changes.
