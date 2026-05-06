# Report Templates

> ⛔ CONTRACT RULE: The Phase 8 Final Report MUST be output verbatim and in full.
> Every section (Files, Breakpoints, Visual confidence, Needs human review, Git, Playwright) is mandatory.
> Summarizing, reordering, or omitting any section is a prohibited pattern (see 03-prohibited-patterns.md #6).

---

## Files Field Rule

```
files = files_written_retry  (if Phase 4 ran and produced output)
      | files_written         (Phase 2, if no retry occurred)
```

---

## ✅ Markup complete (report_type = "pass", confidence = high or medium)

```
✅ Markup complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files created:
  - {file 1}
  - {file 2}

Breakpoints:
  XS : ✅ match  |  ⚠️ minor delta  |  ⏭ skipped (no link)
  SM : ...
  MD : ...
  LG : ...

Visual confidence : {high | medium}
Minor deltas      : {list, or "none"}
Needs human review:
  - {unverifiable items}

  — or —

Playwright:
  Status      : {playwright_result.status}
  Breakpoints : {playwright_result.breakpoints_checked.join(", ")}
  Visual match: {per-breakpoint visual_match values}
  Issues      : {playwright_result.issues (formatted list) | "none"}
  — or (if status = "infra_fail") —
  ⚠️ Visual verification skipped — infra failure
  Reason   : {playwright_result.abort_reason}
  Recovery : Ensure dev server is running and re-run /markup-task.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚠️ Markup complete with caveat (report_type = "minor_only_caveat", confidence = low)

```
⚠️ Markup complete — visual spot-check recommended
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files created:
  - {file 1}

Breakpoints:
  XS : ✅ match  |  ⚠️ minor delta  |  ⏭ skipped
  SM : ...
  MD : ...
  LG : ...

Visual confidence : LOW
  Reason: {2+ fetch failures | mostly dynamic states | ambiguous comparison}

Minor deltas      : {list, or "none"}
Needs human review:
  - Visual confidence is LOW — LLM inference only.
    Recommended: open the component in a browser and compare against Figma manually.
  - {other unverifiable items}

Playwright:
  Status      : {playwright_result.status}
  Breakpoints : {playwright_result.breakpoints_checked.join(", ")}
  Visual match: {per-breakpoint visual_match values}
  Issues      : {playwright_result.issues (formatted list) | "none"}
  — or (if status = "infra_fail") —
  ⚠️ Visual verification skipped — infra failure
  Reason   : {playwright_result.abort_reason}
  Recovery : Ensure dev server is running and re-run /markup-task.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ❌ Markup incomplete (report_type = "escalate")

```
❌ Markup incomplete — human review required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files written      : [list]
Attempts           : [N]/2
Visual confidence  : {high | medium | low}

Unresolved failures:
  [sign-off] [file]:[line] — [description]
    Suggested  : [fix]

  [visual] [breakpoint] — [issue]
    Figma shows : [description]
    Code does   : [description]
    Suspected   : {hypothesis or "unknown"}
    Suggested   : {next step for human}

Abort reason   : {no-progress | max-attempts | empty-retry | low-confidence | fetch-error | verifier-output-error}
Passed         : {list of passing breakpoints}
Minor deltas   : {list or "none"}

Playwright:
  Status         : {playwright_result.status}
  Abort reason   : {playwright_result.abort_reason | "—"}
  Breakpoints    : {playwright_result.breakpoints_checked.join(", ")}
  Critical count : {playwright_result.critical_count}
  Issues         : {playwright_result.issues (formatted list) | "none"}
  — or (if status = "infra_fail") —
  ⚠️ Visual verification skipped — infra failure
  Reason   : {playwright_result.abort_reason}
  Recovery : Ensure dev server is running and re-run /markup-task.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
