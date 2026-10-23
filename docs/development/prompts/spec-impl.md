Read and implement the approved specification **`docs/specs/NNN_feature_name.md`**.

Use the specification as the source of truth for requirements, scope, and implementation decisions.

Follow these guidelines:

1. **Requirements:** Implement the specified behavior, business rules, user flows, and error states. Respect non-goals and prerequisite specifications.
2. **Consistency:** Follow the applicable `AGENTS.md` instructions and existing project architecture, conventions, and patterns. Read `docs/DESIGN.md` before UI work and `docs/TESTING.md` before planning tests.
3. **Scope:** Keep changes focused on the specification. Avoid unrelated refactors, new requirements, or speculative abstractions.
4. **Ambiguities:** Identify unresolved questions, conflicting requirements, and blockers. Ask for clarification before implementing affected behavior or deviating from the specification.
5. **Validation:** Add or update meaningful tests for the specified behavior and run the relevant project checks. Report failures and any verification that could not be completed.

**Workflow:**
- Read the complete specification, its dependencies, and the relevant project context and code.
- Confirm that the specification is approved and its prerequisites are satisfied. Raise any material ambiguities or blockers before proceeding.
- Create a concise implementation plan artifact based on the specification and request approval before changing application code, unless that plan has already been approved.
- Execute the approved plan, tracking progress in a task artifact, and update the specification status to `In Progress`.
- Validate the implementation against the specification's goals, business rules, and testing strategy. Complete applicable automated checks and manual verification where possible.
- Update the specification's progress and `Updated` date. Mark it `Done` only when implementation and required validation are complete; otherwise, record the remaining work.
- Do not commit, push, or open a pull request unless requested.

**Expected output:** A working implementation of the specification, relevant tests, and an updated specification, accompanied by a concise summary of changes, validation results, and any remaining blockers.
