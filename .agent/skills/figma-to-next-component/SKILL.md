---
name: figma-to-next-component
description: Extract Figma node data via MCP and implement a polished React component using the project's existing component library and design tokens. Use when converting a Figma URL or node into an independent .tsx component file. Does NOT create full page layouts (no GNB, no Footer).
category: Figma
human_reviewed: false
depends_on:
  - next-best-practices
  - composition-patterns
---

# 🎨 Figma to Next.js Component

## Mission

Translate a Figma Node (provided via URL) into an independent `.tsx` component file.

This skill produces only component-level output.

It does NOT generate:
- full pages
- layouts
- navigation
- footer
- app shell structures

---

# Step 0: Discover Project Context

Before writing any code, ALWAYS inspect the existing project structure.

## 1. Read `package.json`
Identify: UI library, icon library, animation library, styling system.
Examples: `shadcn/ui`, `radix-ui`, `mui`, `chakra-ui`, `lucide-react`, `framer-motion`.
Never assume a library exists.

---

## 2. Read Tailwind Configuration
Inspect: `tailwind.config.ts`, `tailwind.config.js`, global CSS files, Tailwind v4 `@theme`.
Discover: color tokens, typography/spacing scales, radius/shadow tokens, dark mode strategy.

---

## 3. Read Existing Components
Inspect: `src/components`, `components`, `app/components`.
Learn: component patterns, naming/spacing conventions, typography usage, responsive behavior.
Prefer consistency with the existing codebase over generating isolated patterns.

---

# Step 1: ALWAYS Use Figma MCP First

## Required MCP Calls

Before writing any JSX:

1. Use:
   - `mcp_figma-dev-mode-mcp-server_get_design_context`

2. Then use:
   - `get_screenshot`

Never estimate layout visually from screenshots alone.

---

## MUST Extract From Figma
Always extract: spacing, padding, margin, gap, typography, border radius, shadows, colors, flex/grid structure, responsive variants, positioning rules.
Never guess these values.

---

# Core Rules

## ALWAYS map colors to design tokens

Convert ALL Figma colors into project design tokens.

### ✅ Correct

```tsx
bg-primary text-muted-foreground border-border
```

### ❌ Incorrect

```tsx
bg-[#1C1B1F]
text-[rgba(255,255,255,0.92)]
```

Raw hex values are forbidden unless:
- the project already uses raw values extensively
- or no matching token exists

---

## ALWAYS normalize spacing values

Map Figma spacing values to the nearest Tailwind scale.

### Examples

| Figma | Tailwind |
|---|---|
| 4px | `p-1` |
| 8px | `gap-2` |
| 12px | `px-3` |
| 16px | `p-4` |
| 24px | `gap-6` |

Avoid arbitrary values like:
```tsx
gap-[13px]
px-[19px]
```

Only use arbitrary spacing when:
- visually critical
- or already common in the project

---

## ALWAYS map typography to the project's typography scale

Prefer semantic typography utilities.

### ✅ Correct

```tsx
text-sm leading-5
text-base leading-6
```

### ❌ Incorrect

```tsx
text-[14px] leading-[20px]
```

Only use arbitrary typography values when no matching scale exists.

---

## ALWAYS use the project's UI library

Map UI elements to existing components.

Examples:
- Button
- Input
- Checkbox
- Tabs
- Dialog
- Avatar

### ✅ Correct

```tsx
<Button variant="secondary" />
```

### ❌ Incorrect

```tsx
<button className="..." />
```

Use raw HTML only if no component system exists.

---

## ALWAYS detect icon strategy

Before implementing icons:

1. Check whether the project uses:
   - `lucide-react`
   - `heroicons`
   - `radix-icons`
   - custom SVG system

2. Reuse existing icons whenever possible

3. Inline SVG only when:
   - icon is custom
   - or no matching icon exists

Avoid massive inline SVG blocks.

---

## ALWAYS use optimized image handling

If the project uses Next.js:
- use `next/image`

Preserve:
- aspect ratio
- responsive behavior

Prefer:
```tsx
w-full h-auto
object-cover
```

Avoid unnecessary fixed heights.

---

## ALWAYS preserve accessibility

Use semantic HTML whenever possible.

Required:
- `aria-label` for icon-only buttons
- proper heading hierarchy
- keyboard accessibility
- visible focus states
- sufficient contrast

---

# Layout Rules

## NEVER replicate Figma absolute positioning blindly

