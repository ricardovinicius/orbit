# 001 — Shared Application Layout

> Provide reusable navigation and page structure so Orbit application screens share a consistent, accessible layout.

## Meta

| Field | Value |
|-------|-------|
| **Status** | Done |
| **Author** | Codex |
| **Created** | 2026-10-23 |
| **Updated** | 2026-10-24 |
| **Depends on** | None; implement independently of issue #2 |
| **Supersedes** | None |
| **Issue** | [#1 — Build shared application layout components](https://github.com/ricardovinicius/orbit/issues/1) |
| **Branch** | `1-build-shared-application-layout-components` |

---

## Problem Statement

The main application still displays the Next.js starter page. Orbit users need consistent navigation and page structure as feature screens become available. A shared shell based on the existing prototype prevents each feature from duplicating navigation, spacing, and responsive behavior.

---

## Goals & Non-Goals

### Goals

- [x] Provide one reusable shell with Orbit branding, primary navigation, project navigation, and a main content area.
- [x] Support expanded and collapsed desktop navigation and accessible mobile navigation.
- [x] Identify active navigation destinations, including nested routes.
- [x] Provide reusable page headers with titles, optional descriptions, and optional actions, plus consistent content containers.
- [x] Keep navigation and long content usable on narrow and short viewports.
- [x] Keep authentication pages outside the shell and demonstrate application routes using placeholders.
- [x] Cover navigation behavior according to `docs/TESTING.md`.
- [x] Provide prototype-style light/dark switching with system preference and a saved user choice.

### Non-Goals

- Backend integration, database changes, project fetching, or feature business logic.
- Implementing Today, Week, Projects, Sessions, or Progress beyond layout placeholders.
- Google sign-in, callbacks, session management, route protection, user isolation, account menus, or sign-out; these belong to [issue #2](https://github.com/ricardovinicius/orbit/issues/2).
- Porting prototype scenario controls, task counts, session timers, editors, notifications, or data providers.
- Persisting sidebar preferences across reloads.

---

## Proposed Solution

### Overview

Use Next.js App Router and compose the shell in `apps/web/src/app/(app)/(workspace)/layout.tsx`. Keep document markup and global styles in the root layout. Authentication pages belong outside `(workspace)`, under `auth/`; a route group is a layout boundary, not an authorization mechanism.

Use the prototype's `workspace.tsx`, `shared.tsx`, and global styles as visual references for branding, navigation hierarchy, typography, and spacing. Follow `docs/DESIGN.md` and the existing shadcn configuration. Compose shadcn Sidebar, Button, Tooltip, and mobile Sheet primitives where applicable. Keep interactive navigation in client components; page containers and route content need no client boundary solely to participate in the layout.

### User Experience

1. Opening `/` displays a Today placeholder within the shared shell.
2. Desktop users see Orbit branding above primary links and a distinct Projects section. A labeled control switches between expanded and compact navigation without removing access to destinations.
3. Compact navigation retains accessible names and reveals full labels through tooltips on hover and keyboard focus, including project names.
4. On mobile, a visible, labeled menu button opens the navigation in a modal sheet. The sheet has an accessible title, contains keyboard focus while open, closes through its close control or Escape, and restores focus to the trigger when dismissed. Selecting a destination closes the sheet.
5. Each application page renders a heading and content container. Descriptions and actions are optional; actions wrap on narrow screens without covering the title or content.
6. Navigation lists and page content can scroll independently when needed. Branding and navigation controls remain reachable on short viewports; long names do not push controls offscreen.

Retain the prototype's primary destinations:

| Label | Public route | Initial content |
|-------|--------------|-----------------|
| Today | `/` | Layout placeholder |
| Week | `/week` | Layout placeholder |
| Projects | `/projects` | Layout placeholder |
| Sessions | `/sessions` | Layout placeholder |
| Progress | `/progress` | Layout placeholder |
| Project name | `/projects/[projectId]` | Placeholder for a supplied sample project |

Supply a small static project list to exercise project navigation without backend access. An empty list shows the prototype's empty-project guidance. Unknown sample project identifiers use the application's not-found behavior rather than displaying another project. Long lists and names are test cases, not additional product features.

Use semantic navigation landmarks with distinct labels, one main landmark, a skip-to-content link, and a page-level heading. Navigation links and controls must be keyboard operable, expose accessible names, and retain visible focus. Do not rely on color alone to convey selection. Layout placeholders must not present working feature actions or loading/error states for nonexistent backend operations.

Desktop users can switch appearance from the sidebar footer, including compact mode. Mobile users use the theme control beside the menu trigger. Follow the prototype’s light and dark palettes. Start with the system preference, allow an explicit light/dark choice, and persist that choice in `localStorage` under `orbit-theme`. Apply the preference before paint; storage failure must not prevent switching on the current page. Follow system changes until a preference is saved.

### Data Model

No database entities or migrations. Navigation configuration contains label, destination, and icon. Project navigation receives display-only entries containing an identifier, name, destination, and optional visual marker. Keep sample entries separate from shell components so later features can replace them without changing layout behavior.

Desktop expansion and mobile open/closed state are local UI state. Desktop state survives navigation while the shared layout remains mounted; reload persistence is not required. Mobile visibility is independent of desktop expansion.

### API Endpoints

None. This issue introduces no API routes, Server Actions, or Supabase calls.

### Frontend Components

All paths below are relative to `apps/web/src`.

| Component or module | Path | Responsibility |
|---------------------|------|----------------|
| Workspace layout | `app/(app)/(workspace)/layout.tsx` | Mount the shell once around application routes and supply navigation entries |
| AppShell | `components/layout/app-shell.tsx` | Compose sidebar, mobile trigger, skip link, and main landmark around children |
| AppSidebar | `components/layout/app-sidebar.tsx` | Render branding and both navigation sections using shared desktop/mobile navigation content |
| PageHeader | `components/layout/page-header.tsx` | Render required title, optional description, and optional action slot |
| PageContainer | `components/layout/page-container.tsx` | Apply consistent responsive content spacing around children |
| Navigation configuration and matching | `components/layout/navigation.ts` | Define primary destinations and segment-aware active matching |
| Sample project entries | `components/layout/sample-projects.ts` | Supply temporary display-only project navigation data |
| ThemeToggle | `components/layout/theme-toggle.tsx` | Switch appearance from desktop and mobile controls; synchronize saved/system preferences |
| Theme initialization | `lib/theme.ts` | Apply appearance before first paint and share preference keys |
| shadcn primitives | `components/ui/` | Reusable accessible controls generated through the shadcn CLI |

Use kebab-case filenames and existing `@/` aliases. Compose children and action slots instead of coupling shared components to feature-specific state. Header actions belong to the page that supplies them.

### Business Rules

1. Every workspace route uses the shared layout; individual pages must not duplicate navigation or the main landmark.
2. `/` is active only for the root pathname. Other destinations match their exact pathname or a descendant separated by `/`; `/weekend` must not activate `/week`.
3. Project descendants activate both the Projects primary section and the matching project entry. Project identifiers must match complete path segments, so `/projects/alpha-2` does not activate `/projects/alpha`.
4. Exact destinations use `aria-current="page"`; an active ancestor may use `aria-current="location"`. Query strings and fragments do not change the selected pathname destination.
5. Collapsing navigation must preserve link access, labels, and active styling. Closing mobile navigation must release its focus trap and scroll lock.
6. Content and navigation overflow must not overlap each other or make essential controls unreachable. The shell itself must not force horizontal page scrolling at narrow widths.
7. Authentication pages and callbacks are outside the workspace layout. Issue #2 owns their implementation and access-control behavior.
8. The shell consumes presentation data and children only; it must not import prototype domain providers or implement project, task, session, or authentication operations.

---

## Implementation Plan

### Backend

None. No backend dependency is required to implement or validate this shell.

### Frontend

1. Read `docs/DESIGN.md`, `docs/CODE_STYLE.md`, `docs/TESTING.md`, and the installed Next.js guides required by `apps/web/AGENTS.md`. Inspect the existing shadcn configuration and add needed primitives with its CLI, preserving the configured style and aliases.
2. Create the layout components and navigation configuration under `apps/web/src/components/layout/`. Keep matching logic independently testable and UI state close to the controls that own it.
3. Add `apps/web/src/app/(app)/(workspace)/layout.tsx` and move the root page into `(workspace)/page.tsx`, replacing starter content with a Today placeholder. Remove the old root page to avoid duplicate `/` routes.
4. Add placeholder route pages for `week`, `projects`, `projects/[projectId]`, `sessions`, and `progress` within `(workspace)`. Use the shared header and container on each page.
5. Adapt visual tokens and layout styles in `apps/web/src/app/globals.css` only as necessary to match the prototype and support responsive overflow. Keep document markup in the root layout; do not mount the shell there.
6. Keep the `auth/` boundary outside the protected workspace. Do not add a sign-in flow or simulated authentication to demonstrate separation; verify shell exclusion with tests and any authentication routes present when implementation occurs.
7. Add the navigation tests below and run the required application checks. This specification authorizes no feature implementation during its drafting.

### Migrations

None.

---

## Testing Strategy

### Backend Tests

Not applicable; there is no backend behavior in scope.

### Frontend Tests

Use Vitest and React Testing Library under `apps/web/src/test/` for focused behavior tests:

- Given root, exact, nested, and similarly prefixed paths, only the intended destinations receive active state; cover both primary links and project identifiers.
- Given a desktop sidebar, toggling it changes its expanded state while destinations retain accessible names and selection.
- Given no projects, show empty guidance; given project entries, render their names and correct destinations.
- Given a page header, render its title with or without description and actions.
- Verify the root layout does not mount workspace navigation and that the workspace layout composes it once. Once issue #2 provides authentication pages, exercise their shell exclusion through those real routes.

Use a small Playwright suite in `apps/web/e2e/layout.spec.ts` against the configured production build:

- Given a workspace placeholder, navigate to another primary destination and a sample project; assert the visible heading and selected navigation state, including direct navigation and browser history.
- Given mobile navigation, open it by keyboard, select a destination, and verify it closes; also verify Escape dismissal and focus restoration.
- Given desktop navigation, collapse and expand it and continue navigating with the keyboard.

Use accessible roles and labels, independent tests, and visible outcomes. Do not add a fake backend or prototype tests to this application suite. With authentication integrated from main, use the dedicated Supabase test database and isolated authenticated sessions according to `docs/TESTING.md`.

Run the existing `apps/web` lint, format check, typecheck, Vitest, and Chromium Playwright commands. The existing Playwright configuration builds the production application. Retain the repository's broader scheduled browser coverage.

### Manual Verification

1. Compare branding, sidebar hierarchy, typography, and content spacing with the prototype and `docs/DESIGN.md`.
2. Check expanded and collapsed desktop navigation at a typical desktop size and a short viewport, such as 1280 × 480. Verify full labels remain available in compact mode.
3. Check mobile navigation at 375 × 667 and 320 × 568. Verify every destination, dismissal control, and page action remains reachable without shell-induced horizontal scrolling.
4. Exercise long page content, many project entries, long names, and empty project navigation. Confirm scrolling does not hide essential controls or overlap content.
5. Use only the keyboard to reach navigation, collapse/expand controls, mobile controls, and page actions. Check visible focus, sheet focus containment, focus restoration, and skip-to-content behavior.
6. Verify exact and nested route selection and headers with title only, title plus description, and actions that wrap.
7. Confirm authentication routes remain outside the shell when available from issue #2; before then, verify the layout boundary through the focused tests above.

### Validation Results — 2026-10-23

- Passed `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, and `pnpm test` (13 tests).
- Passed `pnpm test:e2e`: production build and four Chromium tests covering desktop collapse/history, 320px and 375px mobile navigation, focus containment/restoration, unknown projects, and long-content/navigation scrolling.
- Inspected desktop, compact, and mobile screenshots; verified skip-to-content focus and page-action wrapping at 320px. Empty project guidance and optional header content are covered by component tests.
- Authentication shell exclusion is verified at the layout boundary; real authentication pages remain issue #2 scope. Broader browser projects remain part of the existing scheduled CI configuration.
- Prototype-fidelity follow-up: matched the prototype’s branding, edge-mounted collapse control, section labels, colored project markers, 72px compact navigation, responsive spacing, header typography, and footer. Inspected updated desktop/mobile captures and reran the 13 component tests and four production Chromium tests successfully.
- Dark mode follow-up: passed the 13 component tests and six production Chromium tests, including system preference changes, explicit light/dark choices, reload persistence, mobile appearance controls, and unavailable storage.
- The installed Next.js version reports a security advisory during production builds. The build passed after its upgrade reminder; dependency remediation is outside this layout change.

---

## Integration with main — 2026-10-24

Authentication from issue #2 is now available on `main`. The `(app)` parent layout owns session validation and lifecycle handling; `(workspace)` composes the shell beneath it. The Today placeholder retains the authenticated profile and sign-out controls. Layout and theme E2E tests use isolated real Supabase sessions; sign-in pages stay outside the shell. Merged validation passed Biome checks, type checking, 83 unit/component tests, the production build, and all 10 Chromium tests.

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-23 | Add prototype-style theme switching with persisted preference | User explicitly added dark mode after approving the original layout scope |
| 2026-10-23 | Use Next.js App Router and update `docs/ARCHITECTURE.md` | User resolved the conflict between the architecture's TanStack Router reference and the existing Next.js application |
| 2026-10-23 | Keep authentication implementation in issue #2 | GitHub issue review found a separate issue owning authentication, sessions, protection, and sign-out |
| 2026-10-23 | Use the prototype's destination names with placeholder pages and project entries | Issue #1 requires the existing visual structure while explicitly excluding backend integration |

---

## References

- [Specification template](000_base-spec.md)
- [Architecture](../ARCHITECTURE.md)
- [Design guidelines](../DESIGN.md)
- [Testing strategy](../TESTING.md)
- [Code conventions](../CODE_STYLE.md)
- [Product terminology and views](../PRD.md)
- [Prototype shell](../../apps/prototype/src/components/orbit/workspace.tsx)
- [Prototype shared components](../../apps/prototype/src/components/orbit/shared.tsx)
- [Prototype styles](../../apps/prototype/src/app/globals.css)
- [Issue #2 — Authentication](https://github.com/ricardovinicius/orbit/issues/2)
