---
description: Review and audit agent skills for enterprise quality, template compliance, and token efficiency.
---

# Skill Review Workflow

## Prerequisites

Before reviewing, internalize these references (in order):

1. **Template standard**: Read `.agent/skills/_template/SKILL.md` to know the expected structure.
2. **Prompt engineering best practices** (distilled from Anthropic docs):
   - **Be clear and direct** — state exactly what you want the agent to do
   - **Use positive framing** — say "DO X" instead of "DON'T do Y"
   - **Provide examples** — ✅/❌ tables or code snippets are 10x more effective than prose
   - **Keep instructions specific and testable** — every rule should be verifiable
   - **Avoid redundancy** — stating the same idea twice wastes tokens and confuses priority
3. **Skill file format requirements**:
   - Frontmatter MUST have `name` and `description` (required fields)
   - Optional frontmatter: `proactive`, `match`, `category`, `depends_on`
   - `description` must contain natural trigger keywords for semantic matching
   - No cross-skill references (`@skill:`, `See Also`) — each skill must be self-contained
4. **Project manifesto**: Read `.agent/skills/agent-manifesto/SKILL.md` for tech stack context (Vue 3, Nuxt, Tailwind v4).

## Review Checklist

For each skill, evaluate against these criteria:

### A. Structure Compliance
- [ ] Frontmatter has `name` and `description` (required by Anthropic)
- [ ] `description` contains natural trigger keywords
- [ ] `argument-hint` present if skill accepts arguments
- [ ] No `dependencies` key in frontmatter
- [ ] No cross-skill references (`@skill:`, `See Also`, `Related Skills`)
- [ ] `metadata.json` exists with `version` and `references`

### B. Content Quality (Anthropic Best Practices)
- [ ] **Positive framing**: No NEVER section — use Anti-Patterns table instead
- [ ] **"Why" over "What"**: Rules explain rationale, not just commands
- [ ] **Few-shot examples**: ✅/❌ tables or code examples present
- [ ] **Concise**: No redundant paragraphs that repeat the same idea
- [ ] **Actionable**: Every instruction is testable and specific

### C. Token Efficiency
- [ ] No verbose paragraphs that could be a bullet point
- [ ] No duplicate information (same rule stated in different sections)
- [ ] Supporting files (reference.md, examples.md) used for large content
- [ ] Total SKILL.md body under ~2000 words for standard skills

### D. Technical Accuracy
- [ ] Framework versions match current stack (Vue 3, Nuxt 4, Tailwind v4)
- [ ] Code examples are syntactically correct
- [ ] No outdated API patterns or deprecated features

## Review Output Format

Create a review artifact with this structure per skill:

```markdown
### skill-name
- **Size**: X lines / Y chars
- **Verdict**: ✅ PASS | ⚠️ NEEDS WORK | ❌ FAIL
- **Issues**: [list of specific issues found]
- **Token savings**: [estimated token reduction if applicable]
- **Action**: [specific fix recommendations]
```

## Steps

1. Read the template and reference docs listed in Prerequisites
2. List all skills to review (self-written vs collected)
3. Read each skill's SKILL.md
4. Evaluate against the checklist above
5. Generate the review artifact
6. Prioritize fixes by impact (token savings × frequency of use)
