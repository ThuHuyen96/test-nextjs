# AI Agent Maturity Checklist

**Purpose**: Reference document for evaluating team/project maturity in AI Agent adoption. Used by the `agent:audit` workflow to assess current level and track progression over time.

**Source**: Internal strategy

---

## Maturity Model — 4 Stages, 8 Levels

### Stage 1: Standard Coding

#### Level 1 — Traditional Coding

- **Flow**: Human → IDE/Text Editor → Source Code
- **AI involvement**: None
- **Criteria to PASS**:
  - [ ] Developer writes all code manually
  - [ ] No AI tools configured

---

### Stage 2: Coding Agent in the IDE

#### Level 2 — Step-by-Step Agent

- **Flow**: Human ↔ IDE (AI Agent) → Source Code
- **AI involvement**: Integrated in IDE, developer confirms each action
- **Criteria to PASS**:
  - [ ] AI agent installed in IDE (Cursor, Copilot, Antigravity, etc.)
  - [ ] Developer requests step-by-step execution
  - [ ] Developer reviews each generated line of code
  - [ ] Manual confirmation before each action

---

### Stage 3: Agent IDE — YOLO Mode

#### Level 3 — YOLO in IDE

- **Flow**: Human → IDE (AI Agent) → Source Code
- **Parameters**: Thinking: NO, Reasoning: NO
- **AI involvement**: Agent executes instructions directly without reasoning steps
- **Criteria to PASS**:
  - [ ] Agent executes without step-by-step confirmation
  - [ ] Developer provides high-level instructions, not line-by-line
  - [ ] Developer reviews generated code after execution
  - [ ] Skills or rules guide agent behavior (not manual prompting each time)

#### Level 4 — Wide Agent in IDE

- **Flow**: Human → IDE (Large LLM) → Source Code
- **AI involvement**: Autonomous code generation, developer monitors
- **Criteria to PASS**:
  - [ ] Agent generates entire functions/components autonomously
  - [ ] Developer monitors progress rather than directing each step
  - [ ] Strong code review process in place (PR checklists, audits)
  - [ ] Agent selects appropriate skills/context without explicit developer choice

---

### Stage 4: Building Sub-agents

#### Level 5 — CLI Single Agent, YOLO

- **Flow**: CLI → Agent → Source Code
- **Mode**: YOLO — no IDE, headless execution
- **AI involvement**: Agent reads codebase and executes tasks via command line
- **Criteria to PASS**:
  - [ ] CLI-based agent execution (e.g., Claude Code CLI, Gemini CLI)
  - [ ] Agent runs headless tasks: benchmark, audit, code generation
  - [ ] Automated scripts orchestrate agent workflows
  - [ ] Skills library standardized and machine-readable (manifest.json)
  - [ ] Quality gates enforce standards without human intervention

#### Level 6 — Multiple CLI Agents, Orchestrated

- **Flow**: Developer → Multiple CLI Agents (parallel) → Source Code
- **AI involvement**: Multiple agents work simultaneously, developer orchestrates
- **Criteria to PASS**:
  - [ ] 2+ agent sessions running in parallel on different tasks
  - [ ] Task assignment strategy (which agent handles which task)
  - [ ] Branch management per agent (e.g., `sub-agent/{name}/task-*`)
  - [ ] Remote agent control (e.g., Slack bridge, API, task queue)
  - [ ] Agent output consolidation and conflict resolution

#### Level 7 — Build Your Own Orchestrator

- **Flow**: Orchestrator → Multiple Agents → Source Code → CI/CD
- **AI involvement**: Fully automated pipeline, agent reads tickets and delivers MRs
- **Criteria to PASS**:
  - [ ] Ticket reader: Agent reads issues/tickets from project management tool
  - [ ] Auto-implement: Agent creates branch, implements feature, commits
  - [ ] Auto-test: Agent runs tests, self-fixes failures
  - [ ] Auto-MR: Agent creates merge requests with descriptions
  - [ ] Auto-review: Agent reviews code from other agents
  - [ ] Auto-deploy: Pipeline builds and deploys on merge
  - [ ] All steps run without human initiation

#### Level 8 — Orchestrator Self-Managing

