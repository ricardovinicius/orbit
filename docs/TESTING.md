# Testing

Use unit tests for business rules and integration tests for backend behavior. Keep E2E tests focused on critical user journeys.

## E2E

Use Playwright in `apps/web`, organized by workflow:

```text
apps/web/
├── e2e/
│   ├── auth.setup.ts
│   ├── projects.spec.ts
│   ├── planning.spec.ts
│   ├── sessions.spec.ts
│   ├── fixtures/
│   └── helpers/
└── playwright.config.ts
```

- Test flows such as creating a project, planning a task, and recording a session.
- Keep tests independent, with their own data and a dedicated test database.
- Use the real backend. Prepare data through APIs or database helpers.
- Reuse authenticated sessions; use separate accounts when tests could affect each other.
- Select elements by accessible role or label and assert visible outcomes.
- Extract helpers when interactions repeat.
- Keep prototype navigation and visual checks separate from application E2E tests.

## CI

- On pull requests: run lint, type checking, unit tests, and a small E2E suite against a production build.
- On scheduled runs: run broader browser and mobile coverage.
- Keep traces, screenshots, and reports for failed E2E tests.

This is the planned setup; Playwright is not installed yet.

References: [Next.js setup](https://nextjs.org/docs/app/guides/testing/playwright), [Playwright best practices](https://playwright.dev/docs/best-practices).
