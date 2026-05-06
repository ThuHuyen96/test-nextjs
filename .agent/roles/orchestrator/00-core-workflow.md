# Orchestrator — Core Workflow

## Role
Coordinate the full Figma → Vue markup workflow.
Spawn sub-agents in sequence, manage the retry loop, produce the final report, and update agent memory.

## Setup
1. `.agent/memories/project-context.md`
2. `.agent/memories/known-issues.md`
3. `.agent/memories/learned-patterns.md`

## Input (from /markup-task or /markup)
```json
{
  "task_name":      "string | null — kebab-case name of the task file (e.g. \"bubblyz\"); null when invoked via /markup",
  "ticket_id":      "string",
  "ticket_type":    "feature | fix | chore | refactor | hotfix",
  "ticket_title":   "string",
  "target_branch":  "string",
  "mr_repo":        "\"origin\" | \"upstream\" | null (default: \"origin\")",
  "verify_commit":  "boolean (default: false) — true = run hooks; false = --no-verify",
  "figma_links":    { "xs": "url|null", "sm": "url|null", "md": "url|null", "lg": "url|null" },
  "output_paths":   { "components": [], "pages": [] },
  "references":     [],
  "description":    "...",
  "ui_lib":         "none",
  "dev_server_url": "string — pre-parsed by the command; default: \"http://localhost:5173\" if blank or absent",
  "local_component_dictionary": "string | null — full content of .agent/memories/local-components.md; null if file was absent at task launch"
}
```

**`dev_server_url` rule:**
Use the value passed directly in the input contract — the command has already parsed and defaulted it.
Do NOT re-read any file to obtain this value. If the value is absent or blank in the input → default to `"http://localhost:5173"`.
Store as orchestrator-level variable `dev_server_url` — passed unchanged to `playwright-verifier` in Phase 3.

---

## Reference Marker Legend

| Marker | Meaning |
|--------|---------|
| `→ [VALIDATE]` | Apply the named section from `01-validation-rules.md`. Rules are already loaded — recall and apply from context. |
| `→ [RENDER]` | Render output using the named template section from `02-report-templates.md`. |
| `→ [CONSTRAINTS]` | The named constraint from `03-prohibited-patterns.md` applies here. No additional action required — constraint is already loaded. |

---

## Workflow — strict order

### Phase 0 — Smoke test (before everything)

Run directly — do NOT spawn a sub-agent.

**Check 1 — Figma MCP connected:**
```
mcp__plugin_figma_figma__whoami()
```
- Success → continue
- Fail → STOP:
  ```
  ❌ Figma MCP not connected.
     Fix: Open Figma Desktop → confirm the plugin is running → retry.
  ```

**Check 2 — Output directory exists:**

Derive `output_root`:
- Use the longest common path prefix of all entries in `output_paths`.
- If no common prefix exists, check each root path independently.

```bash
ls [output_root]
```
- Exists → continue
- Does not exist → STOP:
  ```
  ❌ Output directory does not exist: [output_root]
     Fix: Create the directory first, or verify output_paths in .agent/tasks/<task-name>.md.
  ```

Both checks pass → proceed to Phase 1.

---

### Phase 1 — Preflight

Spawn: `preflight-validator`
Pass: `figma_links`, `output_paths`, `references`, `description`, `ui_lib`

Receive:
```json
{
  "status": "pass | fail",
  "figma_links_count": 2,
  "figma_file_key": "[fileKey]",
  "design_data": {
    "figma_links":    { "xs": "url", "sm": null, "md": "url", "lg": null },
    "figma_node_ids": { "xs": "12301:177764", "sm": null, "md": "22500:888", "lg": null },
    "aspect_ratios":  { "xs": "aspect-[w/h]", "sm": null, "md": "aspect-[w/h]", "lg": null },
    "design_context": { "xs": "...", "sm": null, "md": "...", "lg": null },
    "screenshots":    { "xs": "...", "sm": null, "md": "...", "lg": null }
  }
}
```

