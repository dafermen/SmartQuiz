# GitHub And Publishing Guide

This guide explains how to work with SmartQuiz on GitHub.

## Repository

Current repository:

```txt
https://github.com/dafermen/SmartQuiz.git
```

Local project path used during development:

```txt
C:\Projects\SmartQuiz
```

## Recommended Branch Flow

For normal work:

```bash
git checkout main
git pull
git checkout -b codex/short-description
```

After changes:

```bash
npm run lint
npm run build
npx cap sync
git status
git add .
git commit -m "short description"
git push -u origin codex/short-description
```

Then open a pull request on GitHub.

## Direct Main Updates

For a personal project, you may push directly to `main` if that is your preferred workflow.

Before pushing:

```bash
npm run lint
npm run build
npx cap sync
git status
```

Then:

```bash
git add .
git commit -m "Update SmartQuiz platform"
git push origin main
```

## What Should Be Committed

Commit:

- `src/`
- `docs/`
- `public/`
- `scripts/`
- `package.json`
- `package-lock.json`
- `capacitor.config.json`
- `android/`
- `ios/`

Do not commit:

- `node_modules/`
- `dist/`
- local editor files.
- private keys.
- signing certificates.
- generated release APK/AAB/IPA files unless intentionally publishing them.

## GitHub README Checklist

README should explain:

- What SmartQuiz is.
- How to run it.
- How to build it.
- How to sync Capacitor.
- Main features.
- Documentation links.
- License.

## Pull Request Template

Use this structure:

```md
## Summary

- Added ...
- Updated ...
- Fixed ...

## Validation

- npm run lint
- npm run build
- npx cap sync

## Notes

- Any manual testing notes.
```

## GitHub Pages

SmartQuiz is a Vite app. If deploying to GitHub Pages, confirm the correct `base` path in `vite.config.js` if the app is served from a repository subpath.

This repository is configured for:

```txt
https://dafermen.github.io/SmartQuiz/
```

Publish with:

```bash
npm run deploy
```

The deploy script builds `dist`, creates `dist/404.html` for SPA route refresh support, and publishes the output to the `gh-pages` branch.

For a user/organization site at root, `/` is usually fine.

For a project page like:

```txt
https://username.github.io/SmartQuiz/
```

you may need:

```js
base: "/SmartQuiz/"
```

## Netlify Or Vercel

Build command:

```bash
npm run build
```

Publish directory:

```txt
dist
```

## Android Publishing Notes

Development command:

```bash
npx cap open android
```

Before release:

- Confirm app name and package ID.
- Confirm icons and splash screens.
- Confirm notification permission behavior.
- Create a release keystore.
- Configure signing in Android Studio.
- Build AAB for Play Store.

Do not commit private keystore files.

## iOS Publishing Notes

Development command:

```bash
npx cap open ios
```

Before release:

- Open in Xcode on macOS.
- Confirm bundle identifier.
- Confirm app icons and splash screens.
- Confirm notification permission behavior.
- Configure signing team.
- Archive and upload through Xcode.

## Versioning

Recommended version changes:

- Patch: bug fixes or documentation.
- Minor: new features such as new study modes or new banks.
- Major: breaking data format or app architecture changes.

Current `package.json` version can be updated before release.

## Security And Privacy Review

Before publishing publicly:

```bash
rg -n "password|secret|token|apikey|api_key|private|keystore" --glob "!node_modules/**" --glob "!dist/**"
```

Review any matches manually.

SmartQuiz is local-first and should not require secrets in the repo.

## Validation Commands

Use these for final checks:

```bash
npm run lint
npm run build
npm audit
npx cap sync
```
