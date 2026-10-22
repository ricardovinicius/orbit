## 0. Prototyping

- [x] Add line tracking the current hour on week and today pages
- [x] Plan the [feedback_01](./feedbacks/feedback_01.md) changes (implementation plan below)
- [x] Remove the topbar
- [x] Increase typography for readability
- [x] Make Timeboxes look like containers for planned Tasks
- [x] Add Undo to mutation notifications
- [x] Match the favicon to the logo
- [x] Make sidebar shrink
- [x] Make the session timer bar sticky
- [x] When move the mouse over the projects buttons, when collapsed the sidebar, the name of the project must appear as tooltip
- [x] Improve the UI with drag-n-drop
    - [x] dnd on week plan calendar
    - [x] order today tasks
- [x] Improve toast UI/UX
- [X] Implement and review the feedback_01 changes
- [ ] Move prototype to Figma
- [x] Evaluate the prototype asking for feedback 

## 1. Technical Scaffold

- [x] Initialize web project with Next.js
- [ ] Add linter, formatter and test dependencies for app
- [ ] Define folder structure for app
- [ ] Add containerization using Docker and Docker Compose
- [ ] Add CI/CD pipeline

## 2. MVP Features

- [ ] Layout components (side bar, etc.)
- [ ] Authentication
- [ ] Projects
- [ ] Checkpoints
- [ ] Tasks
- [ ] Today view
- [ ] Weekly planning and Timeboxes
- [ ] Sessions and History view
- [ ] Progress
- [ ] Recurring Tasks and Timeboxes
 
## Feedback 01 — Prototype implementation plan

Scope: apply the five UI changes in [feedback_01](./feedbacks/feedback_01.md) to `apps/prototype`, following [DESIGN.md](./DESIGN.md). Keep interactions backed by mock data and temporary UI state. Complete this pass before moving the prototype to Figma and collecting the next round of feedback.

Implement in this order so the shared layout and typography are settled before refining Timeboxes:

1. **Remove the topbar.**
   - [x] Remove the workspace breadcrumb, prototype badge, and fixed date from `src/components/orbit/workspace.tsx`, plus unused topbar styles in `src/app/globals.css`.
   - [x] Move the theme toggle into the sidebar controls; retain the existing Prototype controls entry and persistent active-Session control. Keep page titles and contextual actions as the main heading.
   - Acceptance: all six views open without the topbar; navigation, theme switching, scenario selection, and stopping an active Session remain accessible.

2. **Increase typography for readability.**
   - [x] Establish a larger shared type scale in `src/app/globals.css`: target 16px body text, 14–16px controls and list content, and at least 12px secondary metadata. Preserve a clear heading hierarchy and increase line height and spacing where needed.
   - [x] Audit explicit small-font overrides across navigation, Tasks, calendars, Sessions, Progress, forms, and notifications so increasing the body size also improves the content users read.
   - Acceptance: primary labels and task names are visibly larger at normal zoom; text and actions remain legible without clipping in representative populated and crowded desktop states, in both themes.

3. **Make Timeboxes look like containers for planned Tasks.**
   - [x] Update `src/components/orbit/shared.tsx`, `src/components/orbit/week.tsx`, and their shared styles to use translucent Project-tinted backgrounds and dashed outlines, with readable solid text.
   - [x] Show linked Task titles inside the Timebox, rather than only a count or the Timebox title. Retain Project identity, interval, recurrence, and an explicit planned-time label; use “Project time” for Timeboxes with no Tasks.
   - [x] For short or overlapping calendar blocks, prioritize Project and interval, summarize hidden Tasks with a count, and expose the full list through Timebox details. Keep the current-time line visible and preserve the separate day-assigned Task strip.
   - Acceptance: Today, Week, and Project detail consistently show Timeboxes as planned containers; zero, one, and several linked Tasks are understandable. Dashed boundaries and labels distinguish planned time from actual Sessions beyond color alone.

4. **Add Undo to mutation notifications.**
   - [x] Extend the notification state/API in `src/components/orbit/workspace.tsx` with an optional Undo action, using shadcn components where appropriate.
   - [x] Wire reversible operations in `shared.tsx`, `editor.tsx`, and `sessions.tsx`: Task completion/reopening, create/edit/reschedule actions, Project archive/reactivation, Session deletion, and Session start/stop/save.
   - [x] Capture the affected records and active-Session state before each change. Undo restores only that operation, including all occurrences affected by a series edit, without rolling back unrelated later work; shared totals update from the restored data.
   - [x] Support one Undo per notification, invalidate the action when the notice is replaced/dismissed or fixtures reset, and omit Undo for informational notices. Keep Undo available until dismissal or replacement, with keyboard access and an announced result.
   - Acceptance: Undo works once for each supported mutation, restores Session totals and Task completion dates, and cannot apply stale changes after a scenario switch. Undoing a stopped/saved Session restores its previous active state without leaving a duplicate recorded Session.

5. **Match the favicon to the logo.**
   - [x] Add a Next.js favicon/icon asset based on the existing Orbit symbol in the sidebar, preserving its shape and stroke treatment. Use the existing vector geometry.
   - [x] Replace any default icon and verify the Next.js icon metadata/file convention resolves to the intended asset.
   - Acceptance: the browser tab shows the Orbit symbol, recognizable at 16px and 32px against light and dark browser chrome.

### Validation and handoff

- [ ] Run the prototype's lint and production build after implementation.
- [ ] Review Today, Week, Projects, Project detail, Sessions, and Progress in both themes; check dialogs, keyboard focus, notifications, active-Session controls, and the current-time line.
- [ ] Verify representative Undo flows, including edits followed by unrelated work, series edits, Session deletion, dismissal/replacement, and fixture resets.
- [ ] Compare the result against all five feedback items before marking implementation complete. Transfer the reviewed design to Figma's **Prototype** page during the existing Figma roadmap step, using the required integration and component library.

### Deferred technical debt

- [ ] Address responsive layout issues in a separate pass: inventory failures across all six views, prioritize narrow-screen navigation and the Week agenda, and define viewport-specific acceptance checks before implementing fixes.

Responsive redesign is outside feedback_01's implementation scope. Check for regressions caused by this pass and record existing issues for the separate debt item.
