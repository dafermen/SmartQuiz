# Test Layout

This folder contains the automated quality suites for SmartQuiz.

```text
test/
  unit/
  integration/
  contract/
  e2e/
  fixtures/
```

See `docs/TESTING.md` for the required deployment test strategy.

Current executable suites:

- `unit/`: Vitest unit, contract and fast-check property tests.
- `e2e/`: Playwright smoke tests for desktop and mobile emulation.

Run `npm test`, `npm run test:coverage`, or `npm run test:e2e` from the repository root.
