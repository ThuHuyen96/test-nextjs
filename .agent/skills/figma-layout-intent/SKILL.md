---
name: figma-layout-intent
description: Use when translating Figma positioning artifacts into CSS layout strategies. Translates Figma positioning artifacts into correct CSS layout strategy (flex/grid vs absolute).
category: Development
triggers:
  - Figma codegen contains top:50%, transform:translateY, or absolute positioning
  - Component has different card heights per breakpoint (h-280 sm:h-220)
  - Component switches layout mode between breakpoints (sm:absolute, sm:block)
  - Any sm:p-0, sm:px-0, sm:py-0, or sm:absolute is about to be written
depends_on:
  - .agent/skills/css-sizing/SKILL.md
  - .agent/skills/markup-generation/SKILL.md
conflicts_with:
  - skill: markup-generation
    boundary: >
      markup-generation owns phase ordering.
      figma-layout-intent owns positioning decisions within phases.
      Run these trees during Phase 0 and Phase 1 — do not defer to Phase 2.
---

# Figma Layout Intent

Figma codegen exports raw coordinates, not layout strategies. This skill provides the decision logic for converting those coordinates into the simplest valid CSS layout — preferring flex/grid over absolute where possible.

## Quick Start

| Rule | ✅ Correct | ❌ Incorrect |
| --- | --- | --- |
| Centering | `flex items-center` | `absolute + top-1/2` |
| Overlap | `absolute` for layers | `negative margin` hacks |
| Spacing | Preserve xs values at sm+ | Silently dropping padding |
| Flattening | Remove single-child wraps | Mapping Figma nodes 1:1 |

---

## Core Concepts

### Centering vs Layering
Always check if vertical centering can be achieved with Flexbox before resorting to absolute positioning. Absolute positioning is reserved for elements that overlap siblings, overflow containers, or must be pinned independently.

### Spacing Preservation
When switching layout modes (e.g., flex to absolute), ensure that original spacing (padding) is not orphaned. Any `sm:p-0` reset must be followed by explicit replacement values.

### The Single-Child Rule
Figma designs often have deeply nested frames for organization. If a container has only one child and no visual styles (bg, border), it should be flattened to keep the DOM clean.

---

## Rules

### ALWAYS

- **ALWAYS Classify Intent**: Determine if an element is "content" (participates in flow) or "decoration" (layered/pinned) before choosing a layout strategy.
- **ALWAYS Prefer Flex/Grid**: Only use `absolute` if the element meets specific conditions (overlap, overflow, or corner pinning).
- **ALWAYS Derive from Figma**: Derive cross-axis alignment (`items-center` vs `items-start`) from Figma intent rather than assuming defaults.
- **ALWAYS Preserve Breakpoint Deltas**: Ensure all spacing changes from xs to sm/md/lg are explicitly captured in the code.

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
| --- | --- | --- |
| Codegen Copy-Paste | Figma's `absolute` coordinates don't reflect responsive flow. | Apply decision trees to find the simplest Flex/Grid layout. |
| Spacing Orphanage | Using `sm:p-0` without replacement removes necessary padding. | List and replace all xs spacing values at larger breakpoints. |
| Redundant Wrappers | 1:1 mapping of Figma frames creates a "DIV forest". | Flatten containers that only have one child or no styles. |
| Blind items-start | Assuming `items-start` as a safe default can break centering. | derive alignment from Figma cross-axis intent. |

---

## References
- `.agent/skills/css-sizing/SKILL.md`
- `.agent/skills/markup-generation/SKILL.md`
- `.agent/skills/markup-generation/references/generic.md`
