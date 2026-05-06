# AI Agent Infrastructure — Cross-Check Briefing

> **You are an independent AI Judge.** Your task is to audit the following AI Agent Infrastructure for structural soundness, operational safety, and production readiness. Be adversarial — assume nothing works until proven otherwise.

---

## Context: What You Are Auditing

This is an **enterprise AI Agent Infrastructure Hub** — a centralized repository of skills, rules, workflows, and scripts that govern how AI coding agents operate within a Vue/Nuxt frontend monorepo. The system is designed to be **AI-model neutral** (no provider lock-in).

### Directory Layout

```
.agent/
├── manifest.json          # Machine-readable registry of 35 skills
├── dist-config.json       # Multi-channel distribution config
├── AGENTS.md              # Operations manual
├── README.md              # Auto-generated skill dashboard
├── skills/                # 31 skills (each has SKILL.md with YAML frontmatter)
├── rules/                 # 3 always-apply behavioral constraints
│   ├── agent-guardrails.md    # Git, language, output, resource ownership
│   ├── agent-security.md      # 3-layer security defense
│   └── workspace-context.md   # Version routing (Vue 2/3, Tailwind v3/v4, etc.)
├── workflows/             # 5 slash-command workflows (/feat, /figma-diff, etc.)
├── prompts/               # 4 agent personas (planner, reviewer, debugger, refiner)
├── checklists/            # 5 reusable quality checklists
├── memories/              # 4 architectural decision records (with expiry dates)
├── benchmarks/            # Quality outputs (reports, audits, reviews, baselines)
└── scripts/               # Automation (benchmark.mjs, review.mjs, distribute.sh, etc.)
```

### Skill System

- **35 skills** organized by category: Standards, Framework, Design, Figma, Architecture, Testing, Documentation, DevOps, Meta.
- Each skill is a `SKILL.md` file with YAML frontmatter: `name`, `description`, `version`, `category`, `depends_on`, `globs`.
- Skills declare explicit dependencies (e.g., `figma-to-sc-markup-page` depends on `zero-ui` + `markup-fsd-architecture`).
- Version routing in `workspace-context.md` prevents loading incompatible versions (e.g., Vue 2.7 vs Vue 3 skills).

### Key Dependency Chains

```
figma-to-sc-markup-page → zero-ui, markup-fsd-architecture
figma-to-stove-ui-page → stove-ui, indie-design-tokens
figma-to-vue-component → vue-best-practices
nuxt-best-practices → vue-best-practices
quality-audit → a11y-wcag, nuxt-best-practices
social-showcase-fsd-architecture → nuxt-best-practices, stove-ui
indie-studio-v3-ui-integrate → stove-ui, indie-design-tokens, tailwind-v3
```

### Distribution Channels

| Channel | Branch | Inherits | Platform Skills |
|:---|:---|:---|:---|
| Global | `dist/global-skills` | — | 18 library-agnostic skills |
| MYHOME | `dist/extra-myhome-skills` | global | +zero-ui, figma-to-sc-markup-page, markup-fsd-architecture, sc-markup-documentation |
| Indie MY | `dist/extra-indie-my-skills` | global | +zero-ui (Vue 2.7 mode) |
| Indie Studio | `dist/extra-indie-studio-v3-skills` | global | +stove-ui, indie-design-tokens, indie-studio-v3-ui-integrate, figma-to-stove-ui-page |
| Social Showcase | `dist/extra-social-showcase-skills` | global | +social-showcase-fsd-architecture, stove-ui |

### Rules (Always-Apply)

1. **agent-guardrails.md**: No direct pushes to protected branches. Branch naming: `ai-agent/<owner>/<task>`. English-only source code. Conventional Commits. Never delete existing skills.
2. **agent-security.md**: 3-layer defense (hard → soft → process limits).
3. **workspace-context.md**: Version routing table — read target `package.json` before loading any versioned skill.

### QA Pipeline

```
npm run agent:benchmark  →  13-dimension structural analysis (D1-D13)
npm run agent:audit      →  AI audit via Claude Opus 4.6 (trilingual: EN/VI/KO)
npm run agent:review     →  Per-skill structural + semantic review (A/B/C/F grading)
```

### Latest Benchmark Results (Self-Reported)

- 13/13 system-level dimensions passed
- 35/35 skills at Grade A (static benchmark)
- 100% reference integrity, 100% AI neutrality, 100% manifest coverage
- Always-Apply budget: 2671/4000 chars (33% headroom)

---

## Your Cross-Check Assignment

