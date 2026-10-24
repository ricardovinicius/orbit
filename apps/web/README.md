# Orbit Web

Orbit uses Next.js, shadcn, and Supabase. Sign in with Google to access your private workspace and basic profile. Planning screens are still under development.

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

For E2E tests, install Chromium once with `pnpm exec playwright install chromium`, then run `pnpm test:e2e`. Playwright builds and starts the app on port 3100; set `ORBIT_TEST_PORT` if another checkout uses it. Use `pnpm exec playwright install` and `pnpm test:e2e:all` for all configured browsers and mobile viewports.

Backend and E2E tests require Docker. `pnpm test:database`, `pnpm test:backend`, and the E2E commands start a dedicated Supabase instance (`orbit-auth-test`) on ports 55320–55329; they do not use the development database or Google consent screen. Stop it with `pnpm dlx supabase@2.121.0 --workdir /tmp/orbit-auth-test stop`.

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

## Google sign-in setup

1. Copy `.env.example` to `.env.local` in this directory. Start Docker, then configure the Google provider before starting Supabase.
2. In Google Cloud, create a Web application OAuth client and configure the consent screen. Add test users if the consent screen is in testing mode. Register `http://localhost:54321/auth/v1/callback` as an authorized redirect URI.
3. Copy `apps/supabase/.env.example` to `apps/supabase/.env` from the repository root, then fill in the Google client ID and secret. Run `make supabase-start` from the root. Restart Supabase after changing provider configuration.
4. Run `make supabase-status` and copy the local anon key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Keep `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321` and `APP_URL=http://localhost:3000`. Use the same application hostname throughout sign-in.
5. Apply migrations with `pnpm dlx supabase@2.121.0 --workdir apps migration up --local` from the root, then run `make web-dev`. Open `http://localhost:3000` and choose “Continue with Google”.

For the web container, put `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `APP_URL` in an ignored root `.env` file before `make docker-up`. Compose supplies `SUPABASE_INTERNAL_URL=http://host.docker.internal:54321` for server-side requests; browsers continue using localhost. Public variables are build arguments, so rebuild after changing them. Local environment files are excluded from the image.

For deployment, enable Google in the hosted Supabase dashboard using the provider credentials. Register `https://<project-ref>.supabase.co/auth/v1/callback` in Google. Set Supabase's site URL to the application origin and allow the exact `https://<app-host>/auth/callback` redirect. Set `APP_URL` to that HTTPS origin and the public Supabase URL/key for the deployment. Omit `SUPABASE_INTERNAL_URL` when the public Supabase URL is reachable from the server. Apply the migration to the target Supabase project through your deployment workflow before serving the app.

Google redirects to Supabase's `/auth/v1/callback`; Supabase redirects to Orbit's `/auth/callback`. Keep Google secrets in Supabase configuration and server secret storage. A service-role key is unnecessary for web requests. Never commit real credentials.

Verify a new Google sign-in, a returning sign-in, cancellation, a protected return destination, reload persistence, and sign-out locally and on deployment. Google consent is verified manually; automated tests use isolated accounts and real Supabase sessions.
