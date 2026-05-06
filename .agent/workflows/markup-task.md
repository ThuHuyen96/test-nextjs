---
description: >
  Read a task file from .agent/tasks/<task-name>.md and execute the Figma → Next.js/React markup workflow.
  Usage: /markup-task <task-name>
  Trigger: /markup-task <task-name> or "render UI based on <task-name>".
---

# /markup-task — Execute Markup Task from File

## Step 0 — Resolve task file

Read `$ARGUMENTS` (the text typed after `/markup-task`). Trim whitespace.

**CASE A — `$ARGUMENTS` is empty or blank:**

Run `ls .agent/tasks/` and collect all `.md` files excluding `_template.md`.
Strip the `.md` extension from each filename to get the task name list.

**Sub-case A1 — no task files exist:**
```
❌ No tasks found in .agent/tasks/
   Create one first:
     cp .agent/tasks/_template.md .agent/tasks/<task-name>.md
```
→ STOP.

**Sub-case A2 — task files exist:**

Use the `AskUserQuestion` tool to present an interactive picker:
- `question`: `"Which task do you want to run?"`
- `header`: `"Task"`
- `options`: up to 4 tasks from the list, each as `{ label: "<task-name>", description: ".agent/tasks/<task-name>.md" }`
  - If there are more than 4 tasks, show the first 4; the auto-added "Other" option covers the rest (user types the name manually)
- `multiSelect`: false

Set `task_name` from the user's selection (or the typed value if "Other" was chosen).
→ Proceed to Step 1 using the selected `task_name`.

**CASE B — `$ARGUMENTS` equals `_template`:**
```
❌ "_template" is the master template and cannot be executed as a task.
   Copy it to a new file first:
     cp .agent/tasks/_template.md .agent/tasks/<your-task>.md
```
→ STOP.

**CASE C — `$ARGUMENTS` is a valid task name:**

```
task_name = $ARGUMENTS.trim()
task_file = .agent/tasks/[task_name].md
```

Check if `task_file` exists using the Read tool.

If the file does not exist → STOP:
```
❌ Task file not found: .agent/tasks/[task_name].md
   Run `ls .agent/tasks/` to see available tasks.
   Copy the template to create a new task:
     cp .agent/tasks/_template.md .agent/tasks/[task_name].md
```

→ File exists: proceed to Step 1.

---

## Step 1 — Read the task file

Use the Read tool to read: `.agent/tasks/[task_name].md`

Parse these fields:
- `description`    — section "1. User description" (supplemental; Figma takes priority)
- `config`         — section "1.1 Config":
  - `dev_server_url`  → value after `dev_server_url:` (strip inline comments); blank or absent → default `"http://localhost:5173"`
- `figma_links`    — table in section "2. Figma links" → xs / sm / md / lg
- `references`     — section "3. Reference components"
- `output_paths`   — section "4. Output paths" → components[] + pages[]
- `ui_lib`         — section "5. UI Library" → "none" (default: "none")

After parsing, silently read `.agent/memories/local-components.md`:
- File exists → store its full content as `local_component_dictionary`.
- File does not exist → set `local_component_dictionary = null`. Continue without error.

---

## Step 2 — Validate input

**Figma links:**
Discard rows that still contain `<!-- ... -->` or are empty.
At least 1 valid link required — if none: STOP
```
❌ No Figma links provided.
   Fill in section "2. Figma links" in .agent/tasks/[task_name].md and run /markup-task [task_name] again.
```

**Output paths:**
Discard lines that still contain `<!-- ... -->`.
At least 1 component or 1 page required — if none: STOP
```
❌ Output paths not filled in.
   Fill in section "4. Output paths" in .agent/tasks/[task_name].md and run /markup-task [task_name] again.
```

**UI lib:**
Unrecognized value or empty → default to `none`.

**Dev server URL:**
After applying the default (`http://localhost:5173`), validate the format:
- `dev_server_url` must start with `http://` or `https://`
- If it does not → STOP:
  ```
  ❌ dev_server_url must start with http:// or https://.
     Got: [dev_server_url]
     Fix: Update dev_server_url in .agent/tasks/[task_name].md and re-run.
  ```

---

## Step 3 — Confirm with user

```
📋 Markup Task
──────────────────────────────────────
Task File  : .agent/tasks/[task_name].md

Figma links:
  XS : {xs_url | "—"}
  SM : {sm_url | "—"}
  MD : {md_url | "—"}
  LG : {lg_url | "—"}

Output:
  Components : {components | "—"}
  Pages      : {pages | "—"}

References   : {references | "none"}
UI Library   : [ui_lib]
Dev Server   : [dev_server_url]
──────────────────────────────────────
Run? (y/n)
```

`n` → STOP.

---

## Step 4 — Spawn orchestrator (MANDATORY)

> ⛔ HARD RULE: You MUST use the Agent tool to spawn the orchestrator as a sub-agent.
> Running the workflow inline (without spawning) is FORBIDDEN — it skips Phase 3–8,
> which means sign-off, visual verification, and memory update never run.

> ⛔ HARD RULE: The prompt passed to the Agent MUST NOT contain any workflow logic,
> or phase descriptions written by the parent agent.
> The sub-agent derives ALL execution logic by reading the spec files listed below.
> Writing inline logic = bypassing the spec = guaranteed errors.

Use the Agent tool with **exactly** the prompt below — replace [variables] with real values,
do NOT add, remove, or rewrite any other content:

```
Working directory: /path/to/project

## Pre-execution protocol (MANDATORY — complete before anything else)

Read these files in order before executing any phase:

1. .agent/roles/orchestrator.md          ← load and follow the pre-execution protocol inside
2. .agent/roles/orchestrator/03-prohibited-patterns.md
3. .agent/roles/orchestrator/01-validation-rules.md
4. .agent/roles/orchestrator/02-report-templates.md
5. .agent/roles/orchestrator/00-core-workflow.md  ← this is the executable state machine

Do NOT proceed to Phase 0 until all five files are fully read.
Do NOT implement any phase logic yourself — 00-core-workflow.md defines all phases exactly.

## Input

{
  "task_name":      "[task_name]",
  "figma_links":    { "xs": "[xs]", "sm": "[sm]", "md": "[md]", "lg": "[lg]" },
  "output_paths":   { "components": [[components]], "pages": [[pages]] },
  "references":     [[references]],
  "description":    "[description]",
  "ui_lib":         "[ui_lib]",
  "dev_server_url": "[dev_server_url]",
  "local_component_dictionary": [local_component_dictionary]
}
```
