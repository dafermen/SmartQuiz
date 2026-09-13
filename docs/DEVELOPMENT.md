# Development

## Local Setup

Requirements:

- Node.js 22 or newer. Capacitor 8 requires Node.js 22.
- npm.

```bash
npm install
npm start
```

The complete local application is available at `http://127.0.0.1:5172/`.
Use `npm run dev` only when you want Vite to select its default development address.

## Main Scripts

```bash
npm start
npm run dev
npm run lint
npm run validate:schema
npm test
npm run test:coverage
npm run test:e2e
npm run security:audit
npm run build
npm run preview
npm run deploy
```

Mobile sync:

```bash
npm run cap:sync
npm run cap:android
npm run cap:ios
```

## Development Rules

- Keep question banks valid JSON.
- Keep user progress local-first; do not add backend storage without an architecture update.
- Keep bank-specific progress scoped by active bank.
- Update documentation when changing user flows, bank schemas, mobile behavior, backup behavior, or deployment.
- Add tests when a change touches import/export, scoring, storage scoping, offline behavior, or mobile-specific code.

## Recommended Local Workflow

1. Create or select a focused branch.
2. Make a small change.
3. Run the narrowest relevant validation.
4. Run `npm test` when touching banks, imports, backups, scoring or storage.
5. Run `npm run test:coverage` to enforce the current coverage floor.
6. Run `npm run test:e2e` for user-facing flows.
7. Run `npm run lint` and `npm run security:audit`.
8. Run `npm run build`.
9. Update `CURRENT_STATUS.md` if the phase or known risks changed.

## Documentation Site

Refresh the real desktop and mobile screenshots while the app is running on port `5172`:

```bash
npm run docs:screenshots
```

The capture script writes source images to `docs/images/`. The documentation build copies them to `public/docs/images/`.

The navigable documentation experience is generated from the Markdown files in the repository.

```bash
npm run docs:build
```

This writes static files to `public/docs/`. The normal production build runs this step automatically, so GitHub Pages receives `/docs/` together with the app.

When adding, renaming or removing documentation files, update `scripts/build-docs-site.js` so the sidebar, search index and previous/next links stay accurate. Do not create empty placeholder pages in the docs site.
