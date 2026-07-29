# Troubleshooting

## Blank Page After Deploy

1. Run `npm run build`.
2. Confirm `dist/index.html` exists.
3. Confirm `dist/404.html` exists.
4. Confirm `homepage` in `package.json`.
5. Re-run `npm run deploy`.

## Custom Domain Does Not Work

1. Confirm `public/CNAME` contains:

```text
smartquiz.innovalogic.tech
```

2. Confirm the file is plain text, not UTF-16.
3. Confirm GitHub Pages custom domain settings.
4. Wait for DNS propagation if recently changed.

## User Progress Looks Wrong

1. Confirm the active bank.
2. Check whether a different browser/profile is being used.
3. Restore a full backup if available.
4. Avoid clearing storage until a backup is exported.

## Import Fails

1. Validate that the JSON is well formed.
2. Confirm required fields: question, options, correct answer and explanation.
3. Try a small sample bank first.
4. Check browser console for validation details.

## Mobile Sync Problems

1. Run `npm run build`.
2. Run `npx cap sync`.
3. Open Android or iOS from the matching script.
4. Rebuild in the native IDE.

