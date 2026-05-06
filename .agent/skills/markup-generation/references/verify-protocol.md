# Verify Protocol — Figma Screenshot vs Implementation

## Execution Context

This file has two consumers with different responsibilities:

| Consumer | Mode | Can modify files? | What this file provides |
|----------|------|-------------------|------------------------|
| `code-generator` (Phase 3, standalone) | Direct | ✅ Yes | Classification + standalone escalation format |
| `ui-verifier` agent (orchestrated) | Multi-agent | ❌ No — report only | Classification + output schema |

**In orchestrated mode:** The `ui-verifier` classifies and reports only. The orchestrator's Phase 5 retry loop owns all fix logic. Do not apply the "standalone escalation" below — use `ui-verifier.md §Output` instead.

**In standalone mode:** The code-generator runs this full protocol inline, including attempting fixes.

---

## Step 1 — Classify each mismatch

Examine the screenshot returned by MCP and compare against the Figma reference.

### Critical (must fix before sign-off)

| Type | Examples |
|------|---------|
| Wrong layout structure | flex → grid, column → row, element missing |
| Wrong proportion | aspect-ratio differs, card too wide or too narrow |
| Wrong breakpoint behavior | xs layout appears at md, sm layout does not trigger |
| Wrong component type | `<button>` instead of `SArrowButton`, `<p>` instead of `SText` |
| Wrong overflow / clip | content clipped when it should not be, or vice versa |
| Wrong z-index | overlay appears under content, nav is obscured |

### Minor (document, does not block sign-off)

| Type | Notes |
|------|-------|
| Spacing delta ≤ 4px | Token approximation — acceptable |
| Near-match color token | When Figma uses a raw hex that does not map to a token |
| Text truncation edge case | Depends on font rendering, not controllable |

### Cannot verify via screenshot

- Hover / focus / active states
- Transition / animation
- Keyboard navigation
- Dynamic data loading (skeleton → content)

→ Record in sign-off report under "Needs human review".

---

## Step 2 — Standalone fix loop (code-generator only — skip in orchestrated mode)

> **Orchestrated mode:** The orchestrator's Phase 5 manages all retries. Skip this step entirely.
> Return the classification result to the orchestrator via the `ui-verifier` output schema.

For each breakpoint with a Critical mismatch:

```
Attempt 1:
  - Identify root cause (layout? token? component?)
  - Apply a targeted fix — do not refactor the entire file
  - Re-fetch get_screenshot for that breakpoint
  - Compare again (Step 1)

If still Critical → Attempt 2:
  - Try a different approach (e.g. flex → grid, padding → margin)
  - Re-fetch get_screenshot
  - Compare again

If still Critical after Attempt 2 → go to Step 3 (Escalate)
```

**Limit:** Maximum 2 attempts per breakpoint. Do not loop indefinitely.

---

## Step 3 — Escalate (standalone mode — still failing after 2 attempts)

Stop. Report using this format — **do NOT proceed to sign-off**:

```
❌ Verify failed — human review required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Breakpoint  : {xs | sm | md | lg}
File        : [output_path]
Issue       : {short description — 1 sentence}

Figma shows : {what Figma displays}
Code does   : {what the implementation is doing}

Attempts    : 2/2 — root cause not identified
Suspected   : {hypothesis if available, or "unknown"}

Suggested next step:
  → {specific suggestion for a human}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 4 — Sign-off report (standalone mode — after verification complete)

```
✅ Verify complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files created  : [list]

Breakpoints:
  XS : ✅ match  |  ❌ escalated  |  ⚠️ minor delta  |  ⏭ skipped
  SM : ...
  MD : ...
  LG : ...

Minor deltas   : {list if any, or "none"}
Needs human review:
  - {hover/focus/animation states}
  - {escalated items if any}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Quick reference

| Result | Standalone action | Orchestrated action |
|--------|------------------|---------------------|
| All match | Sign-off and proceed | Report `pass` to orchestrator |
| Minor delta only | Document, sign-off | Report `minor_only` to orchestrator |
| Critical — fixable | Fix → re-verify → max 2 attempts | Report `critical_fail`; orchestrator retries |
| Critical — unfixable | Escalate → STOP | Report `critical_fail`; orchestrator escalates |
| Fetch error | STOP — see `preflight/SKILL.md §Error Format` | Mark breakpoint `skip`; report `critical_fail` if all skip |
