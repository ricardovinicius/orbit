# Orbit Web

Application foundation initialized with the Next.js and shadcn CLIs. The generated Next.js starter page is retained; product screens and backend integration are not implemented yet.

## Development

Requires Node.js 20.9+ and pnpm. The package manager version is pinned in `package.json`.

From the repository root, run `make web` to install dependencies and start the server at http://localhost:3000. Use `make web-dev` for subsequent starts.

From this directory:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm start
```

`pnpm start` serves the production build after `pnpm build`. To run alongside the prototype, start one app on another port: `pnpm dev --port 3001`.

## Foundation

- Next.js App Router, strict TypeScript, Tailwind CSS v4, and ESLint.
- shadcn Radix Nova with neutral CSS variables and Lucide icons, matching the prototype's preset.
- Geist bundled locally so builds do not fetch fonts.
- `src/app` contains routes, the root layout, and global styles.
- `src/lib/utils.ts` exports shadcn's `cn` utility.
- `@/*` imports resolve to `src/*`.
- Independent dependencies and lockfile, like `apps/prototype`.

Add UI primitives when needed using `pnpm dlx shadcn@latest add` from this directory. Read the repository [design instructions](../../docs/DESIGN.md) before implementing screens.
