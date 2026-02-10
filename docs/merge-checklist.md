# Merge Checklist (P0)

This checklist is the minimum quality gate before merging into protected branches.

## 1. Local Pre-Merge Commands

Run in `apps/api`:

```bash
npm run lint
npm run build
npm run test
npm run test:cov
npm run test:e2e
```

Shortcut:

```bash
npm run gate:local:cov
```

## 2. Required CI Checks

The workflow `.github/workflows/api-quality-gate.yml` publishes these required checks:

- `api-lint`
- `api-build`
- `api-test`
- `api-test-cov`
- `api-test-e2e`

## 3. Coverage Guardrail

Coverage is locked in `apps/api/package.json` (Jest `coverageThreshold`):

- statements: `>= 10`
- branches: `>= 5`
- functions: `>= 5`
- lines: `>= 9`

Any pull request that drops below these thresholds must add tests or be rejected.

## 4. Branch Protection Setup (GitHub)

For each protected branch (for example `main`, `develop`):

1. Open `Settings` -> `Branches` -> `Add branch protection rule`.
2. Enable `Require a pull request before merging`.
3. Enable `Require status checks to pass before merging`.
4. Select required checks:
   - `api-lint`
   - `api-build`
   - `api-test`
   - `api-test-cov`
   - `api-test-e2e`
5. Enable `Require branches to be up to date before merging`.

## 5. Review Checklist

- [ ] Scope of change matches ticket/slice.
- [ ] No new TypeScript/ESLint errors.
- [ ] RBAC and authorization paths covered by tests when touched.
- [ ] API contract changes documented.
- [ ] Migration/seed impact reviewed when schema changed.
