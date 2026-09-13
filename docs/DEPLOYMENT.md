# Deployment

SmartQuiz is deployed as a static Vite build to GitHub Pages.

Production URL:

```text
https://smartquiz.innovalogic.tech/
```

## Production Topology

- Hosting: GitHub Pages from the repository `gh-pages` branch.
- Custom domain: `smartquiz.innovalogic.tech`.
- DNS: the subdomain is a CNAME to `dafermen.github.io`.
- Backend: none. SmartQuiz is a client-side, local-first application.
- Docker: not used and not required for the current architecture.
- SSH server: not part of the SmartQuiz production path while DNS points to GitHub Pages.

Do not copy the build to an unrelated SSH server unless the DNS and hosting architecture are intentionally migrated first.

## Build

```bash
npm run build
```

To refresh the real screenshots used by the documentation, start the app on port `5172` and run:

```bash
npm run docs:screenshots
```

The build regenerates the static documentation site and creates `dist/404.html` for GitHub Pages SPA fallback.

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
- [ ] `npm run test:coverage` passed.
- [ ] `npm run test:e2e` passed on desktop and mobile emulation.
- [ ] Import/export touched? Validate malformed and valid JSON.
- [ ] Storage touched? Validate bank scoping and backup restore.
- [ ] Mobile touched? Run Capacitor sync and device smoke test.
- [ ] Offline touched? Validate service worker behavior.
- [ ] `npm run lint` passed.
- [ ] `npm run security:audit` passed.
- [ ] `npm run build` passed.
- [ ] Open /docs/ in the build or preview server and confirm the sidebar, search, theme toggle and back-to-app link work.
- [ ] `public/CNAME` contains `smartquiz.innovalogic.tech` as plain text.
- [ ] `package.json` has `homepage`, `predeploy` and `deploy`.

## Post-Deployment Checks

- [ ] Open https://smartquiz.innovalogic.tech/.
- [ ] Open https://smartquiz.innovalogic.tech/docs/.
- [ ] Hard-refresh the page.
- [ ] Open a nested route and refresh to confirm SPA fallback.
- [ ] Start a quiz.
- [ ] Open Settings and confirm bank manager loads.
- [ ] Export a backup.


