# 002 — Google Authentication

> Authenticate Orbit users through Google and Supabase Auth, with persistent sessions and an owner-only basic profile.

## Meta

| Field | Value |
|-------|-------|
| **Status** | In Progress |
| **Author** | Codex |
| **Created** | 2026-10-23 |
| **Updated** | 2026-10-24 |
| **Depends on** | Existing Next.js and local Supabase scaffold; no prerequisite feature spec |
| **Supersedes** | None |
| **Issue** | [#2 — Implement authentication with Google SSO](https://github.com/ricardovinicius/orbit/issues/2) |
| **Branch** | `2-implement-authentication-with-google-sso` |

---

## Problem Statement

Orbit's prototype simulates Google sign-in, while the main application has no authentication or private data access. Users need a persistent identity and session before accessing their workspace. This feature establishes Google authentication and a private profile without implementing the planning features or shared application shell.

---

## Goals & Non-Goals

### Goals

- [x] Provide one Google sign-in flow for new and returning users, preserving account identity across sign-ins.
- [x] Persist and refresh sessions, protect application pages and private server operations, and support sign-out.
- [x] Restore safe internal destinations after authentication and redirect authenticated users away from sign-in.
- [x] Store a private profile containing name, avatar, and email; enforce ownership in PostgreSQL.
- [x] Provide accessible loading, error, and retry states based on the prototype.
- [ ] Document local and deployment configuration and verify authentication, redirects, sessions, and isolation.

### Non-Goals

- Email/password login, additional providers, Google API access, account deletion UI, roles, or account linking controls.
- Profile editing, avatar uploads, timezone preferences, or a profile settings screen. The requested profile is provisioned from authentication data.
- Projects, Checkpoints, Tasks, Timeboxes, Sessions, Progress, or their schemas and policies.
- Shared navigation, responsive sidebar, and reusable page containers: these belong to [issue #1](https://github.com/ricardovinicius/orbit/issues/1).
- Changes to the mock prototype or a new backend framework.

---

## Proposed Solution

### Overview

Use Next.js App Router in `apps/web/src/app`, Supabase Auth for Google OAuth, and PostgreSQL for the private profile. Add `@supabase/ssr` and `@supabase/supabase-js` through pnpm. Keep authentication components and operations in `src/features/auth`, profile reads in `src/features/profile`, and shared Supabase clients in `src/lib/supabase`.

Use the SSR cookie-based PKCE flow: initiate Google authentication, exchange the returned authorization code server-side, and propagate refreshed cookies to the browser. Use request-scoped server clients and a browser client; never authorize from unvalidated cookie contents or `getSession()` alone. Follow the [Supabase SSR integration](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs).

The checked-in application uses App Router despite the stale TanStack router reference in `docs/ARCHITECTURE.md`. Preserve the existing router. Authentication pages sit outside an `(app)` route group; its protected root page can remain a minimal workspace placeholder until issue #1 supplies the shell. Expose a reusable sign-out control for later placement in that shell.

### User Experience

1. An unauthenticated visit to a protected page redirects to `/auth?next=<encoded pathname and query>`. Do not render private content before this decision.
2. `/auth` follows the prototype's Orbit branding, introductory content, and sign-in card. Remove simulation controls, prototype notices, and the unauthenticated workspace bypass. Keep the page outside the shell.
3. “Continue with Google” starts the real provider redirect. Disable duplicate submissions and announce the pending state. New and returning users use this same action.
4. `/auth/callback` exchanges the code, validates the session, and confirms the profile is available. Redirect to the validated destination, or `/` when absent or rejected.
5. An authenticated visit to `/auth` redirects to the workspace using the same safe destination rule. A revoked session is not considered authenticated.
6. The protected placeholder shows the signed-in user's basic identity and a sign-out action. A missing name or unusable avatar uses accessible fallback text or initials; it does not prevent access.
7. Sign-out ends the current session, clears its cookies and client-held private state, and returns to `/auth`. Other independent device sessions remain active.

Denied consent, provider failures, missing or expired codes, replayed callbacks, and missing PKCE state return to the sign-in page with a concise error and a retry action. Preserve only a validated destination across retries. Do not show raw provider error descriptions, tokens, or callback codes. A profile read or temporary backend failure shows a recoverable error without granting workspace access or falsely reporting successful sign-in/sign-out.

Controls must work with a keyboard, have visible focus, retain readable contrast in supported themes, and announce pending/error states. The sign-in layout must remain usable on narrow screens without requiring the application sidebar.

### Data Model

Supabase owns `auth.users`, identities, and authentication sessions. Orbit adds one table:

| `public.profiles` field | Type | Constraints and source |
|-------------------------|------|------------------------|
| `id` | `uuid` | Primary key; references `auth.users(id)` with `ON DELETE CASCADE`; same stable user ID |
| `name` | `text` | Nullable; normalized `full_name`, falling back to `name`, from Auth user metadata |
| `avatar_url` | `text` | Nullable; normalized `avatar_url`, falling back to `picture`, from Auth user metadata |
| `email` | `text` | Nullable to tolerate absent Auth data; copied from `auth.users.email`, never from a submitted profile payload |

Only string metadata values are accepted; empty values become null. Render names as text and use only HTTPS avatar URLs; invalid URLs produce a fallback. Email is descriptive account data, not an ownership key or a deduplication key.

Create the profile through an Auth-user insertion trigger and synchronize these fields when the corresponding Auth values change. Backfill existing Auth users during migration. Use an idempotent write keyed by `id`; repeated sign-ins must not create extra profiles. Profile persistence is part of provisioning, not a client-side effect. A failed creation trigger must fail the transaction rather than silently leaving a newly created account without a profile. Use a narrowly scoped trigger function with a fixed empty search path and qualified references. This follows the [Supabase user-data pattern](https://supabase.com/docs/guides/auth/managing-user-data).

Enable RLS before exposing the table. Anonymous users receive no profile privileges. Authenticated users receive SELECT only, with a policy requiring `auth.uid() = id` and an active authentication session. Do not grant client INSERT, UPDATE, or DELETE; synchronization runs through the trigger. Profile metadata must never grant authorization. Ordinary application reads use the caller's JWT, not a privileged key.

### API Endpoints

No standalone REST API or FastAPI service is introduced. Supabase owns authentication and the generated Data API; Next.js owns `/auth`, `/auth/callback`, and protected pages. Google initiation and sign-out are feature operations using the Supabase SDK and a server action where required. Profile access is an internal server-side operation backed by the caller-scoped Data API.

Keep SDK and database types in code; do not add a separate Markdown API contract. Every private server action or handler must validate authorization independently of navigation or layout checks.

### Frontend Components

Paths below are relative to `apps/web`.

| Component | Path | Responsibility |
|-----------|------|----------------|
| `SignInPage` | `src/features/auth/page.tsx` | Prototype-based authentication content and recoverable error presentation |
| `GoogleSignInButton` | `src/features/auth/components/google-sign-in-button.tsx` | Start OAuth, prevent duplicate submissions, and announce progress |
| `SignOutButton` | `src/features/auth/components/sign-out-button.tsx` | Invoke current-session sign-out and expose pending/failure states |
| `ProfileIdentity` | `src/features/profile/components/profile-identity.tsx` | Display the owner's name, email, and avatar with fallbacks |

Compose shadcn primitives where appropriate, following the existing Radix Nova preset, semantic colors, and Lucide icon conventions. Add needed primitives through the shadcn CLI during implementation. The reusable sign-out control and profile identity must not depend on prototype context or shell state.

### Business Rules

1. Supabase's Google identity determines the account. Never create a separate account based on email comparisons in application code.
2. `/auth` and `/auth/callback` are public. Protect every existing application page; static framework assets remain public. Preserve requested pathname and query, not a server-invisible fragment.
3. Accept `next` only as a root-relative internal path. Reject absolute URLs, protocol-relative URLs, backslashes, control characters, malformed escapes, and encoded variants that normalize into those forms. Parse against the configured application origin and verify the resulting origin before use. Reject authentication destinations that would cause loops. Invalid input falls back to `/`; never redirect to it verbatim. Apply the same validator at initiation and callback.
4. Validate the authenticated identity on the server, refresh when possible, and retain all resulting cookie updates on redirects and responses. Invalid or unrenewable sessions return to sign-in. Temporary infrastructure failures fail closed with retry feedback rather than exposing private data.
5. Successful sign-out must prevent subsequent protected access even with the ended session's previously issued token. Supabase tokens can otherwise remain valid until expiration; use local-scope sign-out explicitly. See [Supabase sign-out behavior](https://supabase.com/docs/guides/auth/signout).
6. Implement a narrowly scoped database function that returns whether the caller's JWT `session_id` exists in `auth.sessions` for `auth.uid()`. It accepts no user/session identifier arguments, returns only a boolean, and fails closed for missing or malformed claims. Use it in the profile SELECT policy and in the server authorization guard. Restrict execution to the necessary authenticated role, fix its search path, and expose no Auth session rows. This enforces the ended-session requirement using the [documented session check](https://supabase.com/docs/guides/auth/sessions#how-to-ensure-an-access-token-jwt-cannot-be-used-after-a-user-signs-out).
7. Protect private operations at the point of access. Never cache an authorization result across requests or share private rendered responses between users. Clear private client state on session loss; browser Back must not restore a usable authenticated workspace after sign-out.
8. Sign-out is a mutation, never a GET navigation side effect. Use a same-origin server action. Do not report completion if revocation fails; allow retry.
9. Google scopes are limited to authentication identity, email, and basic profile. Do not persist Google access/refresh tokens in the profile or request permissions for Google services.
10. No numerical performance or availability targets are added; the non-functional requirements are session correctness, owner isolation, secret protection, accessibility, and maintainable integration with the existing architecture.

### Configuration

- Define browser-visible `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; local installations may use the compatible local anon key value. Define server-only `SUPABASE_INTERNAL_URL` for container connectivity. Resolve the application origin exclusively from environment variables: Vercel production uses `https://VERCEL_PROJECT_PRODUCTION_URL`, falling back to `https://VERCEL_URL`; previews use `https://VERCEL_URL`; outside Vercel, use `APP_URL` or `http://localhost:3000`. Reject malformed origins and missing Vercel production URLs. Canonicalize Vercel aliases before authentication so PKCE cookies and callbacks share a host. Request headers never determine the selected origin.
- Browser requests use `http://localhost:54321` locally. Container-side Supabase requests use `http://host.docker.internal:54321`; provider authorization URLs and browser redirects must always use browser-reachable URLs. Use one consistent browser hostname for the application and its callback cookies.
- Enable Google in `apps/supabase/config.toml`, loading the client ID and secret from `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`. Keep actual values in ignored local environment files. Configure the hosted provider through the deployment's Supabase settings.
- Register the local Supabase provider callback `http://localhost:54321/auth/v1/callback` and the deployed Supabase callback in Google. Allow the application callback `http://localhost:3000/auth/callback` locally and the exact deployed HTTPS application callback in Supabase. Google redirects to Supabase; Supabase redirects to Orbit. Follow the [Google provider configuration](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).
- Vercel preview callbacks require exact deployment entries or a project/team-scoped pattern in Supabase's redirect allowlist; keep the production callback exact. Deployment documentation uses placeholders for the actual application origin and Supabase project URL. Include Google consent-screen/test-user setup where applicable. Do not invent a deployment domain or authorize arbitrary redirect origins.
- Provide credential-free environment examples and brief setup steps in `apps/web/README.md`. Keep local environments outside the Docker build context, pass required public configuration at build time, and provide server configuration at runtime. Provider secrets belong to Supabase, not the browser or web build. No service-role key is required for normal web requests.

---

## Implementation Plan

### Backend

1. Add Supabase dependencies in `apps/web` using pnpm. Implement browser/server client factories in `src/lib/supabase` and validate required configuration without logging secrets.
2. Add the profile migration and database session check described below. Generate matching database types using the pinned Supabase CLI.
3. Add `src/features/auth/redirect.ts`, `src/features/auth/server.ts`, and auth actions for shared destination validation, server authorization, and local-scope sign-out. Add the caller-scoped profile read in `src/features/profile/api.ts`.
4. Implement `src/app/auth/callback/route.ts` with PKCE exchange, profile readiness, cookie propagation, and bounded error handling. Never trust request host headers to construct the application origin.
5. Add `src/proxy.ts` for session refresh and early page redirects using the installed Next.js conventions. Keep definitive authorization in protected server code. Read the installed framework documentation before implementation; do not introduce legacy middleware conventions blindly.
6. Update Supabase configuration, credential-free environment examples, Docker configuration only where needed, and minimal setup documentation.

### Frontend

1. Add the auth and profile identity components above using the prototype and `docs/DESIGN.md` as references.
2. Add `src/app/auth/page.tsx` outside the protected group. Move the root workspace route to `src/app/(app)/page.tsx` and add its protected layout, retaining a minimal placeholder with identity and sign-out. Do not implement issue #1's shell.
3. Ensure server redirects, client session-loss handling, loading states, and retry actions work together without redirect loops or private-content flashes.
4. Add focused component and workflow tests, then run the repository checks and manual provider verification.

### Migrations

1. Create a migration with `pnpm dlx supabase@2.121.0 --workdir apps migration new private_profiles`.
2. Add `public.profiles`, its ownership constraint, RLS and explicit grants, provisioning/synchronization triggers, the restricted session-check function, and the owner/session SELECT policy. Backfill existing Auth users without overwriting unrelated data.
3. Verify from a clean dedicated local database with `pnpm dlx supabase@2.121.0 --workdir apps db reset`. Do not reset a shared or production database. Do not put real identities or credentials in seed data.

---

## Testing Strategy

Follow `docs/TESTING.md`: unit tests for rules, real-backend integration tests for persistence and authorization, and Playwright for critical journeys.

### Backend Tests

- Given a safe internal path and query, destination validation preserves it; given external, protocol-relative, encoded, malformed, control-character, backslash, or auth-loop input, it returns `/`.
- Given first-time Auth provisioning, exactly one matching profile is created; repeated provisioning/sign-in retains the same ID. Auth updates synchronize the three fields. Missing or malformed optional metadata does not break provisioning; a persistence error does not silently succeed.
- Given users A and B with real test sessions, A can read A's profile but cannot read B's, including through direct Data API access. Anonymous reads and all client writes are denied. Metadata changes cannot change ownership.
- Given valid, refreshable, expired, malformed, or revoked credentials, page guards and direct private operations grant or reject access consistently. Refreshed cookies reach the response and subsequent requests.
- Given successful sign-out, the old refresh token cannot renew and replaying its still-unexpired access token fails both the server guard and profile RLS. A separate device session remains valid.
- Given missing, expired, reused, or invalid callback state, no authenticated workspace is exposed and retry remains available. Unit-test callback/provider failure mapping with a controlled SDK boundary; real Google verification remains manual.
- Verify migration application, backfill, restricted grants, trigger rollback on failure, and session-check behavior for missing/invalid claims against the dedicated Supabase instance.

### Frontend Tests

- React Testing Library: Google action, duplicate-submit prevention, pending announcements, error/retry states, sign-out failure, and identity fallbacks using accessible queries.
- Playwright: anonymous redirect, authenticated home, authenticated sign-in redirect, reload persistence, expired-session recovery, and sign-out followed by Back/reload/direct navigation.
- Provision isolated accounts and real Supabase sessions through test-only helpers; reuse authenticated browser state where safe. Do not automate Google's consent screen or add a production authentication bypass. Test credentials and privileged setup helpers remain outside application bundles.
- Run E2E against the production build and real dedicated backend. Align configuration with the existing `http://127.0.0.1:3100` test origin; mock-provider error tests must remain separate from backend/E2E evidence.

### Validation Record — 2026-10-23

- Passed: Biome, TypeScript, 53 unit/component tests, 27 database assertions including pre-existing-user backfill, and two real-backend integration workflows.
- Passed: production build, standalone server smoke check, Docker image build, and eight Playwright journeys across desktop and mobile Chromium on Next.js 16.4.1. The configured Docker runtime serves sign-in as the non-root `node` user and reaches the Google-enabled Supabase backend through `host.docker.internal`.
- Passed: keyboard navigation and desktop light/mobile dark inspection; no horizontal overflow at a 390px viewport.
- The approved Next.js patch clears its three reported advisories. The dependency audit still reports eight findings in transitive packages (two high, four moderate, two low); broader dependency changes remain outside this implementation.
- Passed: the user confirmed real Google sign-in, workspace reload, and sign-out on the configured local instance at `http://localhost:3115`.
- Pending: verification against a deployment target, including its Google/Supabase redirect configuration. This required manual check keeps the specification In Progress.

### Vercel Follow-up Validation — 2026-10-24

- Passed: Biome, TypeScript, 70 unit/component tests, and a production build with Vercel preview variables and no APP_URL.
- Passed: four production-server smoke checks for public sign-in, alias canonicalization before PKCE cookies, canonical callback redirects, and rejection of spoofed hosts.
- The deployed preview still requires the matching Supabase redirect allowlist and real Google consent verification.

### Manual Verification

1. Configure Google and Supabase locally from the documented steps; verify both native development and Docker operation without exposing credentials.
2. Sign in with a new Google identity, inspect the private profile, sign out, and sign in again. Confirm the same Auth ID and one profile row.
3. Enter a protected internal destination before sign-in and verify return navigation; exercise hostile `next` values and confirm fallback to `/`.
4. Cancel provider consent, exercise an invalid callback, retry, reload an active session, and verify recovery when renewal is no longer possible.
5. Verify sign-out, denied subsequent private access, and owner isolation with a second account. Verify keyboard focus, pending/error announcements, avatar fallbacks, and narrow-screen usability.
6. Repeat real Google sign-in/sign-out on the configured deployment before release. Run lint, formatting, type checking, unit/integration tests, the production build, and the focused Playwright suite; retain failed E2E artifacts per repository policy.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-24 | Resolve Vercel origins exclusively from environment variables and canonicalize aliases | User requested simpler environment-only origin selection; canonicalization keeps PKCE cookies and callbacks on the same host |
| 2026-10-23 | Upgrade Next.js from 16.4.0 to 16.4.1 | User approved the security patch after the dependency audit |
| 2026-10-23 | Include a private profile with name, avatar, and email | Explicit user clarification; provides the resource for data-isolation acceptance tests |
| 2026-10-23 | Provision and synchronize a read-only profile from Auth data | Basic profile storage is in scope; editing and uploads were not requested |
| 2026-10-23 | Keep App Router and a minimal protected placeholder | Matches the actual scaffold and allows authentication to proceed independently of issue #1 |
| 2026-10-23 | Check current-session existence in addition to token validation | Issue #2 requires ended sessions to lose protected access; token expiry alone does not provide that guarantee |

---

## References

- [Specification template](000_base-spec.md)
- [Architecture](../ARCHITECTURE.md), [design](../DESIGN.md), [testing](../TESTING.md), and [code conventions](../CODE_STYLE.md)
- [Prototype sign-in page](../../apps/prototype/src/app/auth/page.tsx)
- Reviewed screenshots: [desktop light](assets/002_auth_desktop.png), [mobile dark](assets/002_auth_mobile_dark.png)
- GitHub issue inventory reviewed on 2026-10-23: [#1 — Shared layout](https://github.com/ricardovinicius/orbit/issues/1) and [#2 — Google authentication](https://github.com/ricardovinicius/orbit/issues/2). No other issues were returned by the all-state issue listing; roadmap features remain excluded from this specification.
