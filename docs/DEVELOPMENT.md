# Development

## Local Setup

Requirements:

- Node.js 20 or newer.
- npm.

```bash
npm install
npm run dev
```

The Vite development server prints the local URL when it starts.

## Main Scripts

```bash
npm run dev
npm run lint
npm run validate:schema
npm test
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
4. Run `npm run validate:schema` when touching banks, imports, backups or storage.
5. Run `npm run lint`.
6. Run `npm run build`.
7. Update `CURRENT_STATUS.md` if the phase or known risks changed.

## Documentation Site

The navigable documentation experience is generated from the Markdown files in the repository.

```bash
npm run docs:build
```

This writes static files to `public/docs/`. The normal production build runs this step automatically, so GitHub Pages receives `/docs/` together with the app.

When adding, renaming or removing documentation files, update `scripts/build-docs-site.js` so the sidebar, search index and previous/next links stay accurate. Do not create empty placeholder pages in the docs site.