- **Flow**: Control Panel → Orchestrator → Agents → Source Code → Production
- **AI involvement**: Agents manage the entire engineering process at scale
- **Criteria to PASS**:
  - [ ] Control Panel/Dashboard for monitoring all agents
  - [ ] Auto task decomposition (epic → subtasks → agent assignments)
  - [ ] Agent health monitoring (success rate, token usage, throughput)
  - [ ] Self-healing: agents restart on failure, escalate when stuck
  - [ ] Scaling: dynamically add/remove agents based on workload
  - [ ] Human oversight is optional, not required

---

## Level-Up Strategy Signals

Each level transition has a **core enabler** (technology/pattern), an **industry trend** driving it, and a **critical success factor**. The auditor should use these signals to recommend strategy — not just list missing criteria.

| Transition | Core Enabler | Industry Trend | Critical Success Factor |
|:---|:---|:---|:---|
| L1 → L2 | IDE AI plugins (Copilot, Cursor) | AI-assisted coding becomes mainstream | Developer trust in AI suggestions |
| L2 → L3 | Agent skills & rules (prompt engineering) | Shift from "AI assists" to "AI executes" | Quality of skill definitions determines output quality |
| L3 → L4 | Large context window LLMs (200K+ tokens) | Wide-context models can understand full codebases | Design system + coding standards must be machine-readable |
| L4 → L5 | CLI-based agents (Claude Code, Gemini CLI) | Headless AI execution, CI/CD integration | Scripts and automation replace manual IDE interactions |
| L5 → L6 | Multi-session orchestration, message brokers | Agent-to-Agent (A2A) protocol, task queues | Branch strategy + conflict resolution for parallel agents |
| L6 → L7 | Ticket/issue integrations (GitLab API, Jira MCP) | Autonomous development pipelines | End-to-end pipeline reliability > individual agent quality |
| L7 → L8 | Control plane, observability, auto-scaling | Platform engineering for AI agents | Self-healing + human escalation policies |

### Strategy Principles

1. **Skills-first**: Each level depends on the quality of the previous level's skills. Fix skill gaps before advancing.
2. **Automation over capability**: A reliable L5 setup beats an unreliable L7. Stability at current level > rushing to next.
3. **Evidence-driven progression**: Only claim a level if you have production evidence, not just prototypes.
4. **Tool-agnostic core**: Strategy should work across AI providers (Claude, Gemini, Codex). Avoid provider lock-in in orchestration layer.

---

## How to Use in Audit

During `agent:audit`, evaluate each level's criteria against the current project:

|   Status   | Meaning                               |
| :--------: | :------------------------------------ |
|  ✅ PASS   | All criteria met with evidence        |
| 🔶 PARTIAL | Some criteria met, others in progress |
| ❌ NOT MET | Level not reached yet                 |

The audit should output:

1. **Current Level**: The highest level where ALL criteria are ✅ PASS
2. **In-Progress Level**: The next level where criteria are 🔶 PARTIAL
3. **Gap Analysis**: What's missing to reach the next level
4. **Trend**: Compared to last audit — progressing, stagnant, or regressing
5. **Level-Up Strategy**: Based on the Strategy Signals table, recommend:
   - Which **core enabler** to invest in for the target level
   - Which **industry trend** supports this investment (why now)
   - What is the **critical success factor** to focus on (what makes or breaks it)
   - 1 concrete **quick win** achievable within 1 week

---

## Evidence Sources

The auditor should check these artifacts for evidence:

| Evidence                             | What it proves                                      |
| :----------------------------------- | :-------------------------------------------------- |
| `.agent/manifest.json`               | Skills library exists and is machine-readable (L4+) |
| `.agent/benchmarks/latest-report.md` | Automated quality gates (L5+)                       |
| `.agent/scripts/audit-claude.mjs`    | CLI-based headless agent execution (L5+)            |
| `.agent/scripts/benchmark.mjs`       | Automated benchmark without human input (L5+)       |
| `.gitlab-ci.yml`                     | CI/CD pipeline automation (L5+)                     |
| `.agent/scripts/sync-platforms.mjs`  | Multi-platform agent management (L4+)               |
| Sub-agent branch patterns            | Multiple agents working in parallel (L6+)           |
| Ticket integration scripts           | Auto ticket reading capability (L7+)                |
| Control panel / dashboard            | Self-managing orchestration (L8)                    |
