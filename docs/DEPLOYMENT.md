# Deployment

SmartQuiz is deployed as a static Vite build to GitHub Pages.

Production URL:

```text
https://smartquiz.innovalogic.tech/
```

## Build

```bash
npm run build
```

The build also creates `dist/404.html` for GitHub Pages SPA fallback.

## GitHub Pages Deploy

```bash
npm run deploy
```

This runs:

```bash
npm run build
gh-pages -d dist
```

## Pre-Deployment Checklist

- [ ] Acceptance flows verified.
- [ ] Unit/property/invariant tests run or consciously marked pending.
- [ ] Import/export touched? Validate malformed and valid JSON.
- [ ] Storage touched? Validate bank scoping and backup restore.
- [ ] Mobile touched? Run Capacitor sync and device smoke test.
- [ ] Offline touched? Validate service worker behavior.
- [ ] `npm run lint` passed.
- [ ] `npm run build` passed.
- [ ] `public/CNAME` contains `smartquiz.innovalogic.tech` as plain text.
- [ ] `package.json` has `homepage`, `predeploy` and `deploy`.

## Post-Deployment Checks

- [ ] Open `https://smartquiz.innovalogic.tech/`.
- [ ] Hard-refresh the page.
- [ ] Open a nested route and refresh to confirm SPA fallback.
- [ ] Start a quiz.
- [ ] Open Settings and confirm bank manager loads.
- [ ] Export a backup.

