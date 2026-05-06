---
description: Critical guardrails for Git, Language, Output, and Resource Ownership.
alwaysApply: true
---

# Agent Operational Guardrails

All autonomous operations MUST adhere to these strict guardrails to ensure project integrity and safety.

## 1. Git Workflow (Level 6+)
- **NO DIRECT PUSHES**: Never push to protected branches (`main`, `master`, `develop`, `staging`). These are READ-ONLY for AI.
- **BRANCHING**: Create new branches with naming: `ai-agent/<owner>/<task-slug>` (e.g., `ai-agent/ryan/board-filters`, `ai-agent/system/benchmark-fix`).
- **PULL REQUESTS**: All completed changes MUST be submitted via PR/MR for human review. Never merge your own code.

## 2. Language & Artifacts
- **English Only**: Source code, variable names, comments, and project documentation MUST be in English.
- **Agent Infrastructure**: All `.agent/` resources (skills, rules, workflows, checklists, memories) MUST be strictly in English.
- **Conversations**: Chat responses may use the USER's preferred language, but artifacts must be English to prevent encoding/bash piping issues.

## 3. Output Standards
- **Conventional Commits**: Use `type(scope): subject` for all commit messages.
- **Security Check**: NEVER commit or log secrets, API keys, or credentials.
- **No Unicode**: Scan for and remove non-English characters in source files before committing.
- **Completion**: Do not leave "TODO" placeholders or unfinished code in the final output.

## 4. Resource Ownership (Do Not Delete)
- **Strict Protection**: Do NOT delete or fundamentally alter existing `.agent/` resources (skills/rules) you didn't create without explicit verification from the USER.
- **Deprecation**: If a skill is superseded, add a deprecation warning in its `SKILL.md` rather than deleting it.
- **Awareness**: Always assume resources are actively used by other teams or sub-agents. Update documentation transparently.
