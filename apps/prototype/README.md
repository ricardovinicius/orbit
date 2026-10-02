# Orbit Prototype

Next.js foundation for Orbit's non-functional UI prototype. Future screens use static mock data only; no backend, authentication, persistence, or business logic.

## Development

Requires Node.js 20.9+ and pnpm (the package manager version is pinned in `package.json`).

From this directory:

```sh
pnpm install
pnpm dev
```

The development server runs at http://localhost:3000. No pages are implemented yet, so the root URL currently returns Next.js's default 404.

```sh
pnpm lint
pnpm build
pnpm start
```

`pnpm start` serves the production build after `pnpm build`.

## Foundation

- Next.js App Router and TypeScript with strict checking.
- Tailwind CSS and ESLint.
- `src/app/layout.tsx` provides the shared document shell.
- `src/app/globals.css` imports Tailwind.
- `@/*` imports resolve to `src/*`.

Read [the design instructions](../../docs/DESIGN.md) before implementing screens. Use shadcn components when adding UI. Add mock fixtures alongside future screens as needed.
