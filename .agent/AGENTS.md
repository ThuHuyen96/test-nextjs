# 🛡️ Agent Operations Manual

This document serves as the central reference for the Agent Infrastructure, detailing the available workflows, skills, and system guardrails for the **Next.js 16** ecosystem.

---

## 🚀 Core Workflows

Access these workflows via slash commands in your agent environment:

| Command | Description | Link |
| :--- | :--- | :--- |
| **`/feat`** | End-to-end development for features or technical tasks. | [feat.md](./workflows/feat.md) |
| **`/figma-diff`**| Highlight changes between Figma design nodes. | [figma-diff.md](./workflows/figma-diff.md) |
| **`/agent-validation`**| QA validation & release pipeline for agent quality. | [agent-validation.md](./workflows/agent-validation.md) |
| **`/review-skills`** | Audit skills for quality, compliance, and token efficiency. | [review-skills.md](./workflows/review-skills.md) |
| **`/help`** | Show quick reference for all workflows. | [help.md](./workflows/help.md) |

---

## 🎭 Agent Personas

Persona prompts define specialized roles for multi-agent coordination:

| Persona | File | Used In |
| :--- | :--- | :--- |
| **Planner** | [planner.md](./prompts/planner.md) | `/feat` Phase 1 — Requirements analysis, skill selection, implementation planning |
| **Debugger** | [debugger.md](./prompts/debugger.md) | Ad-hoc — Root cause analysis, 5-Whys, surgical fixes |
| **QA Reviewer** | [reviewer.md](./prompts/reviewer.md) | `/feat` Phase 4 — Adversarial code review with severity levels |
| **Skill Refiner** | [refiner.md](./prompts/refiner.md) | `/review-skills` — Token optimization, trigger precision |

---

## 🧠 Skill Taxonomy

Skills are organized into logical layers to help agents select the right context:

### 📦 Framework & Core
- **`next-best-practices`**: Essential coding patterns for Next.js 16 (App Router, RSC).
- **`next-cache-components`**: Advanced caching patterns (PPR, `use cache`).
- **`next-upgrade`**: Migration and upgrade automation.
- **`next-compile`**: TurboPack compilation and build verification.

### 🛡️ Standards & Quality
- **`coding-conventions`**: Project-specific naming and structural rules.
- **`quality-audit`**: Automated compliance and maintenance checks.
- **`a11y-wcag`**: Accessibility (WCAG 2.1) audit and enforcement.

### 🎨 Design & UI
- **`tailwind-v4`**: Modern styling system using CSS-first configuration.
- **`figma-node-explorer`**: Design hierarchy analysis and component breakdown.
- **`figma-to-next-component`**: High-fidelity Figma-to-React (.tsx) implementation.

### 🏛️ Architecture
- **`nextjs-manifesto`**: The foundational principles of our Next.js development approach.
- **`find-skills`**: Discovery and meta-programming helper.

---

### Skill Dependency Resolution

Skills declare dependencies in their YAML frontmatter:

```yaml
depends_on:       # MUST load before executing this skill
  - next-best-practices
```

**Dependency classification:**
- **Stable (paradigm-level)**: `next-best-practices`, `a11y-wcag`, `tailwind-v4` — safe to depend on from any channel.
- **Volatile (implementation-level)**: Specific UI components or feature-specific logic.

When loading a skill, the agent MUST:
1. Check `depends_on` and load all prerequisites first (in order).
2. Only then read and apply the primary skill's instructions.

---

## 🔧 Maintenance Scripts

Run these from the `.agent/scripts` directory:

| Command | Purpose |
| :--- | :--- |
| `npm run agent:index` | Regenerate `manifest.json` and `README.md`. |
| `npm run agent:benchmark` | Run D1-D13 quality benchmarks across all skills. |
| `npm run agent:audit` | Open an AI-powered audit session for infra review. |
| `npm run agent:check-refs` | Verify all internal documentation links and references. |

---

## 🚦 Behavioral Guardrails

All autonomous agent operations are governed by these rules:
- **`agent-guardrails.md`**: Global constraints on Git workflow, language, output standards, and resource ownership.
- **`agent-security.md`**: Security protocols — 3-layer defense (hard limits → soft limits → process limits).

---

## 📖 Historical Context

Refer to the [CHANGELOG.md](./CHANGELOG.md) for a record of architectural shifts (e.g., the migration from Vue to Next.js).
Detailed decision records can be found in the [memories/](./memories/) directory. All memories include `Expires` dates for lifecycle tracking.