Do NOT convert every layer into:
```tsx
absolute top-[127px] left-[52px]
```

Prefer:
- flex
- grid
- stack layouts

Use absolute positioning ONLY when:
- element is floating
- overlapping intentionally
- decorative by design

---

## ALWAYS infer responsive layout intent

Do not blindly preserve desktop dimensions.

Interpret the design intelligently.

### Examples

Desktop horizontal cards:
```tsx
grid-cols-3
```

Should often become:
```tsx
grid-cols-1 md:grid-cols-3
```

Prefer:
- `max-w-*`
- `flex-wrap`
- responsive grids
- adaptive spacing

Avoid rigid fixed widths whenever possible.

---

## ALWAYS preserve DOM hierarchy correctly

Do NOT duplicate JSX for mobile vs desktop.

### ❌ Incorrect

```tsx
{mobile ? <MobileCard /> : <DesktopCard />}
```

### ✅ Correct

Use:
- responsive flex/grid
- responsive ordering
- responsive visibility utilities

Examples:
```tsx
md:flex-row
order-2 md:order-1
hidden md:block
```

---

## Avoid overflow clipping issues

Do NOT use:
```tsx
overflow-hidden
```

on containers that include:
- dropdowns
- tooltips
- popovers
- floating menus

Instead:
- apply border radius to children directly

---

# Motion & Interaction

If the Figma node includes:
- hover states
- pressed states
- transitions
- overlays
- animations

Implement them using:
- Tailwind transitions
- existing animation utilities
- `framer-motion` if installed

Avoid unnecessary animation libraries.

---

# Component Architecture

## Component scope

Generate:
- a single independent component

Do NOT generate:
- page layouts
- app wrappers
- routing
- metadata
- providers

---

## Component decomposition
If the node contains repeated patterns, extract small local subcomponents (e.g., `FeatureCard`, `StatItem`).
Avoid duplicated JSX blocks.

When the node has multiple display variants or interactive states:
- Use **compound components** with shared context instead of boolean props (`isEditing`, `isExpanded`)
- Use **explicit variant components** instead of one monolithic component with many flags
- See `composition-patterns` skill for detailed patterns and code examples.

---

## Client Component Rules

Only add:

```tsx
'use client'
```

when required.

Examples:
- hooks
- event listeners
- browser APIs
- animations requiring client runtime

Do NOT add it unnecessarily.

---

# Tailwind Rules

## Tailwind class ordering

Use consistent ordering:

1. layout
2. positioning
3. spacing
4. sizing
5. typography
6. visuals
7. effects
8. states

Example:

```tsx
flex items-center gap-2 p-4 w-full text-sm font-medium bg-background border rounded-lg hover:bg-accent
```

---

## Respect theme support

If the project supports dark mode:
- preserve token usage
- avoid hardcoded light colors
- support existing theme strategy

---

# Output Requirements

Return ONLY:
1. imports
2. component code
3. helper constants/types/subcomponents if needed

Do NOT return:
- explanations
- markdown fences
- installation steps
- pseudo-code
- reasoning text

---

# Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Hardcoded hex colors | Breaks theming | Use tokens |
| Raw button HTML with UI lib | Inconsistent | Use project Button |
| Blind absolute positioning | Fragile layouts | Use flex/grid |
| Duplicate mobile/desktop JSX | Hard to maintain | Use responsive utilities |
| Arbitrary spacing everywhere | Poor consistency | Normalize spacing |
| Inline SVG for all icons | Huge files | Reuse icon system |
| Fixed desktop widths | Poor responsiveness | Use responsive sizing |
| Full-page generation | Scope violation | Generate component only |
| Skipping MCP extraction | Layout guessing | Always inspect Figma data |

---

# Common Pitfalls

## DOM Structure Mismatch

When elements move between mobile and desktop:
- do NOT duplicate markup
- preserve one DOM structure
- use responsive layout utilities

---

## Missing Responsive Behavior

If Figma contains responsive variants:
- implement matching Tailwind breakpoints
- preserve layout intent

---

## Overflow Clipping

Avoid clipping floating UI elements with parent overflow rules.

---

## Figma Token Mapping

Trace Figma tokens back to:
- component variants
- semantic color tokens
- existing design system usage

Do not invent new token naming patterns unnecessarily.

---

# Prompt Usage

Examples:

- "Build a React component from this Figma URL: <url>"
- "Convert this Figma node to a Next.js component: <url>"
- "Create component from <url>"
- "Generate a reusable TSX component from this Figma node"
