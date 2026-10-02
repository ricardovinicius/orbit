# PRD — Orbit: Personal Management Platform

## 1. Product Vision

Orbit helps users organize their main areas of focus, plan how they want to spend their time, and understand how that effort translates into progress.

The product connects planning and execution through five simple concepts:

- **Projects** define the areas the user wants to manage.
- **Checkpoints** define meaningful milestones and deadlines within a Project.
- **Tasks** define the work required to make progress.
- **Timeboxes** represent when the user intends to dedicate time to a Project and its Tasks.
- **Sessions** represent when the user actually dedicated time.

The product should help users answer:

- What should I focus on?
- How am I allocating my time?
- What did I actually do?
- Am I making progress?

---

## 2. Core Experience

The user creates Projects such as:

- University
- Work
- Research
- Fitness
- Personal Projects

Within each Project, the user can define Checkpoints and Tasks.

The user then plans their week by assigning Tasks to days and creating Timeboxes for specific Projects.

As work happens, Sessions record the actual time spent.

This creates a simple flow:

> **Project → Checkpoint → Task → Timebox → Session**

Or, from the user's perspective:

> **What matters → what needs to happen → when I plan to do it → what I actually did**

---

## 3. Core Concepts

### Project

The main organizational unit of the product.

A Project represents an area of focus whose progress and effort the user wants to manage.

---

### Checkpoint

A milestone or deadline within a Project.

Examples:

- Exam
- Sprint end
- Paper submission
- MVP release

Tasks may be associated with a Checkpoint.

---

### Task

A discrete piece of work that can be completed.

Every Task belongs to a Project and may optionally belong to a Checkpoint.

---

### Timebox

A planned period of time dedicated to a Project.

A Timebox may optionally include one or more Tasks.

Example:

> Monday, 13:00–15:00 — Research

Timeboxes represent **planned effort**.

---

### Session

A period of actual activity dedicated to a Project.

A Session may optionally be associated with one or more Tasks.

Example:

> Monday, 13:12–14:43 — Research

Sessions represent **actual effort**.

Sessions may be created manually or imported from external tools.

---

## 4. MVP

The MVP should allow the user to:

### Projects
- create and manage Projects;
- view active Projects;
- view the current state of each Project.

### Checkpoints
- create milestones with deadlines;
- associate Tasks with Checkpoints;
- see upcoming Checkpoints.

### Tasks
- create, edit, complete, and reschedule Tasks;
- associate Tasks with Projects and Checkpoints;
- support recurring Tasks.

### Weekly Planning
- view a weekly calendar;
- see Checkpoints on their deadline days, separately from reserved time;
- distribute Tasks across days;
- create and edit Timeboxes;
- support recurring Timeboxes.

### Sessions
- manually start and stop a Session;
- manually register a completed Session;
- associate Sessions with a Project and optional Tasks.

### Progress
- compare planned time with actual time;
- see completed Tasks;
- see upcoming Checkpoints;
- see time spent per Project;
- view a GitHub-style activity heatmap.

---

## 5. Main Views

### Today

Shows:

- today's Tasks;
- today's Timeboxes;
- active or recent Sessions;
- upcoming Checkpoints.

### Week

The main planning interface.

Shows:

- weekly schedule;
- Checkpoint deadlines, shown on their calendar days without reserving time;
- Tasks;
- Timeboxes;
- recurring commitments.

### Projects

Shows all Projects and their current status.

### Project

Shows:

- Checkpoints;
- Tasks;
- planned time;
- actual time;
- recent Sessions.

### Progress

Shows:

- planned vs. actual time;
- time distribution by Project;
- completed Tasks;
- activity heatmap.

---

## 6. Integrations

The architecture should allow external tools to contribute Sessions.

Examples:

- coding trackers → coding Sessions;
- fitness platforms → workout Sessions;
- reading trackers → reading Sessions;
- focus timers → focus Sessions.

Integrations should use **Adapters**.

> **Adapters translate external activity into normalized Sessions without introducing provider-specific concepts into the core product.**

Provider-specific information may be attached to a Session as additional data.

---

## 7. Product Principles

### Keep planning and execution separate

Timeboxes represent intention.

Sessions represent reality.

The system should never assume that planned time was actually performed.

### Keep the core simple

Projects, Checkpoints, Tasks, Timeboxes, and Sessions should remain the fundamental product concepts.

New integrations should adapt to these concepts instead of expanding the core domain unnecessarily.

### Prefer progress over productivity theater

The product should emphasize:

- meaningful work completed;
- actual time invested;
- progress toward Checkpoints;

rather than rewarding planning alone.

### Minimize management overhead

Creating Tasks, scheduling Timeboxes, and recording Sessions should be fast and lightweight.

The tool should help manage work, not become more work.

---

## 8. Out of Scope for the MVP

The MVP will not include:

- team collaboration;
- complex task dependencies;
- advanced project management;
- OKRs;
- gamification;
- AI planning;
- automatic scheduling;
- plugin marketplace;
- complex custom analytics.

---

## 9. Success Criteria

The MVP succeeds when a user can:

1. define their main Projects;
2. identify upcoming Checkpoints;
3. define the Tasks required to progress;
4. plan their week using Timeboxes;
5. record what they actually worked on through Sessions;
6. review whether their real effort matches their intentions.

The central question the product should answer is:

> **Am I spending my time on the things that matter, and am I making progress?**
