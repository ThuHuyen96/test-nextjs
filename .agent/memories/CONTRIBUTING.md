# Agent Memory — Contribution Guide

How the agent should append to memory files. Read this file when the `[memory-check]` hook fires.

---

## When to Update

| Situation | Action |
|-----------|--------|
| Implemented a new pattern that works correctly **and the full pipeline passed (sign-off + visual verify)** | Append to `learned-patterns.md` |
| Encountered a bug or defect not yet in known-issues | Append to `known-issues.md` |
| Fixed a bug from known-issues and confirmed the fix | Update the existing entry in `known-issues.md` |
| Output path or convention changed | Update `project-context.md` |
| Nothing new | Do nothing — note "memory check: nothing new" |

**Quality gate — Pattern writes only on task pass:**
Only append to `learned-patterns.md` when the full pipeline has passed (sign-off + visual verify).
If the task is escalated or incomplete → write to `known-issues.md` only.
A "proven pattern" must be validated end-to-end before being recorded.

---

**Do not duplicate** existing entries. Grep before appending.

---

## learned-patterns.md — New Entry Format

```markdown
## [N]. {Short pattern name}
<!-- status: active -->

Use when: {condition / when to apply this pattern}

​```vue
{code example — minimal but sufficient to understand the pattern}
​```

Key points:
- {important point 1}
- {important point 2}
```

**Good title examples:**
- "Skeleton loading card with aspect-ratio"
- "Dialog with full-bleed background image"
- "Tabs with lazy-loaded panels"

---

## Pattern Lifecycle — Status Field

Every pattern entry carries a `<!-- status: ... -->` comment on the line immediately after the `## N. Title` heading.

| Status | Meaning | When to assign |
|--------|---------|----------------|
| `active` | Current best practice — use this | Default for all new entries |
| `deprecated-by: N` | Superseded by pattern #N — do not use | When a newer pattern replaces this one |
| `supersedes: N` | This pattern replaces pattern #N | Add when writing a replacement pattern |

### How to supersede a pattern

When a task reveals that an existing pattern is wrong or outdated:

1. **Find** the old pattern number (e.g. `## 17.`).
2. **Change its status** from `active` to `deprecated-by: [new_number]`:
   ```markdown
   ## 17. Old pattern name
   <!-- status: deprecated-by: 22 -->
   ```
3. **Write the new pattern** at the end with its sequential number and:
   ```markdown
   ## 22. New pattern name
   <!-- status: active | supersedes: 17 -->
   ```
4. **Do not delete** the old entry — it documents what NOT to do and why.

### Reading status before using a pattern

Before referencing a pattern in generated code:
1. Check the `<!-- status: ... -->` line.
2. If `deprecated-by: N` → read pattern #N instead.
3. If `active` → use as-is.

**Never write `deprecated-by:` without also writing the replacement pattern in the same memory update.**

---

## known-issues.md — New Entry Format

```markdown
## {Short issue name — searchable}
<!-- status: open -->

**Incident:** {brief description of when / where it occurred}

**Root cause:** {why it happened}

**Fix:** {how it was fixed — link to file if applicable}

**Rule:**
{short rule to prevent recurrence}
```

---

## known-issues.md — Status Field

Add a `<!-- status: ... -->` comment on the line immediately after the `## Issue name` heading.

| Status | Meaning | When to assign |
|--------|---------|----------------|
| `open` | Still an active risk — agents must watch for this | Default for all new entries |
| `mitigated-by: [mechanism]` | A rule, grep check, or skill is in place that catches it automatically | When the sign-off-checker, forbidden-patterns, or a skill enforces the fix |
| `resolved-by: {pattern-N or commit}` | Fully addressed — the fix is documented in a pattern | When a learned-pattern codifies the solution |

**Do not delete issues with `mitigated-by` or `resolved-by` status.** They document WHY a rule exists.

**Agents reading known-issues.md:** Issues marked `mitigated-by` or `resolved-by` are background context only — do not treat them as unresolved warnings requiring extra caution. Focus active attention on `open` issues.

**Good title examples:**
- "SText: missing `role` prop → text has no semantic meaning"
- "SButton inside SwiperSlide clipped by overflow"

---

## Format Validation — Required Before Appending

Before writing a new entry, self-check against this schema:

### known-issues.md entry must have:
- `## {Issue name}` — heading level 2
- `**Incident:**` or `**Issue:**` — when / where it occurred
- `**Root cause:**` — cause (write "Unknown" if unclear)
- `**Fix:**` — how it was fixed
- `**Rule:**` — short rule to prevent recurrence
- End with a `---` separator

### learned-patterns.md entry must have:
- `## [N]. {Pattern name}` — sequential number
- "Use when: ..." description or context block
- Code example (vue / ts / css block)
- At least one "Key points:" bullet

### Validate After Appending:
```bash
# Titles must not be duplicated
grep "^## " .agent/agent-memory/known-issues.md | sort | uniq -d
grep "^## " .agent/agent-memory/learned-patterns.md | sort | uniq -d
# Empty output = no duplicates
```

---

## Workflow When the Hook Fires

1. **Grep** — check whether a similar entry already exists:
   ```bash
   grep -n "[keyword]" .agent/agent-memory/learned-patterns.md
   grep -n "[keyword]" .agent/agent-memory/known-issues.md
   ```

2. **Evaluate** — is this pattern or issue general enough to be reused in another component?
   - Only record things that could recur in a different component.
   - Do not record business logic or hardcoded data specific to one component.

3. **Append** if needed — use the Edit tool; append to the end of the relevant file.

4. **Confirm** — add a short comment: `"memory updated: {entry name}"` or `"memory check: nothing new"`
