# Validation Rules

## Schema Validation Contract

This contract applies to **every sub-agent response** in the pipeline. The orchestrator MUST validate all received responses before acting on them.

### Validation steps (apply after every `Receive:` block)

**Step 1 — Parseability:**
Response must be valid, parseable structured data.
If unparseable → STOP:
```
❌ Agent [name] returned unparseable output at Phase [N].
   Recovery: Re-run /markup-task. If this recurs, inspect the agent definition.
```

**Step 2 — Required fields:**
All required fields must be present and non-null.
If any required field is missing or null → STOP:
```
❌ Agent [name] returned malformed output: field "[field]" is missing or null.
   Recovery: Re-run /markup-task.
```

**Step 3 — Enum values:**
Fields with defined enum values must contain only listed values.
If an unrecognized value is found → STOP:
```
❌ Agent [name] returned unexpected value "[value]" for field "[field]".
   Expected: {enum values}
   Recovery: Re-run /markup-task.
```

**Step 4 — Type assertions:**
Fields with a declared runtime type must match that type exactly. Type coercion is not permitted.
If a type mismatch is found → STOP:
```
❌ Agent [name] returned type mismatch: field "[field]" expected [expected_type], got [actual_type].
   Recovery: Re-run /markup-task.
```

Mandatory type checks applied at every boundary:

| Field | Expected type | Notes |
|-------|--------------|-------|
| `files_written` | Array of strings | A bare string or `null` is a violation |
| `issues` | Array of objects, or absent | A bare string or non-array object is a violation |
| `results` | Object (keyed by breakpoint) | An array is a violation |
| `design_data` | Object | An array or string is a violation |
| `issues[].severity` | String matching enum | `null` severity fails enum check (Step 3) and type check here |
| `playwright_result.status` | String matching enum | `"pass"` \| `"critical_fail"` \| `"minor_only"` \| `"infra_fail"` — any other value fails Steps 3 and 4 |
| `playwright_result.abort_reason` | `string \| null` | Must be non-null when `status = "infra_fail"`; must be `null` otherwise |
| `playwright_result.results` | Object keyed by breakpoint | An array is a violation |
| `playwright_result.critical_count` | Integer ≥ 0 | String or float is a violation |
| `playwright_result.issues` | Array of objects, or absent | Bare string or non-array object is a violation |

### Timeout policy

If a sub-agent does not return within the platform-defined timeout:
→ Treat as agent failure; apply the same handling as `status = "fail"` for that agent.
→ STOP with:
```
❌ Agent [name] timed out at Phase [N].
   Recovery: Check model/network availability. Re-run /markup-task.
```

---

## Path Integrity Check

*(Applied in Phase 2 after receiving `code-generator` output.)*

Step 1 — **Normalize** every path in `files_written`: resolve all `../`, `./`, and symlink segments to their canonical absolute form before any comparison.

Step 2 — **Traversal guard:** If any normalized path escapes the repository root → STOP immediately:
```
❌ Path traversal detected: "[normalized_path]" escapes the repository root.
   Risk: secret exposure or file pollution outside the declared output zone.
   Fix: Inspect code-generator output constraints. Re-run /markup-task.
```

Step 3 — **Prefix check:** Validate that every normalized path is contained within the directory of at least one declared entry in `output_paths`.
If any normalized path falls outside all declared output directories → STOP:
```
❌ Path integrity violation: code-generator wrote to undeclared path: [path]
   Risk: undeclared files may be staged and committed — system-wide file pollution.
   Fix: Verify code-generator output constraints. Re-run /markup-task.
```
