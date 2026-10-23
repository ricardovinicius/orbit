# Build shared application layout components

## Context

The main app still uses the default Next.js starter page. Implement a reusable application layout based on the existing prototype so feature screens share consistent navigation, spacing, and responsive behavior.

Follow `docs/DESIGN.md` and use shadcn components where applicable.

## Requirements

- Create a shared application shell with a sidebar and main content area.
- Include Orbit branding, primary navigation, and a project navigation section.
- Support expanded and collapsed sidebar states on desktop.
- Provide accessible navigation on mobile.
- Highlight the active navigation item, including nested routes.
- Provide reusable page header and content containers, supporting titles, descriptions, and page actions.
- Keep navigation and layout controls separate from feature business logic.
- Keep authentication screens outside the application shell.
- Use placeholder content where feature screens or data integrations are not available. Backend integration is outside this issue’s scope.

## Acceptance Criteria

- [ ] Application pages reuse the shared layout without duplicating navigation.
- [ ] The layout follows the prototype’s visual structure and project design guidelines.
- [ ] Desktop users can expand and collapse the sidebar.
- [ ] Navigation remains usable on mobile and short desktop viewports.
- [ ] The active page is clearly identified in navigation.
- [ ] Navigation controls support keyboard interaction, accessible labels, and visible focus states.
- [ ] Long page content and navigation lists scroll without hiding essential controls or overlapping content.
- [ ] Page headers support optional descriptions and actions.
- [ ] Authentication pages render independently of the application shell.
- [ ] Relevant checks pass, with navigation behavior covered according to `docs/TESTING.md`.
