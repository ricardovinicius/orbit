# Orbit — Prototype Plan

Status: **Draft for approval**  
Sources: [PRD](./PRD.md) · [Design workflow](./DESIGN.md)

## 1. Goal and deliverable

Prototype the complete personal planning loop: define Projects, identify Checkpoints, create Tasks, plan a week with Timeboxes, record Sessions, and review progress.

The deliverable will be a navigable prototype of the six main views, shared forms, and representative states described below. It should let a reviewer assess information hierarchy, navigation, and everyday workflows before production implementation.

This document is the textual design stage. Approval covers the proposed screens, flows, assumptions, and scope; implementation has not started.

## 2. Design approach

Follow the workflow in `DESIGN.md`:

1. Approve this textual plan.
2. Build a code prototype in `apps/prototype` with mock data and presentation-only interactions.
3. Use the Figma skills and MCP integration to transfer and refine the prototype on the **Prototype** page of the [project Figma file](https://www.figma.com/design/e3zOECxgnjbjEyRNTBFbkB/Prototype?node-id=0-1).
4. Review the canvas before translating approved designs into the main app.

Use shadcn components wherever possible and `shadcn-ui-kit-community-edition--Community` as the Figma component base. Use framework/library CLIs when scaffolding or adding supported configuration.

The code prototype uses fixtures and temporary UI state, without a backend, authentication, real integrations, or production scheduling/timer logic. Clicks may open forms, switch prepared states, and demonstrate outcomes. Reloading may reset the demo.

## 3. Product rules reflected in the design

- Every Task, Timebox, and Session belongs to a Project. A Checkpoint also belongs to a Project.
- A Task's Checkpoint is optional. Timeboxes and Sessions may each reference zero, one, or several Tasks.
- Assigning a Task to a day does not create a Timebox. Creating a Timebox does not create a Session.
- Planned time and actual time always have explicit labels and distinct visual treatments, beyond color alone.
- Completing a Task does not imply time was recorded. Stopping a Session does not automatically complete its Tasks.
- Show completed work and actual effort without scores, streak rewards, or an invented aggregate productivity percentage.

## 4. Navigation and shared layout

Primary navigation: **Today · Week · Projects · Sessions · Progress**. A Project detail screen opens from Projects or any linked Project name.

Use a persistent desktop sidebar, a page title with contextual actions, and a visible active-Session control across views. Forms open in a consistent dialog or sheet so users retain their place. Use a full-page form treatment on narrow screens when needed.

Desktop is the primary planning surface. Include narrow-screen variants of Today and Week to validate navigation and calendar usability: compact navigation, stacked content, and a day agenda instead of squeezing seven columns into a phone. Other screens should use the same responsive patterns.

Proposed emphasis: neutral surfaces, clear typography, restrained Project color accents, and compact readable lists. Validate this direction in the first screen review before applying it everywhere.

## 5. Screen inventory

### S01 — Today

**Purpose:** Answer “What should I focus on today?” and make recording work immediate.

Layout:

- Date and a primary **Start Session** action; secondary **Add Task** action.
- Today's Tasks, grouped into open and completed, with Project, optional Checkpoint, and recurrence indicator.
- Today's Timeboxes in chronological order with planned start/end times and optional Tasks.
- Active Session with Project, elapsed-time mock, and Stop action; recent Sessions labeled as actual activity.
- Upcoming Checkpoints ordered by deadline, with overdue items clearly labeled.

Interactions: complete a Task, reschedule it, inspect a Timebox, start a Session with its Project/Tasks prefilled, stop a Session, and open Project details.

Variants: populated day; empty day with useful actions; overdue Task/Checkpoint; active Session; completed Session confirmation. Proposed overdue Tasks appear in a separate “Needs attention” group rather than silently moving into today.

### S02 — Week

**Purpose:** Distribute Tasks across days and reserve planned time.

Layout:

- Week range, previous/next controls, Today shortcut, and **Add Timebox** action.
- Seven-day desktop calendar with time labels and Project-labeled Timeboxes.
- A dedicated Checkpoint deadline row above the Tasks and timed calendar. Place flag markers on each deadline day, showing the title and Project identity/color; distinguish overdue deadlines with text. Markers do not reserve time or contribute to planned-time totals.
- On narrow screens, show the selected day's Checkpoint deadlines above its Tasks and Timeboxes, with an explicit empty state when no deadlines fall that day.
- A Task strip per day, separate from timed blocks, showing Tasks assigned to that day.
- An unscheduled-Tasks panel with Project filter and an explicit **Assign day** action.
- A weekly planned-time total and per-Project breakdown.

Interactions: open a Checkpoint marker to view/edit its deadline and inspect associated Tasks; filter Checkpoints alongside Tasks and Timeboxes by Project; assign or reschedule a Task; select a calendar slot to open the Timebox form; inspect/edit a Timebox; choose a recurrence pattern and edit scope. Provide form-based date/time controls so planning never depends on dragging. Dragging is optional polish after core flows are reviewed.

Variants: planned week; empty week; recurring Timebox; overlapping Timeboxes; crowded day; narrow-screen day agenda; multiple Checkpoints on one day; overdue deadline; no deadlines in the selected week/Project. Overlaps remain visible and receive an advisory message rather than silently shifting the schedule.

### S03 — Projects

**Purpose:** Show the user's areas of focus and their current state.

Layout:

- Page title and **New Project** action.
- Active Projects as scannable cards or rows.
- Each Project shows its name, open Task count, next Checkpoint, and this week's planned and actual hours.
- Active/archived filter, subject to approval of the proposed lifecycle below.

Interactions: create/edit a Project, open Project details, and archive/reactivate a Project.

Variants: populated list; first-use empty state; Project with no Tasks or Checkpoints; archived list. Avoid interpreting high hours as inherently better progress.

### S04 — Project detail

**Purpose:** Connect one Project's milestones, work, and invested time.

Layout:

- Breadcrumb, Project name, description, and edit action.
- Summary of planned time, actual time, and completed Tasks for a clearly labeled period.
- Upcoming Checkpoints with deadlines and associated Task counts.
- Task list grouped by Checkpoint, including a “No Checkpoint” group; open/completed filter.
- Upcoming Timeboxes and recent Sessions, displayed in separate sections.

Interactions: add/edit a Checkpoint; add/edit/complete/reschedule a Task; plan a Timebox; start or manually register a Session; inspect a Session; navigate to Week with the Project in context.

Variants: populated Project; newly created Project; overdue Checkpoint; Tasks without Checkpoints; actual work with no planned time. Checkpoint detail uses a shared sheet with its Tasks rather than adding another primary view.

### S05 — Progress

**Purpose:** Answer “Does my actual effort match my intentions, and what moved forward?”

Layout:

- Date-range control and optional Project filter.
- Explicit planned-hours and actual-hours totals for the selected period, with the difference labeled in plain language.
- Planned vs. actual comparison by Project, supported by readable numeric values.
- Actual-time distribution by Project.
- Completed Tasks and upcoming Checkpoints with clearly labeled date scopes.
- GitHub-style activity heatmap based on actual Session duration per day, with a legend and date/duration details accessible by keyboard or touch.

Interactions: change period/Project, inspect a day's activity, open a Project or completed Task, and inspect the Sessions behind actual-time totals.

Variants: mixed planned/actual data; no activity; planned time without Sessions; Sessions without plans; filtered result with no data. Show zero values honestly and avoid percentage comparisons when planned time is zero.

### S06 — Sessions

**Purpose:** Review and correct recorded time across Projects.

Layout:

- Session history grouped by day, newest first, showing Project, optional Tasks, actual interval, duration, and recording source.
- Project filter including archived Projects, period presets, and inclusive custom date ranges.
- Recorded duration, Session count, and Project count for the full filtered selection; daily duration subtotals.
- Log and start actions, Session details and editing, and deletion with confirmation.
- Responsive history rows with accessible actions at narrow widths; older days can be expanded without changing totals.

Interactions: filter history, log completed work, edit an interval or association, and cancel or confirm deletion. Changes update the shared Session data and actual-time totals on Today, Project, and Progress. Tasks and planned Timeboxes remain independent.

Variants: populated week; no history; no matching results; invalid date range; archived Project history; active Session; edit validation; delete confirmation. Charts and planned-versus-actual comparisons remain in Progress.

## 6. Shared forms and supporting surfaces

| ID | Surface | Fields and actions | Important states |
| --- | --- | --- | --- |
| F01 | Project form | Name, optional description, color; create/save | Missing name; edit; archive confirmation |
| F02 | Checkpoint form/detail | Project, title, deadline; linked Tasks; create/save | Missing title/deadline; upcoming; overdue |
| F03 | Task form/detail | Title, required Project, optional Checkpoint, optional assigned day, recurrence; save/complete/reschedule | No Checkpoint; unscheduled; completed; recurring occurrence |
| F04 | Timebox form/detail | Required Project, date, start/end, optional Tasks, recurrence; create/save | No Tasks; several Tasks; invalid interval; overlap advisory |
| F05 | Start Session | Required Project and optional Tasks; start | Prefilled from a Timebox; ad hoc start; existing active Session |
| F06 | Active/stop Session | Project, associated Tasks, mock elapsed time; stop and review actual start/end before saving | Running; stopped review; invalid adjusted interval; saved |
| F07 | Register/edit completed Session | Required Project, date and actual start/end, optional Tasks; save | Historical entry; missing Project; invalid interval; edit preserves recording source |
| F08 | Session detail | Project, actual start/end and duration, associated Tasks; open editor | Recorded manually; timer-created; no associated Tasks |
| F10 | Delete Session confirmation | Project, date, interval, and duration removed; keep or delete | Cancellation restores focus; deletion updates actual-time totals |
| F09 | Recurrence controls | Daily, selected weekdays, or weekly; interval and optional end date; edit one occurrence or series | Summary preview; occurrence edit; series edit confirmation |

Project selection limits Checkpoint and Task choices to that Project. Changing Project clears incompatible selections with an explanation. Keep validation near the affected field and retain entered values.

Recurrence patterns and edit scopes are proposed prototype behavior, not additional requirements already specified by the PRD. Preview the effect on one occurrence and on a series without implementing a recurrence engine.

## 7. Reviewable end-to-end flows

| Flow | Path through screens | What the reviewer should verify |
| --- | --- | --- |
| A. Define meaningful work | Projects → New Project → Project → Add Checkpoint → Add Task | Project ownership is clear; Tasks can have a Checkpoint or stand alone. |
| B. Plan the week | Week → assign Task to a day → create Timebox → optionally attach Tasks | Day assignment and reserved time are separate, lightweight actions. |
| C. Repeat a commitment | Task/Timebox form → recurrence → Week → edit occurrence/series | Users understand the recurrence summary and the scope of an edit. |
| D. Execute planned work | Today → Timebox → Start Session → Stop → review/save | The actual interval can differ from the plan; the Timebox remains unchanged. |
| E. Capture unplanned work | Today/Project → Register completed Session → select Project and optional Tasks → save | Actual effort can exist without a Timebox or Task. |
| F. Adapt the plan | Today → reschedule unfinished Task → Week → edit Timebox | Moving a Task does not silently move a Timebox or rewrite Session history. |
| G. Review progress | Progress → select period/Project → inspect activity → Project | Totals reflect Sessions vs. Timeboxes separately; completed work and deadlines remain visible. |

## 8. Mock data and state coverage

Use one consistent fixture set across all screens, centered on a fixed demo “today” so dates, totals, and deadlines stay coherent:

- Projects: University, Work, Research, Fitness, and Personal Projects.
- Checkpoints such as an exam, paper submission, and MVP release, including an overdue example.
- Open and completed Tasks; optional Checkpoints; unscheduled Tasks; recurring Tasks.
- Timeboxes with zero, one, and multiple Tasks; recurring blocks; one overlap example.
- Sessions that start late, finish early, exceed a plan, or have no corresponding plan.
- Enough historical Sessions to demonstrate the heatmap and weekly comparisons.

Example: Research has a 13:00–15:00 Timebox and a 13:12–14:43 Session. Show **2h planned** and **1h 31m actual** consistently wherever that example appears.

Prepare selectable fixtures for populated, empty, active-Session, and validation states. Include representative loading and load-failure/retry states as visual specimens for later implementation. Distinguish no recorded activity from data that failed to load.

## 9. Proposed assumptions for approval

The PRD does not settle these details. This plan proposes:

| Decision | Proposal |
| --- | --- |
| Week and time conventions | Monday-start week, local timezone, 24-hour times in the prototype. |
| Initial platform emphasis | Desktop-first planning, with Today and Week explicitly reviewed at narrow widths. |
| Project lifecycle | Active and archived; archiving preserves historical activity. |
| Active Sessions | One active Session at a time; prompt the user to finish it before starting another. |
| Task dates | One optional assigned day; no separate Task due-date model in this prototype. Checkpoints carry deadlines. |
| Recurrence scope | Daily/weekday/weekly patterns; edit one occurrence or the series. Advanced rules and “this and following” edits deferred. |
| Checkpoint progress | Deadline and associated completed/open Task counts; no manually entered completion percentage. |
| Heatmap meaning | Actual Session duration, using day buckets in the displayed timezone; activity crossing midnight is split between days. |
| Integrations | No connection/setup screens in this pass. External Session import remains an architectural extension. |

## 10. Prototype boundaries

Include all MVP capabilities as reviewable screens or mocked interactions, including recurring Tasks and Timeboxes, manual timers, manual historical Sessions, and the activity heatmap.

Defer backend persistence, real timers, recurrence calculation, adapter implementations, account/settings screens, notifications, exports, and production analytics. These are outside this prototype deliverable; this does not remove MVP requirements from future implementation.

Keep the PRD's explicit exclusions out of the prototype: collaboration, complex dependencies, advanced project management, OKRs, gamification, AI planning, automatic scheduling, plugin marketplace, and complex custom analytics.

## 11. Build and review sequence

1. **Foundation and visual direction:** establish the shared shell, fixture data, and Today screen. Review hierarchy, density, terminology, and planned/actual styling.
2. **Define work:** build Projects, Project detail, and Project/Checkpoint/Task forms. Review flow A and first-use states.
3. **Plan time:** build Week, Task day assignment, Timebox forms, and recurrence specimens. Review flows B, C, and F plus the narrow-screen agenda.
4. **Record activity:** add start/stop and historical Session forms with the persistent active control. Review flows D and E.
5. **Understand progress:** build Progress and consistent cross-screen totals. Review flow G and zero-data cases.
6. **Canvas and handoff:** use Figma skills/MCP for transfer to the Prototype page, organize frames by screen/variant, annotate assumptions, and record remaining feedback before main-app implementation.

## 12. Acceptance and approval checklist

- [ ] The six main views and shared surfaces cover the PRD's MVP.
- [ ] Flows A–G can be demonstrated using consistent mock data.
- [ ] Planned time is never presented as actual effort, and Task completion is independent of Session recording.
- [ ] Optional relationships, recurrence edits, empty states, overdue work, and invalid forms are understandable.
- [ ] Progress totals, Project summaries, and the heatmap agree with the fixture Sessions and Timeboxes.
- [ ] Keyboard focus, form labels, readable contrast, and non-color status cues are included; Today and Week work at narrow widths.
- [ ] Components follow shadcn, and Figma artifacts use the required library and Prototype page.
- [ ] The assumptions in section 9 are accepted or revised before the affected screens are built.

**Approval response:** Approve this plan as written, or list changes by screen ID, flow letter, or assumption. Approval advances the work to the mocked code prototype stage.
