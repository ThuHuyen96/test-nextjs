# Prohibited Patterns & Phase 6 Constraints

## Prohibited Patterns

The following are **architectural violations**. Any future modification that introduces these patterns is incorrect, regardless of intent:

| # | Prohibited | Why |
|---|-----------|-----|
| 1 | Summarizing, truncating, or omitting any section of the Phase 8 Final Report | The report is a contract — every field is load-bearing; partial output is a breach |
| 2 | Writing all markup into a single declared output path when the planned template will exceed 80 lines | Violates the `component-too-large` hard invariant — component boundaries become implicit, reviewers scroll non-linearly, and split was always possible at plan time. Child paths must be declared and written BEFORE the parent shell. |

---

## Phase 6 — Full Specification

> **Ordering intent:** Memory captures markup quality — proven by sign-off and visual verification.
> This ordering is structural, not incidental. Do not reorder.

**Input contract — Phase 6 reads ONLY:**
- `markup_result` (from Phase 5: report_type, files, confidence, issues)

**Phase 6 MUST NOT read or condition on:**
- Any delivery or infrastructure signal — forbidden

**Invariant:** `memory = f(markup_result)`.
Phase 6 is the sole proof gate for memory.

---

Read `.agent/memories/CONTRIBUTING.md` for entry format rules.

**Quality gate — applies to "proven pattern" entries only:**

| Final task status | Confidence | Allowed memory writes |
|-------------------|------------|-----------------------|
| ✅ pass / minor_only | high or medium | All entry types (patterns + bugs + context) |
| ✅ pass / minor_only | low | Bug/defect entries only — **do NOT write proven patterns** |
| ❌ Escalated / incomplete | any | Bug/defect entries only — **do NOT write new "proven pattern" entries** |

Rationale: a pattern is only "proven" when quality was visually verified with sufficient confidence. A low-confidence pass cannot reliably establish a proven pattern — writing one encodes unverified markup into long-term system memory.

| Condition | Action |
|-----------|--------|
| New proven pattern *(only when status = pass/minor_only AND confidence = high or medium)* | Append → `learned-patterns.md` |
| New bug / defect *(always allowed)* | Append → `known-issues.md` |
| Known bug confirmed fixed | Update existing entry in `known-issues.md` |
| Output path or convention changed | Update `project-context.md` |
| Nothing new | Write "memory check: nothing new" |

**Do not skip.** The `[memory-check]` hook fires automatically after each `.vue` write as a reminder.

**Runtime invariant check:**
The orchestrator MUST track `memory_phase_executed` (boolean, default: `false`).
Set to `true` immediately after Phase 6 completes.

**Failure path:**
If Phase 6 fails for any reason (file write error, agent timeout, malformed entry format):
```
→ Set memory_phase_executed = true
→ Record the failure reason internally
→ Continue to Phase 8 — do NOT abort the pipeline
→ In Phase 8 report, append:
    ⚠️ Agent memory was not updated — review manually.
    Reason: {failure reason}
```
> Rationale: markup generation and verification are complete. Aborting here discards confirmed work over a recoverable side-effect failure. Memory loss is correctable by a human; task loss is not.
