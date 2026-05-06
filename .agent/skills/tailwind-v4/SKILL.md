---
name: tailwind-v4
description: "Tailwind CSS v4 patterns: CSS-first config, @theme/@utility/@custom-variant directives, migration from v3. Use when working with Tailwind v4 projects."
proactive: match
match:
  - "@theme"
  - "@utility"
  - "@custom-variant"
  - "@import tailwindcss"
  - "@tailwindcss/postcss"
  - "@tailwindcss/vite"
category: Design
human_reviewed: false
---
# Tailwind CSS v4 Skill

> ⚠️ **Version Guard**: Check the project for `@import "tailwindcss"` or `@tailwindcss/vite`.
> If the project uses `tailwind.config.ts/js/mjs` and `@tailwind` directives, **STOP** — use `tailwind-v3` skill instead.
> This skill applies to Tailwind CSS **v4.x** only.

> **Scope: Tailwind v4 projects ONLY.** For projects using `tailwind.config.ts/js` and `@tailwind` directives, use the `tailwind-v3` skill instead.
>
> **Projects using v4:** `sc-markup` / myhome (via ZeroUI — `@tailwindcss/vite`, `@zero/shared/styles`, `@source` directive).
>
> CSS-first configuration, new directives, migration from v3.

## Quick Reference

### v4 Entry Point

```css
@import "tailwindcss";
```

**NOT the v3 way:**

```css
/* ❌ These cause errors in v4 */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Key Directives

| Directive    | Purpose                                       |
| ------------ | --------------------------------------------- |
| `@theme`     | Define design tokens (colors, spacing, fonts) |
| `@utility`   | Create custom utility classes                 |
| `@custom-variant` | Define custom variants (hover, focus, etc.)   |
| `@source`    | Control class detection and safelisting       |
| `@reference` | Import for @apply without emitting CSS        |

## Theme Configuration (CSS-first)

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --font-display: "Inter", sans-serif;
  --spacing-18: 4.5rem;
}
```

**NOT tailwind.config.js:**

```javascript
// ❌ v3 pattern - don't use in v4
module.exports = {
  theme: {
    extend: {
      colors: { primary: "#3b82f6" },
    },
  },
};
```

## Custom Utilities

```css
@utility content-auto {
  content-visibility: auto;
}

/* Functional utility must end in -* */
@utility tab-* {
  --tab-size: --value(--spacing-*, [integer]);
  tab-size: var(--tab-size);
}
```

## Custom Variants

Use `@custom-variant` to define new variants.

> ⚠️ **`@variant` does NOT exist in Tailwind v4.** The correct directive is always `@custom-variant`. If you see `@variant` in older references, replace it with `@custom-variant`.

```css
@custom-variant hocus (&:hover, &:focus);

/* Dark mode with class strategy */
@custom-variant dark (&:is(.dark *));

/* Body block with @slot */
@custom-variant hocus {
  &:hover,
  &:focus {
    @slot;
  }
}
```

## Theme Configuration

```css
@theme {
  --color-primary: #3b82f6;

  /* Clear namespace */
  --color-*: initial;
}
```

## Theme Flags

- `default`: Merge with default theme
- `inline`: Emit variables to output
- `static`: Use values but don't emit vars
- `reference`: Use values but don't emit CSS

```css
@theme inline {
  --font-sans: "SF Pro Text", system-ui;
}
```

## New Gradient Syntax

```html
<!-- v4 preferred - supports interpolation color space -->
<div class="bg-linear-to-r/oklch from-blue-500 to-purple-500"></div>

<!-- Also: bg-linear-to-b, bg-radial, bg-conic -->
```

## New Variants

- `@min-[400px]:` / `@max-[600px]:` (Container queries)
- `starting:` (`@starting-style`)
- `details-content:` (`::details-content`)
- `inverted-colors:`, `noscript:`, `print:`

## Safelisting Classes

```css
/* Inline safelist */
@source inline("bg-red-500 text-white hidden");

/* From external source */
@source "../content/**/*.md";
```

## Migration from v3

| v3                                    | v4                        |
| ------------------------------------- | ------------------------- |
| `@tailwind base/components/utilities` | `@import "tailwindcss"`   |
| `tailwind.config.js theme.extend`     | `@theme { --color-* }`    |
| PostCSS `tailwindcss` plugin          | `@tailwindcss/postcss`    |
| `@apply` with config values           | `@reference` import first |
| `@variant`                            | `@custom-variant`         |

> **Vite 8 note:** Vite 8 replaces Rollup with Rolldown. In `vite.config.ts`, `build.rollupOptions` becomes `build.rolldownOptions`. Both work during transition, but `rolldownOptions` is the forward-compatible option.

## Renamed / Deprecated Utilities in v4

Tailwind v4 removed many legacy class names that were kept around in v3 for backward compatibility. Using them will cause linter/build warnings:

| Old v3 Class (DO NOT USE)      | New v4 Class (REQUIRED)                                   |
| ------------------------------ | --------------------------------------------------------- |
| `flex-shrink-0`, `flex-shrink` | `shrink-0`, `shrink`                                      |
| `flex-grow-0`, `flex-grow`     | `grow-0`, `grow`                                          |
| `bg-gradient-to-*`             | `bg-linear-to-*`                                          |
| `backdrop-filter`              | (Use backdrop utilities directly like `backdrop-blur-sm`) |
| `filter`                       | (Use filter utilities directly like `blur-sm`)            |
| `transform`                    | (Use transform utilities directly like `scale-105`)       |

## PostCSS Setup

```javascript
// postcss.config.js
export default {
  plugins: {
    "@tailwindcss/postcss": {}, // NOT 'tailwindcss'
  },
};
```

## Vite Setup

```javascript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default {
  plugins: [tailwindcss()],
};
```

Sources: [Tailwind v4 Docs](https://tailwindcss.com/docs), [GitHub](https://github.com/tailwindlabs/tailwindcss)
