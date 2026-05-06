---
name: css-sizing
description: Use when determining CSS sizing and layout rules for components. CSS sizing and layout rules for components. Apply to every frontend task.
category: Standards
---

# CSS Sizing

## Purpose

- Enforce layout-agnostic components that adapt to any container.
- Prevent fixed-width components that break responsive layouts.
- Use when writing or reviewing any component that has width, height, or layout constraints.

## Required Context

- Active Figma design data (sizing mode per element: Fill / Hug / Fixed).
- Active token file for the current `ui_lib`.

## Hard Rules

- Must **not** define a fixed width on a component unless the design explicitly specifies it **and** the component is standalone (e.g. modal, tooltip, fixed-position overlay).
- Never use raw pixel widths — convert to `rem` or use Tailwind scale.
- Do not set `width` when `max-width` is sufficient.
- If context is missing (no Figma data for sizing mode): default to `max-width` + `w-full` and document the assumption.

## Workflow

1. Check the Figma sizing mode for each element:
   - `Fill container` → use `flex` / `w-full`
   - `Hug contents` → use `auto` / `fit-content`
   - Fixed pixel value → treat as `max-width` unless clearly a standalone or layout component
2. Assign layout responsibility to the **parent**, not the component itself.
3. Prefer `max-width` constraints over hard `width` values.

## Preferred Patterns

- Prefer `max-width` over `width`.
- Prefer `flex` / `grid` over fixed sizing.
- Components should be layout-agnostic — let the parent control placement and width.

## Avoid

- Fixed `w-[…]` on reusable components.
- Setting both `width` and `max-width` on the same element without reason.
- Using `min-width` to work around a layout that should be flex/grid.

## Verification

Before finishing any component with width or height constraints:
```
[ ] No fixed w-[…] on reusable component root (unless standalone)
[ ] No raw px values — all in rem or Tailwind scale
[ ] Parent controls width; component uses w-full or auto
[ ] max-width preferred over width where appropriate
```

## Output Contract

This skill does not produce its own output. Violations are reported inline during code review or sign-off:
```
[css-sizing] [file]:[line] — [description]
Fix: {specific fix}
```

## References

- Figma sizing modes: Fill / Hug / Fixed
- Tailwind: `w-full`, `max-w-[…]`, `flex-1`, `shrink-0`
