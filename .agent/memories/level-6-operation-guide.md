# Level 6 Workflow Operations Guide (Agentic Engineering)

> [!WARNING]
> **⚠️ DEPRECATED (2026-04-10)**: This document describes a previous CrewAI-based architecture.
> Workflows referenced below (`/qa-gate`, `/lab-test-fix-loop`, `/visual-qa`, `/skill-benchmark`) no longer exist.
> Current workflows: see [AGENTS.md](../AGENTS.md) → Core Workflows section.

This document consolidates the workflows in this project that met the **Level 6: Harness Engineering (Automated Feedback Loops)** standard per the Agentic Engineering model. At Level 6, the Agent system not only generates code but also runs tests, performs cross-reviews, and self-corrects through closed feedback loops.

---

## 1. Autonomous Multi-Agent Pipeline (Agent Platform)

Replaced the CLI-based DEV↔QA debate loop with a programmatic **CrewAI-based multi-agent platform** (`/.agent-crew/`).

- **How to run:**
  ```bash
  cd .agent-crew && .venv/bin/python -m src.main feature "Feature description"
  ```
- **Architecture**: Planner → Developer → QA Reviewer (3 specialized agents)
- **Security**: 3-layer model — Hard limits (code allowlists) → Soft limits (system prompts) → Process limits (workflow QA steps)
- **Observability**: Langfuse tracing (when configured)

---

## 2. Async QA Gate After Commit (`/qa-gate`)

Runs as a backpressure layer after each commit. This workflow ensures development velocity is not bottlenecked while maintaining code quality.

- **Automatic Trigger:** Integrated to auto-activate after `/feature`, `/technical-task`, or after the agent calls the `git-commit` skill.
- **Manual Trigger:**
  ```text
  /qa-gate
  ```
- **How it works:**
  Reads the latest commit (HEAD) → QA reviews → If high-severity issues are found, the system auto-fixes and creates patch commits (`fix(scope): address QA finding`) until clean.

---

## 3. Lab Test Fix Loop (`/lab-test-fix-loop`)

Keeps the system in a green (Pass) state for unit tests (Vitest / Playwright).

- **How to run:**
  ```text
  /lab-test-fix-loop
  ```
- **How it works (Detect → Trace → Implement → Verify):**
  Runs Test Suite → Analyzes Traceback from error logs → Classifies Root Cause (logic/mock) → Implements fix → Re-verifies the specific test.
  *Special:* If the current fix still fails, the Agent backtracks and commits to not retrying failed approaches. When all tests pass, the system runs a full suite audit.

---

## 4. Figma UI Standardization Loop

Based on frequent repetitive tasks, updating UI from Figma is the most common process. To automate and improve visual accuracy at Level 6:

- **How to run:** `/figma-diff` or describe "Sync UI from Figma".
- **How it works (Fetch → Translate → Verify):**
  1. Extract target node IDs via MCP `FigmaAIBridge` / `figma-node-explorer`.
  2. Implement/Refactor React components using extracted SVG/JSON, applying Tailwind v4 standards and tokens.
  3. Visual QA: Run `/visual-qa` to capture snapshots via `chrome-devtools` and analyze DOM elements. Cross-analyze smoothness, border-radius, color palette, padding/margin against the original. Agent continues CSS fix loop until the component matches the Figma design.

---

## 5. Skill Benchmark & Coverage Loop (`/skill-benchmark`)

The Agent system must be benchmarked whenever a skill is added or updated. This process ensures knowledge coverage, syntax, and practical applicability.

- **How to run:** `/skill-benchmark "skill-directory-name"`
- **How it works:**
  1. **Static Benchmark Script:** Runs `./.agent/scripts/benchmark.mjs` to check strict dimensions. Agent reads logs and auto-fixes files if Script reports FAIL.
  2. **Scenario Coverage Simulation:** Auto-generates hypothetical scenarios the target skill is responsible for and runs Dry Run tests.
  3. **Auto-Refinement:** If code output deviates from standards, it infers the skill description is too vague. Agent auto-fixes the source `SKILL.md` to patch knowledge gaps.
  4. Presents Benchmark Report from `.agent/benchmarks/latest-report.md`.

---

## 6. QA Review Ignore Filter

To make automated code review workflows (like `/qa-gate` or `/review-commit`) run faster without wasting memory analyzing noise, the system uses a filter file **`.reviewignore`**.

- Located at root directory: `.reviewignore`
- Logs, local dependencies (`node_modules`), dist, assets, and memories (`.agent/memories/`) are all bypassed, allowing DEV and QA Agents to focus on actual logic/view code. This optimizes token usage and round count.
