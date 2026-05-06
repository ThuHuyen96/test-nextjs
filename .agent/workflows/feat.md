---
description: End-to-end workflow for developing a new feature or executing a technical task.
---

# Feature / Technical Task Workflow

## Phase 1: Planning

1. **Understand requirements**: Read the user's description, linked issues, or Figma designs.
2. **Resolve skill dependencies**: Check if any relevant skill has `depends_on` in its frontmatter. Load all dependency skills BEFORE the primary skill.
3. **Create Implementation Plan**: Structure the work into concrete sub-tasks. Present the plan as a `<plan>` block explaining: affected files, data flow, and which skills/patterns apply.
4. **Get user approval** before proceeding to execution.

## Phase 2: Scaffolding

5. **Create branch**: Use naming convention `ai-agent/<owner>/<task-slug>` (e.g., `ai-agent/ryan/board-filters`).
6. **Generate boilerplate**: Use relevant stack skills from `.agent/skills/`.

## Phase 3: Implementation

7. **Implement core logic**: Follow patterns from relevant skills.
8. **Apply checklists incrementally** — don't wait until the end.
9. **Verify Compilation**: ALWAYS run the `next-compile` skill to check for build errors immediately after editing code.
10. **Self-review**: Run through the `quality-audit` skill before moving on.

## Phase 4: Testing & Verification

11. **Run tests**: Use the project's test runner (Vitest, JUnit, etc.).
12. **Accessibility check**: Run a11y audit for UI changes.

### Recovery Protocol (ReAct Loop)

If any test or check fails in Phase 4:

1. **Analyze**: Read the error output. Classify root cause:
   - `logic` — bug in implementation code
   - `mock` — test setup or fixture issue
   - `config` — build/env/dependency mismatch
2. **Fix**: Apply a targeted, surgical patch addressing ONLY the classified root cause. Do NOT refactor unrelated code.
3. **Re-verify**: Run ONLY the previously failing test to confirm the fix.
4. **Max retries**: 3 attempts per failing test.
5. **Escalate**: If still failing after 3 attempts, **STOP** immediately. Present the following to the user:
   - The original error message
   - All 3 fix attempts and why each failed
   - Your best hypothesis for the root cause
   - Do NOT proceed to Phase 5.

## Phase 5: Finalization

12. **Verify coding conventions**: Run `quality-audit` and `coding-conventions` skills against all changed files. Fix violations.
13. **Present summary** to user with what was done and remaining trade-offs.

## Batch Mode (Multiple Related Tickets)

When processing 3+ related tickets in a single session:

### Planning
- Create ONE implementation_plan covering ALL tickets
- Prioritize by dependency: shared components → sections → pages
- Map all Figma node IDs upfront

### Assets
- Download ALL Figma reference screenshots before implementing any component
- Store in respective `features/*/assets/` directories

### Implementation
- Implement in dependency order, not ticket number order
- Reuse patterns from first completed ticket for subsequent ones
- Use `task.md` with per-ticket checkboxes

### Verification
- Verify each component individually in Storybook
- Use `figma-visual-verify` skill for side-by-side comparison
- Single commit for the entire batch if tickets are cohesive

### Reporting
- Single walkthrough covering all tickets
- Summary table: ticket → status → key changes
