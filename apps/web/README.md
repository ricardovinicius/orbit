# Orbit Web

Application foundation initialized with the Next.js and shadcn CLIs. The generated Next.js starter page is retained; product screens and backend integration are not implemented yet.

## Development

Requires Node.js 24.15+ LTS or another version supported by `package.json`, and pnpm. The package manager version is pinned in `package.json`.

From the repository root, run `make web` to install dependencies and start the server at http://localhost:3000. Use `make web-dev` for subsequent starts.

From this directory:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

`pnpm start` serves the production build after `pnpm build`. To run alongside the prototype, start one app on another port: `pnpm dev --port 3001`.

Use `pnpm format` to format files, `pnpm check` to check linting, formatting, and imports, and `pnpm test:watch` when developing unit or component tests.

For E2E tests, install Chromium once with `pnpm exec playwright install chromium`, then run `pnpm test:e2e`. Playwright builds and starts the app on port 3100. Use `pnpm exec playwright install` and `pnpm test:e2e:all` for all configured browsers and mobile viewports.

Test tooling is configured; there are no committed test cases yet. Test commands report no tests until suites are added alongside product features.

## Foundation

- Next.js App Router, strict TypeScript with the native checker, Tailwind CSS v4, and Biome.
- Vitest and React Testing Library for unit and component tests; Playwright for E2E tests.
- shadcn Radix Nova with neutral CSS variables and Lucide icons, matching the prototype's preset.
- Geist bundled locally so builds do not fetch fonts.
- `src/app` contains routes, the root layout, and global styles.
- `src/lib/utils.ts` exports shadcn's `cn` utility.
- `@/*` imports resolve to `src/*`.
- Independent dependencies and lockfile, like `apps/prototype`.

Add UI primitives when needed using `pnpm dlx shadcn@latest add` from this directory. Read the repository [design instructions](../../docs/DESIGN.md) before implementing screens.
