# Scenario Test: {{SKILL_ID}}

## Purpose
Validate that an Agent loading this skill produces correct output for a realistic user request.

## Mock User Request
> "{{Paste a realistic user prompt that should trigger this skill}}"

## Expected Agent Behavior

1. **Skill activation**: Agent should identify and load `{{SKILL_ID}}` skill.
2. **Dependency loading**: Agent should also load `depends_on` skills: {{list}}.
3. **Output structure**: Agent should produce files matching the project structure template.

## Acceptance Criteria

| # | Criterion | Pass condition |
|---|-----------|----------------|
| 1 | Uses `<script setup lang="ts">` | No Options API in output |
| 2 | Design tokens only | No hardcoded hex values |
| 3 | Correct UI components | Uses `<s-*>` or `@zero/*` components |
| 4 | Typed props/emits | All `defineProps<{}>()` and `defineEmits<{}>()` |
| 5 | Semantic HTML | `<main>`, `<section>`, `<nav>` used appropriately |
| 6 | ARIA labels | All interactive elements have `aria-label` or visible text |

## Failure Triggers Auto-Refinement

If the Agent fails any criterion above, the benchmark system should:
1. Identify which rule in `SKILL.md` was too vague
2. Add an explicit `ALWAYS` or anti-pattern entry
3. Re-run the scenario
