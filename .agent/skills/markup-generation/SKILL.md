---
name: markup-generation
description: Use when translating Figma designs into production-ready Next.js 16 (React) components. Governs the end-to-end workflow (Phase 0→3) for translating Figma designs into production-ready Next.js 16 (React) components.
category: Development
triggers:
  - Figma URL present in task
  - .tsx file being written or modified
  - /markup or /markup-task command
  - phrases: "render UI", "implement design", "generate markup", "frontend task"
depends_on:
  - .agent/skills/css-sizing/SKILL.md
  - .agent/skills/figma-layout-intent/SKILL.md
  - .agent/skills/markup-generation/references/semantic.md
  - .agent/skills/markup-generation/references/a11y.md
  - .agent/skills/markup-generation/references/tokens-tailwind.md
conflicts_with:
  - skill: figma-layout-intent
    boundary: >
      figma-layout-intent owns all positioning-mode decisions (absolute vs flex, layout-mode switches,
      spacing preservation across breakpoints). markup-generation defines phase ordering and calls
      figma-layout-intent trees during Phase 0/1 — it does not re-state those rules.
---

# Markup Generation (Next.js 16 / React)

This skill governs the end-to-end workflow for translating Figma designs into production-ready React components using Next.js 16 and Tailwind CSS v4. It ensures mobile-first, accessible, and semantic output across all breakpoints.

## Quick Start

| Rule | ✅ Correct | ❌ Incorrect |
| --- | --- | --- |
| Sizing | Use `rem` or Tailwind tokens | Use raw `px` values |
| Layout | Use Flex/Grid for structure | Use `absolute` for main blocks |
| Components | PascalCase `.tsx` files | lowercase or `.vue` files |
| Lists | `.map()` with unique keys | `v-for` directives |

---

## Core Concepts

### Phase-Based Workflow
The transformation from Figma to code follows a strict four-phase process:
1. **Phase 0 (Planning)**: Mandatory gate. Define dark/light mode, landmarks, and component APIs before writing any code.
2. **Phase 1 (Checklist)**: Verify design context, screenshots, and metadata for all breakpoints.
3. **Phase 2 (Implementation)**: Mobile-first coding, mapping to tokens, and splitting components when they exceed 80 lines.
4. **Phase 3 (Sign-off)**: Final verification of z-index, tokens, and visual consistency.

### Mobile-First Reflow
Base styles target xs (360px). Larger breakpoints (`sm:`, `md:`, `lg:`) only add or override styles. This minimizes the CSS bundle and prevents unintended resets.

---

## Rules

### ALWAYS

- **ALWAYS Complete Phase 0 First**: Structural decisions (semantic tags, flex vs grid) must be made explicitly before any implementation.
- **ALWAYS Use Semantic HTML**: Use `<header>`, `<main>`, `<footer>`, `<section>` and correct heading levels (`h1` → `h2` → `h3`) for accessibility.
- **ALWAYS Map to Tokens**: Prioritize predefined spacing, color, and typography tokens. Use arbitrary values `[…]` only as a last resort.
- **ALWAYS Split Large Components**: If a component exceeds 80 lines or has a `.map()` over 20 lines, extract sub-components to maintain readability.
- **ALWAYS Use PascalCase for React**: Components and their filenames must follow `PascalCase.tsx` convention.
- **ALWAYS Type Component Props**: Every component must have a TypeScript interface for its props, suffixed with `Props`.
- **ALWAYS Flatten the DOM**: Remove redundant wrappers. If a container has only 1 child, merge styles and remove the container (Single-Child Rule).

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
| --- | --- | --- |
| DIV Forest | Excessive nesting makes code hard to maintain and degrades performance. | Flatten the DOM by applying styles to children or parents. |
| Monolithic Files | Files over 80 lines are difficult to review and test. | Split into smaller, reusable child components. |
| Absolute Abuse | Using absolute positioning for main layout blocks breaks responsiveness. | Use Flexbox or CSS Grid for primary layout structure. |
| Raw px Values | Hardcoded pixel values do not scale with user font settings. | Use `rem` units or Tailwind spacing tokens. |
| Guessing Design | Guessing when data is missing leads to visual defects. | Stop and use `get_design_context` or ask the user. |

---

## References
- `.agent/skills/markup-generation/references/semantic.md`
- `.agent/skills/markup-generation/references/a11y.md`
- `.agent/skills/markup-generation/references/tokens-tailwind.md`
- `.agent/skills/markup-generation/references/pre-sign-off-checklist/generic.md`
- `.agent/skills/markup-generation/references/verify-protocol.md`
- `.agent/skills/markup-generation/references/swiper-guide.md`
