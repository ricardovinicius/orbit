# Orbit Prototype

Orbit's navigable UI prototype, built with Next.js, shadcn, and shared mock data. Forms and controls use temporary UI state; there is no backend, authentication, persistence, or production scheduling logic.

## Development

Requires Node.js 20.9+ and pnpm (the package manager version is pinned in `package.json`).

From this directory:

```sh
pnpm install
pnpm dev
```

The development server runs at http://localhost:3000 and opens the Today screen.

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm start
```

`pnpm start` serves the production build after `pnpm build`.

If a restricted environment prevents Turbopack's CSS worker from binding a local port, use `pnpm exec next build --webpack`. The prototype passes lint, TypeScript checking, and this Webpack production build. Browser automation is not included.

## Screens and review flows

| Route | Screen |
| --- | --- |
| `/` | Today: Tasks, planned Timeboxes, recorded Sessions, upcoming Checkpoints |
| `/week` | Weekly planner, Checkpoint deadlines, day assignments, Timebox forms, and Project filters |
| `/projects` | Active/archived Projects, search, creation, and editing |
| `/projects/research` | Project details, Checkpoints, grouped Tasks, time summaries, and Sessions |
| `/sessions` | Daily Session history, Project/date filters, recorded totals, logging, editing, and confirmed deletion |
| `/progress` | Planned vs. actual time, Project distribution, completed Tasks, and activity heatmap |

All Projects have their own detail route. Navigation preserves temporary changes until a reload.

Suggested walkthrough:

1. Create a Project, open it, and add a Checkpoint and a Task.
2. Open Week. Review the Checkpoint flags on their deadline days; select one to inspect its associated Tasks. Assign an unscheduled Task to a day and create a Timebox. On narrow screens, choose a day to see its deadlines above Tasks and Timeboxes. The Project filter applies to deadlines too; Checkpoints do not reserve time.
3. Open a Timebox and start a Session. Stop and review the prepared actual-time interval before saving.
4. Register a historical Session, or complete a Task independently of time recording.
5. Open Progress and filter by Project or period. Select a heatmap day to inspect its Sessions.
6. Open Sessions. Filter by Project, choose a period or custom dates, and edit a recorded interval. Confirm the new total in Progress. Delete a Session after reviewing the confirmation, or cancel to keep it. Clear filters to browse older activity.

Use **Prototype controls** in the sidebar or the **Prototype** badge in the header to load populated, active-Session, first-use empty, loading, and load-failure scenarios. Switching scenarios resets temporary edits.

## Mock behavior and scope

- The demo date stays fixed at **October 1, 2026** so overdue work, weekly totals, and deadlines remain consistent.
- Planned totals come from Timeboxes; actual totals come from completed Sessions. Completing a Task does not record time.
- The Session timer is a prepared 25-minute state, not a running clock. Start uses 15:00 on the demo date; the stop form lets reviewers adjust that interval.
- Recurrence controls preview daily, weekday, and weekly commitments. Editing a series updates existing fixture occurrences; the prototype does not generate future occurrences. Moving a date only moves that occurrence.
- Session entries use a single date and require an end time after the start time. Work across midnight can be demonstrated as separate entries.
- Sessions opens on the demo week. Filters include archived Projects, all history, and inclusive custom date ranges. Totals include all matching Sessions, even when older days are not yet expanded. Active Sessions are excluded until saved.
- Editing preserves a Session's recording source and updates shared actual-time totals. Deleting a Session leaves Tasks and Timeboxes unchanged.
- Progress totals honor the selected period. The heatmap has its own clearly labeled 14-week history window and honors the Project filter.
- Data resets on refresh. There are no external integrations or requests to save personal activity.
- The Figma reference informed the shadcn foundation. These screens implement the personal-planning PRD; they have not yet been transferred to the Figma canvas.

## Foundation

- Next.js App Router and TypeScript with strict checking.
- Tailwind CSS and ESLint.
- `src/app/layout.tsx` provides the shared document shell and mock workspace provider.
- `src/components/orbit` contains the screen compositions, shared UI, and editor forms.
- `src/components/ui` contains CLI-generated shadcn primitives.
- `src/lib/mock-data.ts` contains deterministic fixtures and display helpers.
- `src/app/globals.css` contains the shared theme and responsive layouts.
- Geist is bundled locally so builds do not fetch fonts.
- `@/*` imports resolve to `src/*`.

Read the [prototype plan](../../docs/PROTOTYPE_PLAN.md) and [design instructions](../../docs/DESIGN.md) before extending the screens. Continue to use shadcn components and shared fixtures.
