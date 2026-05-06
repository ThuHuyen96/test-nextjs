---
name: {{SKILL_ID}}
description: {{TRIGGER_DESCRIPTION — include keywords users would naturally say}}
category: {{CATEGORY}}
# argument-hint: [arg1] [arg2]  ← uncomment if skill accepts arguments via $ARGUMENTS
human_reviewed: false
# depends_on:           ← uncomment and list skill IDs that MUST be loaded before this one
#   - {{prerequisite-skill-id}}
---

# {{SKILL_TITLE}}

<!-- ═══════════════════════════════════════════════════════════════
  VERSION GUARD (Required for versioned skills, e.g., tailwind-v3/v4, storybook-v8/v10)
  Remove this entire block if skill is NOT versioned.

  If this skill has another version counterpart:
  1. Add the Version Guard blockquote below (uncomment)
  2. Ensure match tokens do NOT overlap with the other version
  3. Add routing rule to rules/workspace-context.md (item #6)
  4. Update any cross-referencing skills to be version-agnostic
═══════════════════════════════════════════════════════════════ -->
<!-- Uncomment if versioned:
> ⚠️ **Version Guard**: Check `package.json` for `{{PACKAGE_NAME}}` version before applying this skill.
> If `{{PACKAGE_NAME}} >= {{OTHER_VERSION}}`, **STOP** — use `{{OTHER_SKILL_ID}}` skill instead.
> This skill applies to **{{THIS_VERSION_RANGE}}** only.
-->

{{ONE_PARAGRAPH — explain WHY this skill exists, not just what it does}}

## Quick Start

| Rule                 | ✅ Correct       | ❌ Incorrect    |
| -------------------- | ---------------- | --------------- |
| {{Rule description}} | {{Good example}} | {{Bad example}} |

---

## Core Concepts

### {{Section 1}}

{{Detailed explanation with code examples}}

### {{Section 2}}

{{Detailed explanation with code examples}}

---

## Rules

### ALWAYS

- **ALWAYS {{Rule 1}}**: {{Explanation with WHY}}
- **ALWAYS {{Rule 2}}**: {{Explanation with WHY}}

---

## Anti-Patterns

| Anti-Pattern | Problem          | Fix                  |
| ------------ | ---------------- | -------------------- |
| {{Pattern}}  | {{Why it's bad}} | {{Correct approach}} |

---

<!-- ═══════════════════════════════════════════════════════════════
  VERSIONED SKILL CHECKLIST (delete this block if not versioned)
  Before submitting a versioned skill, ensure:
  - [ ] Version Guard blockquote is present after the title
  - [ ] match: tokens in frontmatter do NOT overlap with the sibling version
  - [ ] rules/workspace-context.md item #6 includes routing for this tool
  - [ ] All cross-referencing skills use version-agnostic language
  - [ ] Anti-Patterns table includes "using sibling version patterns"
═══════════════════════════════════════════════════════════════ -->