→ [VALIDATE] Apply [`01-validation-rules.md §Schema Validation Contract`](01-validation-rules.md#schema-validation-contract)
Required: `status`, `figma_file_key`, `design_data`.
Enum: `status ∈ {"pass", "fail"}`.

`status = "fail"` → STOP. Show the error to the user. Do not continue.

---

### Phase 2 — Code Generation

Spawn: `code-generator`
Pass:
```json
{
  "design_data": {
    "figma_links":    { "xs": "url|null", "sm": "url|null", "md": "url|null", "lg": "url|null" },
    "figma_node_ids": { "xs": "string|null", "sm": "string|null", "md": "string|null", "lg": "string|null" },
    "aspect_ratios":  { "xs": "string|null", "sm": "string|null", "md": "string|null", "lg": "string|null" },
    "design_context": { "xs": "string|null", "sm": "string|null", "md": "string|null", "lg": "string|null" },
    "screenshots":    { "xs": "string|null", "sm": "string|null", "md": "string|null", "lg": "string|null" }
  },
  "output_paths": { "components": [], "pages": [] },
  "references":   [],
  "description":  "...",
  "ui_lib":       "none",
  "fix_context":  null,
  "local_component_dictionary": "{local_component_dictionary — pass unchanged from orchestrator input; null if absent}"
}
```
> Pass all five `design_data` maps **exactly as received from Phase 1** — do NOT re-fetch, reconstruct, or abbreviate any field.
> Pass `local_component_dictionary` unchanged from the orchestrator input — never re-read the file.

Receive:
```json
{ "status": "done", "files_written": ["markup/components/Feature/MyComp.vue"] }
```

→ [VALIDATE] Apply [`01-validation-rules.md §Schema Validation Contract`](01-validation-rules.md#schema-validation-contract)
Required: `status`, `files_written`.
Enum: `status ∈ {"done"}`.

`files_written` is empty (`[]` or null) → STOP immediately:
```
❌ Code generator produced no files.
   Abort reason : empty-output
   Fix          : Verify that design_data is complete and output_paths in .agent/tasks/<task-name>.md
                  point to an existing directory. Re-run /markup-task after correcting the paths.
```

→ [VALIDATE] Apply [`01-validation-rules.md §Path Integrity Check`](01-validation-rules.md#path-integrity-check)   ← Phase 2 only

---

### Phase 3 — Parallel Verification

Spawn **all three agents simultaneously**:

**sign-off-checker:**
```json
{
  "files_written":        ["...from Phase 2"],
  "ui_lib":               "none",
  "figma_links_count":    {preflight.figma_links_count},
  "breakpoints_present":  ["xs", "md"]
}
```
`breakpoints_present` = keys from `preflight.design_data.figma_node_ids` where the value is non-null (e.g. xs+md only → `["xs", "md"]`).

Returns:
```json
{
  "status": "pass | fail",
  "issues": [{ "severity": "critical|minor", "file": "...", "line": null, "rule": "...", "description": "...", "fix": "..." }]
}
```
→ [VALIDATE] Apply [`01-validation-rules.md §Schema Validation Contract`](01-validation-rules.md#schema-validation-contract)
Required: `status`. If `issues` is null → treat as `[]`.
Enum: `status ∈ {"pass", "fail"}`, `severity ∈ {"critical", "minor"}`.

---

**ui-verifier:**
```json
{
  "files_written": ["...from Phase 2"],
  "design_data": {
    "figma_file_key": "{fileKey from Phase 1}",
    "figma_node_ids": { "xs": "12301:177764", "sm": null, "md": "22500:888", "lg": null },
    "screenshots":    { "xs": "...", "sm": null, "md": "...", "lg": null }
  },
  "ui_lib": "none"
}
```
(null = no link for that breakpoint)

Returns:
```json
{
  "status": "pass | critical_fail | minor_only",
  "confidence": "high | medium | low",
  "results": {
    "xs": { "status": "pass|fail|minor|skip", "issues": [] },
    "sm": { "status": "pass|fail|minor|skip", "issues": [] },
    "md": { "status": "pass|fail|minor|skip", "issues": [] },
    "lg": { "status": "pass|fail|minor|skip", "issues": [] }
  },
  "unverifiable": ["hover states", "animation"]
}
```
→ [VALIDATE] Apply [`01-validation-rules.md §Schema Validation Contract`](01-validation-rules.md#schema-validation-contract)
Required: `status`, `confidence`, `results`.
Enum: `status ∈ {"pass", "critical_fail", "minor_only"}`, `confidence ∈ {"high", "medium", "low"}`.
Per-breakpoint enum: `status ∈ {"pass", "fail", "minor", "skip"}`.

`confidence` is used in Phase 4 Pre-check and Phase 5 Confidence gate — orchestrator must retain this value.

---

**playwright-verifier:**
```json
{
  "preview_routes":    ["derived from output_paths.pages — strip \"markup/pages\" prefix + \".vue\" suffix"],
  "breakpoints":       { "xs": "360px", "sm": "768px", "md": "1024px", "lg": "1440px" },
  "figma_screenshots": { "xs": "...", "sm": null, "md": "...", "lg": null },
  "dev_server_url":    "[dev_server_url]"
}
```
`figma_screenshots` = `preflight.design_data.screenshots` passed through unchanged.
`preview_routes` derivation is performed by the orchestrator before spawning — never by the agent.
`dev_server_url` = orchestrator-level variable parsed from `.agent/tasks/<task-name>.md §1.1 Config & Git`. Never hardcode this value.

Returns: `playwright_result`
```json
{
  "status": "pass | critical_fail | minor_only | infra_fail",
  "abort_reason": "string | null",
  "breakpoints_checked": ["xs", "sm", "md", "lg"],
  "results": { "<bp>": { "screenshot_captured": true, "console_errors": 0, "visual_match": "...", "issues": [] } },
  "critical_count": 0,
  "issues": []
}
```
→ [VALIDATE] Apply [`01-validation-rules.md §Schema Validation Contract`](01-validation-rules.md#schema-validation-contract)
Required: `status`, `critical_count`, `results`.
Enum: `status ∈ {"pass", "critical_fail", "minor_only", "infra_fail"}`.

Wait for **all three** to complete before proceeding.

**Routing — evaluated immediately after all three results are received:**

**Step A — Playwright conflict resolution (evaluate FIRST, before retry trigger):**
```
IF ui-verifier.status = "critical_fail"
   AND playwright_result.status = "pass"
   AND playwright_result.status ≠ "infra_fail"
   AND sign-off.status = "pass":
  → playwright_result is ground truth — trust it over ui-verifier inference
  → Downgrade all ui-verifier critical issues to "inference_only" in the Phase 8 report
  → Do NOT trigger Phase 4 based on ui-verifier alone
  → Proceed directly to Phase 5
  → Append to Phase 8 report:
      ⚠️ ui-verifier reported critical_fail but playwright-verifier passed.
         ui-verifier issues demoted to inference_only — no retry triggered.
         Recommend manual spot-check against Figma.
```

**Step B — Infra failure handling:**
```
IF playwright_result.status = "infra_fail":
  → Non-blocking: log abort_reason, continue evaluation below
  → Append ⚠️ infra failure note to Phase 8 report
```

**Step C — Retry trigger (evaluated only after Steps A and B):**
```
IF sign-off.status = "fail"
   OR ui-verifier.status = "critical_fail"        ← only if NOT downgraded in Step A
   OR playwright_result.status = "critical_fail":
  → Proceed to Phase 4 (Retry loop)
ELSE:
  → Phase 4 does not trigger
  → Proceed directly to Phase 5
```

---

### Phase 4 — Retry loop

**Constants (defined once — referenced throughout this phase):**
```
MAX_RETRY_ATTEMPTS = 2
```

**Trigger:** `sign-off status = "fail"` OR `ui-verifier status = "critical_fail"` OR `playwright_result.status = "critical_fail"`

#### Guard — Fetch-error short-circuit (check before everything else)

Before evaluating confidence or compiling fix_context, inspect the ui-verifier result:

```
IF ui-verifier.status = "critical_fail"
   AND every breakpoint issue description contains "fetch error"
   AND sign-off.status = "pass":
  → This is a connectivity failure, not a code defect — retry cannot help
  → Skip the retry loop entirely
  → Go directly to Phase 5 (Escalate) with abort reason: "fetch-error"
```

If sign-off also failed (real code issues exist) → do NOT apply this guard; proceed to retry normally so code issues get a fix attempt.
If any breakpoint has a non-fetch-error critical issue → do not apply this guard; continue normally.

#### Pre-check — Low confidence short-circuit

Before any retry work, check the ui-verifier confidence:

```
IF ui-verifier.confidence = "low" AND ui-verifier.status = "critical_fail"
   AND sign-off.status = "pass":
  → Skip the retry loop entirely
  → Go directly to Phase 5 (Escalate) with abort reason: "low-confidence"
  → Rationale: low confidence means the verifier cannot reliably assess the implementation;
    retrying would produce equally unreliable results
```

If sign-off also failed (real code issues exist) → do NOT apply this guard; proceed to retry normally so sign-off issues get a fix attempt.
If confidence = "high" or "medium" → proceed to Step 1.

#### Step 1 — Capture baseline (orchestrator internal — not passed to agents)

Record the following for progress tracking only:
```
playwright_was_infra_fail = (playwright_result.status = "infra_fail")

critical_count_before =
  (sign-off issues where severity = "critical").length
  + (ui-verifier results where breakpoint status = "fail").length
  + playwright_result.critical_count
```

> **`playwright_was_infra_fail` flag:** When Playwright was unreachable in Phase 3
> (contributing 0 to `critical_count_before`), it may become reachable during retry and
> report real issues. Those new issues must NOT be counted against progress — Playwright
> becoming available is not regression. This flag is read in Step 3 to adjust the comparison.

#### Step 2 — Compile `fix_context` and spawn retry

**Pre-spawn file existence check (run before compiling fix_context):**

Verify every file from the previous `files_written` (or `files_written_retry`) still exists on disk:
```bash
# Run once per file in files_to_fix
ls [file_path]
```
- All files found → proceed
- Any file missing → STOP immediately:
  ```
  ❌ Retry aborted: file expected from Phase 2 no longer exists.
     Missing: [file_path]
     Cause: a hook, external process, or manual deletion removed it between phases.
     error_code: "retry-file-missing"
  ```

| Step | Action |
|------|--------|
| Compile `fix_context` | Merge failures from sign-off-checker, ui-verifier, and playwright-verifier (schema below) |
| Spawn `code-generator` | Pass full input below; receive `files_written_retry` |
| **Empty `files_written_retry`** | **STOP — go directly to Phase 5 (Escalate)** |
| Spawn parallel | `sign-off-checker` + `ui-verifier` + `playwright-verifier` — schemas below |

→ [VALIDATE] Apply [`01-validation-rules.md §Schema Validation Contract`](01-validation-rules.md#schema-validation-contract) to all retry agent responses (same schemas as Phase 3).

**Retry code-generator input:**
```json
{
  "design_data": {
    "figma_links":    { "xs": "url|null", "sm": "url|null", "md": "url|null", "lg": "url|null" },
    "figma_node_ids": { "xs": "string|null", "sm": "string|null", "md": "string|null", "lg": "string|null" },
    "aspect_ratios":  { "xs": "string|null", "sm": "string|null", "md": "string|null", "lg": "string|null" },
    "design_context": { "xs": "string|null", "sm": "string|null", "md": "string|null", "lg": "string|null" },
    "screenshots":    { "xs": "string|null", "sm": "string|null", "md": "string|null", "lg": "string|null" }
  },
  "output_paths": { "components": [], "pages": [] },
  "references":   [],
  "description":  "...",
  "ui_lib":       "none",
  "local_component_dictionary": "{same value passed in Phase 2 — never re-read}",
  "fix_context": {
    "attempt": 1,
    "failures": [
      { "source": "sign-off",   "file": "...", "line": 42, "rule": "...", "description": "...", "fix": "..." },
      { "source": "visual",     "breakpoint": "xs", "issue": "...", "figma_shows": "...", "code_does": "..." },
      { "source": "playwright", "route": "/test/demo", "breakpoint": "lg", "description": "...", "severity": "critical" }
    ],
    "files_to_fix": ["path/to/file.vue"]
  }
}
```
> `design_data`, `output_paths`, `references`, `description`, `ui_lib` MUST be passed unchanged from the Phase 2 input. Only `fix_context` changes between attempts — `attempt` increments, `failures` reflects the latest checker results.

**Retry sign-off-checker input:**
```json
{
  "files_written":        ["...from files_written_retry"],
  "ui_lib":               "none",
  "figma_links_count":    {preflight.figma_links_count},
  "breakpoints_present":  ["xs", "md"]
}
```
Same `breakpoints_present` as Phase 3 — derived from `preflight.design_data.figma_node_ids` (non-null keys).

**Retry ui-verifier input:**
```json
{
  "files_written": ["...from files_written_retry"],
  "design_data": {
    "figma_file_key": "{fileKey from Phase 1}",
    "figma_node_ids": { "xs": "12301:177764", "sm": null, "md": "22500:888", "lg": null },
    "screenshots":    { "xs": "...", "sm": null, "md": "...", "lg": null }
  },
  "ui_lib": "none"
}
```

Note: Reuse exact values from Phase 1 `design_data` — do NOT re-fetch from Figma. The ui-verifier fetches its own fresh screenshots internally (see `ui-verifier.md §Steps`).

**Retry playwright-verifier input:** Same as Phase 3 — pass identical `preview_routes`, `breakpoints`, `figma_screenshots`, and `dev_server_url`. Do not mutate these fields between attempts.

#### Step 3 — Check forward progress before allowing attempt 2

Compute `critical_count_after` and `comparison_count_after`:
```
critical_count_after =
  (new sign-off issues where severity = "critical").length
  + (new ui-verifier results where breakpoint status = "fail").length
  + new_playwright_result.critical_count

// When Playwright was infra_fail in Phase 3, its new criticals are EXCLUDED from the
// progress comparison — Playwright becoming available is not regression in the code.
// They remain in fix_context.failures[] so the code-generator can still address them.
comparison_count_after =
  (new sign-off issues where severity = "critical").length
  + (new ui-verifier results where breakpoint status = "fail").length
  + (IF playwright_was_infra_fail THEN 0 ELSE new_playwright_result.critical_count)
```

```
// Evaluate in this exact order — do not reorder cases.

IF critical_count_after = 0:
  → All critical issues resolved (including the case where critical_count_before was also 0)
  → Go to Phase 5 (pass/minor_only)

IF comparison_count_after > 0 AND comparison_count_after >= critical_count_before:
  → No progress made
  → ABORT immediately — do NOT attempt a second retry
  → Go to Phase 5 (Escalate)
  → Add to report: "Retry attempt 1 made no progress
    (critical before: [critical_count_before], after: [comparison_count_after])"

IF comparison_count_after > 0 AND comparison_count_after < critical_count_before AND attempt < MAX_RETRY_ATTEMPTS:
  → Progress made, issues remain — re-evaluate infra-only guards before spawning attempt 2:

    Guard priority: fetch-error is evaluated first; low-confidence second.

    IF new sign-off.status = "pass"
       AND every new ui-verifier breakpoint issue description contains "fetch error":
      → Remaining failure is infra-only — retry cannot help
      → ABORT attempt 2 → go to Phase 5 (Escalate) with abort reason: "fetch-error"

    IF new sign-off.status = "pass"
       AND new ui-verifier.confidence = "low"
       AND new ui-verifier.status = "critical_fail":
      → Remaining failure is low-confidence — retry cannot help
      → ABORT attempt 2 → go to Phase 5 (Escalate) with abort reason: "low-confidence"

  → If neither guard fires: increment attempt counter; go to Step 2 (second retry)

IF comparison_count_after > 0 AND attempt >= MAX_RETRY_ATTEMPTS:
  → Max attempts reached — progress or not, issues remain
  → Go to Phase 5 (Escalate)
  → Add to report: "Max retry attempts reached ([MAX_RETRY_ATTEMPTS]/[MAX_RETRY_ATTEMPTS])
    (critical before: [critical_count_before], after: [comparison_count_after])"
```

> **Zero-baseline invariant:** `critical_count_after = 0` is evaluated first and always routes to pass, including the edge case where `critical_count_before = 0`. The `>= critical_count_before` comparison only executes when `comparison_count_after > 0`, eliminating the false-escalation bug where `0 >= 0` previously triggered "no progress."

**Hard limit:** Maximum `MAX_RETRY_ATTEMPTS` total retry attempts. Still failing after attempt `MAX_RETRY_ATTEMPTS` → Phase 5 (Escalate).

`fix_context` schema (passed to `code-generator`):
```json
{
  "attempt": 1,
  "failures": [
    { "source": "sign-off",   "file": "...", "line": 42, "rule": "...", "description": "...", "fix": "..." },
    { "source": "visual",     "breakpoint": "xs", "issue": "...", "figma_shows": "...", "code_does": "..." },
    { "source": "playwright", "route": "/test/demo", "breakpoint": "lg", "description": "...", "severity": "critical" }
  ],
  "files_to_fix": ["path/to/file.vue"]
}
```
Include only `playwright_result.issues` entries where `severity = "critical"` in the `failures[]` array.

Note: `critical_count_before` / `critical_count_after` are orchestrator-internal tracking values and are **not included** in `fix_context`.

---

### Phase 5 — Evaluate Result (internal)

Evaluate `ui-verifier.confidence` and store `markup_result`. This phase produces **no user-facing output** — all reporting is deferred to Phase 8.

#### Confidence gate — two-case rule

```
CASE A — confidence = "low" AND status = "critical_fail":
  → markup_result.report_type = "escalate"
  → Reached via two paths:
     (a) Phase 4 Pre-check short-circuit (sign-off passed, no retry attempted), OR
     (b) Post-retry escalation (sign-off also failed, retry ran, issues remain).

CASE B — confidence = "low" AND status IN ("pass", "minor_only"):
  → markup_result.report_type = "minor_only_caveat"
  → Task is COMPLETE — do NOT escalate.

CASE C — confidence IN ("high", "medium"):
  IF ui-verifier.status = "pass"            → markup_result.report_type = "pass"
  IF ui-verifier.status = "minor_only"      → markup_result.report_type = "pass"
                                               (minor deltas are captured and rendered in Phase 8)
  IF ui-verifier.status = "critical_fail"   → markup_result.report_type = "escalate"

DEFAULT — confidence is null, missing, or not in {"high", "medium", "low"}:
  → markup_result.report_type = "escalate"
  → markup_result.abort_reason = "verifier-output-error"
  → Log: "ui-verifier returned unrecognized confidence value: [value]"
```

#### Store markup_result (internal — not user-facing)

```json
{
  "report_type":         "pass | minor_only_caveat | escalate",
  "files":               ["markup/components/..."],
  "breakpoints":         { "xs": "pass|minor|skip", "sm": "...", "md": "...", "lg": "..." },
  "confidence":          "high | medium | low",
  "minor_deltas":        ["list or empty"],
  "unverifiable":        ["hover states", "animation"],
  "abort_reason":        "no-progress | max-attempts | empty-retry | low-confidence | fetch-error | verifier-output-error | null",
  "unresolved_failures": []
}
```

→ Proceed to Phase 6.

---

### Phase 6 — Update agent memory

→ [CONSTRAINTS] Apply [`03-prohibited-patterns.md §Phase 6 — Full Specification`](03-prohibited-patterns.md#phase-6--full-specification)

→ Proceed to Phase 8.

---

### Phase 8 — Final Report

Consolidate `markup_result` (Phase 5) and `playwright_result` (Phase 3) into the single user-facing output.

`files = files_written_retry` (if Phase 4 ran and produced output) or `files_written` (Phase 2, if no retry occurred).

If `task_name` is non-null, include it as the first line of every report template:
```
Task       : [task_name]   ← render only when task_name is non-null
```

> ⛔ **CRITICAL RENDER RULE:** You MUST render the selected template VERBATIM.
> Do NOT summarize, paraphrase, or omit any markdown structural elements
> (such as `━━━━━━━━━` lines, bullet points, or exact indentation).
> You must output the exact text layout defined in `02-report-templates.md`,
> simply replacing the `[variables]` with their current values.

Route by `markup_result.report_type`:

```
IF report_type = "pass":
  → [RENDER] [`02-report-templates.md §✅ Markup complete`](02-report-templates.md) with (markup_result, playwright_result)

IF report_type = "minor_only_caveat":
  → [RENDER] [`02-report-templates.md §⚠️ Markup complete with caveat`](02-report-templates.md) with (markup_result, playwright_result)

IF report_type = "escalate":
  → [RENDER] [`02-report-templates.md §❌ Markup incomplete`](02-report-templates.md) with (markup_result, playwright_result)
```
