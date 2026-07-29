# Operations

SmartQuiz has no production server to operate. Operations focus on static hosting, local data safety, PWA behavior and mobile packaging.

## Runtime Dependencies

- GitHub Pages for web hosting.
- Browser storage or native WebView storage for user data.
- Service worker for offline assets.
- Capacitor projects for Android and iOS packaging.

## Routine Checks

- Verify the public URL after each deploy.
- Check that the custom domain still resolves.
- Confirm GitHub Pages branch `gh-pages` was updated.
- Smoke test backup export and bank switching.
- Smoke test mobile projects after dependency updates.

## Incident Response

If the web app is unavailable:

1. Check GitHub Pages status and the `gh-pages` branch.
2. Verify `public/CNAME`.
3. Run `npm run build` locally.
4. Re-run `npm run deploy`.
5. Validate the public URL after propagation.

If user data appears missing:

1. Confirm the active bank.
2. Check whether the browser/site storage was cleared.
3. Restore from full backup JSON if available.
4. Avoid destructive storage reset until the user exports a backup.