Evaluate the infrastructure across the following **7 dimensions**. For each dimension, assign a verdict: **✅ PASS**, **⚠️ CONCERN**, or **❌ FAIL**, with a brief justification.

### Dimension 1: Structural Integrity

- Does the directory layout follow a coherent, scalable pattern?
- Is the separation of concerns clear (skills vs rules vs workflows vs prompts)?
- Are there any orphaned or redundant components?

### Dimension 2: Skill Quality Governance

- Is the skill lifecycle well-defined (template → draft → benchmark → review → enterprise)?
- Are token budgets (500 lines hard, 3500 words soft) reasonable for LLM context windows?
- Is the YAML frontmatter schema sufficient for agent-side routing?

### Dimension 3: Dependency Safety

- Are all dependency chains acyclic?
- Can a skill with `depends_on` always resolve its prerequisites within its assigned distribution channel?
- Is there a documented conflict resolution strategy when two skills in a chain give contradictory guidance?

### Dimension 4: Distribution Channel Isolation

- Does the distribution model (extra-* requires global installed first) prevent skill conflicts?
- Could a platform-specific skill leak into a channel where it doesn't belong?
- Are the `exclude` entries in `dist-config.json` justified?

### Dimension 5: Behavioral Guardrails

- Are the always-apply rules sufficient to prevent destructive autonomous actions?
- Is the Git workflow (branch naming, no direct pushes, PR-required) enforceable at the agent level?
- Does the security model have gaps (e.g., can an agent bypass hard limits via prompt injection)?

### Dimension 6: QA Pipeline Completeness

- Is the benchmark → audit → review → human check pipeline sufficient for production trust?
- Are there gaps between static analysis (benchmark) and runtime behavior?
- Is the AI audit model (Claude Opus 4.6) appropriate, or does using a single model create bias?

### Dimension 7: Scalability & Maintenance

- Can this system scale to 50+ skills without architectural changes?
- Is the always-apply budget (2671/4000) sustainable as rules grow?
- Is there sufficient automation to prevent manual drift?

---

## Output Format

IMPORTANT: Write the report in **TRILINGUAL** format with THREE complete sections:

- First section header: `## [en]: Cross-Check Audit Report`
- Then a horizontal rule (`---`)
- Second section header: `## [vi]: Báo cáo Cross-Check Kiểm tra Chéo`
- Then a horizontal rule (`---`)
- Third section header: `## [ko]: 교차 검증 감사 보고서`

Each section must be a **COMPLETE, standalone translation** — not a summary or abbreviation of the English version.

Within each language section, use the following structure:

```markdown
## [en]: Cross-Check Audit Report

**Auditor**: [Your model name]
**Date**: [Current date]
**Infrastructure Version**: 35 skills, 13 dimensions

### Summary Verdict

[PASS / CONDITIONAL PASS / FAIL] — [One-line rationale]

### Dimension Scores

| # | Dimension | Verdict | Key Finding |
|---|-----------|---------|-------------|
| 1 | Structural Integrity | ✅/⚠️/❌ | ... |
| 2 | Skill Quality Governance | ✅/⚠️/❌ | ... |
| 3 | Dependency Safety | ✅/⚠️/❌ | ... |
| 4 | Distribution Channel Isolation | ✅/⚠️/❌ | ... |
| 5 | Behavioral Guardrails | ✅/⚠️/❌ | ... |
| 6 | QA Pipeline Completeness | ✅/⚠️/❌ | ... |
| 7 | Scalability & Maintenance | ✅/⚠️/❌ | ... |

### Detailed Findings

[Per-dimension analysis with specific evidence]

### Risks Not Covered by Self-Reported Benchmarks

[What the internal QA pipeline might be missing]

### Recommendations

[Numbered, actionable steps]
```

Be decisive. Do not hedge. If you see a risk, call it out directly.
Format your response in markdown. Use proper heading hierarchy (`##` for language sections, `###` for sub-sections).

## Iterative Runs

This cross-check may run multiple times as issues are fixed. When producing a follow-up review:

1. **Reverse chronological order**: Place the **newest** review at the **top** of each language section. Readers should see the current verdict first, not scroll past resolved history.
2. **Use numbered headings**: `### Fourth attempt — Final Verification (YYYY-MM-DD)` above `### Third attempt`, etc.
3. **Reference previous issues by number**: "Issue #1: RESOLVED" or "Issue #2: still open."
4. **Keep all previous attempts**: Do not delete earlier reviews — they serve as an audit trail.
