# ADR 0002: Optional Cloud Sync Boundary

## Status

Proposed. No backend or user account system is currently implemented.

## Context

SmartQuiz is local-first and works without a network connection. Users can now move all banks, progress, themes, limits, XP and preferences through a validated full-backup JSON file and the native Android/iOS share sheet.

Automatic synchronization would improve multi-device use, but it also introduces authentication, privacy, operational cost, conflict resolution and data-migration responsibilities.

## Proposed Decision

Keep local storage as the offline source of truth. Any future backend must be optional and must synchronize versioned backup-shaped records through an adapter rather than coupling pages directly to a vendor SDK.

Required boundaries:

- SmartQuiz remains fully usable without an account.
- Existing local data is never overwritten until a remote payload passes the same schemas used by manual restore.
- Sync is explicit during the first release and shows the last successful synchronization time.
- Conflicts are resolved per bank and scoped record, with a user-visible choice when both sides changed.
- Transport encryption, encryption at rest, account deletion and data export are mandatory.
- Provider credentials and administrative secrets never ship in the frontend bundle.

## Delivery Sequence

1. Portable manual backup and native sharing. Completed.
2. Define a `SyncProvider` interface and local mock without network access.
3. Select an authentication and storage provider after privacy and cost review.
4. Add opt-in account linking and encrypted remote backup.
5. Add conflict detection, recovery history and multi-device acceptance tests.

## Consequences

Positive:

- Offline behavior and GitHub Pages deployment remain intact.
- A future provider can be replaced without rewriting quiz pages.
- Manual backups remain a recovery path even if cloud service is unavailable.

Tradeoffs:

- Automatic synchronization is deferred until the provider and privacy model are explicitly approved.
- A backend deployment, monitoring and incident-response plan will be required before enabling accounts.
