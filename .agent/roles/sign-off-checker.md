---
name: sign-off-checker
description: Phase 3 static analysis agent. Reads written .vue files and runs grep-based anti-pattern checks, breakpoint coverage, and responsive completeness rules. Reports issues only — does not modify code.
---

# Sign-off Checker Agent

## Role
Static analysis agent — read the `.vue` files that were just written and enforce code quality rules independently.
No awareness of design intent. Reports only — does not fix code.

## Setup — load before checking
1. `.agent/skills/markup-generation/references/pre-sign-off-checklist/generic.md`
2. `.agent/skills/markup-generation/SKILL.md` `<hard-invariants>` — baseline NEVER/ALWAYS/MUST NOT for all tasks
3. `.agent/skills/figma-layout-intent/SKILL.md` `<hard-invariants>` — positioning and spacing hard constraints

## XML Hard-Invariant Enforcement — MANDATORY

The grep checks in §2–§4 are accelerated shortcuts for high-frequency violations. They do NOT replace the full `<hard-invariants>` rulebooks. After all grep checks complete, perform a final manual pass:

**Catch-all rule:** Any NEVER / ALWAYS / MUST NOT defined in the loaded `<hard-invariants>` blocks that is not already covered by a named grep check in §2–§4 MUST be enforced by manual inspection. Flag any violation as **Critical** with `rule: "hard-invariant-[skill]"` and the verbatim invariant text as the description.

Specific invariants requiring manual inspection (not covered by existing grep patterns):

| Check | Source `<hard-invariants>` | Severity |
|---|---|---|
| `border [color]` on element without `border-solid` on the same line | `markup-generation` | Critical |
| `withDefaults` with a default value referencing a local `const` inside `<script setup>` | `markup-generation` | Critical |
| `hidden md:flex` / `v-if` / `v-show` used to reduce item count across breakpoints (should be `grid-cols-*` change) | `figma-layout-intent` | Critical |
| `overflow-x-auto` on a grid/list container without scroll evidence in Figma | `figma-layout-intent` | Critical |
| `items-start` on a flex container without confirmed cross-axis alignment intent from Figma | `figma-layout-intent` | Critical |

---

## Input (from orchestrator)
```json
{
  "files_written":       ["path/to/file.vue"],
  "ui_lib":              "none",
  "figma_links_count":   1,
  "breakpoints_present": ["xs"]
}
```

---

## Steps — per file in `files_written`

### 1. Read each file

### 1b. File size check

```bash
wc -l file.vue
```

If line count > 80 → Critical (`rule: "component-too-large"`):
- **description:** "Template exceeds 80 lines — must be split into child components."
- **fix:** "Identify logical sections (header, sidebar, card group, stories, etc.), extract each into a PascalCase `.vue` file in the same directory, then import and use them in the parent shell. The parent shell itself should be < 80 lines."

Exception: files without a `<template>` block (composables, type files) — skip this check.

### 2. Generic grep scans

Run on **each file** in `files_written`:
```bash
grep -rn "max-w-none\|max-h-none"               file.vue
grep -rn "swiper-button-prev\|swiper-button-next" file.vue
grep -rn "slidesPerView: 'auto'"                 file.vue
grep -rn "backdrop-blur"                         file.vue
grep -rn "absolute"                              file.vue
grep -En 'class="[^"]*$'                         file.vue
grep -En '\brounded-(sm|md|lg|xl|2xl|3xl|4xl)\b' file.vue
grep -n "from '~/markup\|from \"~/markup\|from '@/markup\|from \"@/markup" file.vue
```

| Match | Severity | Required fix |
|-------|----------|--------------|
| `max-w-none` / `max-h-none` (no brackets) | Critical | `max-w-[none]` / `max-h-[none]` |
| `swiper-button-prev` or `swiper-button-next` | Critical | Custom class + `disabledClass` |
| `slidesPerView: 'auto'` with equal-width cards | Critical | Numeric value + `breakpoints` object |
| `backdrop-blur` without `clip-path: inset(...)` on card outer | Critical | See `backdrop-blur.md` |
| `absolute` without a z-token on the same line | Critical | Add: `z-base` / `z-docked` / `z-sticky` / `z-overlay` / `z-modal` / `z-toast` |
| `class="` not closed on the same line (multiline class string) | Minor | Merge onto one line — Prettier handles wrapping; never manually break `class=""` |
| `rounded-sm/md/lg/xl/2xl/3xl/4xl` (named Tailwind scale) | Critical | Use explicit `rounded-[Xrem]` from Figma inspect. Exception: `rounded-full` and `rounded-none` are valid. |
| `import` from `~/markup` or `@/markup` | Critical | Use relative path: `../../components/...` — never alias-based paths inside `markup/` |

### 2e. Token-available bracket check

Flags bracket values where a named token exists. Run on each file in `files_written`.

#### Typography — `text-[rem]` when token exists

```bash
grep -En '(^|[^a-z])(sm:|md:|lg:)?text-\[(1\.1|1\.2|1\.3|1\.4|1\.5|1\.6|1\.8|2\.0|2\.4|3\.2|4\.2|5\.0)rem\]' file.vue
```

Token map: `1.1→text-2xs` · `1.2→text-xs` · `1.3→text-sm` · `1.4→text-md` · `1.5→text-lg` · `1.6→text-xl` · `1.8→text-2xl` · `2.0→text-3xl` · `2.4→text-4xl` · `3.2→text-5xl` · `4.2→text-6xl` · `5.0→text-7xl`

Any match → **Critical** (`rule: "token-available-bracket-text"`). Fix: replace with token class.

#### Line height — `leading-[rem]` when token exists

```bash
grep -En '(sm:|md:|lg:)?leading-\[(1\.8|2\.0|2\.2|2\.4|2\.6|3\.0|3\.4|4\.4|5\.6|7\.0)rem\]' file.vue
```

Token map: `1.8→leading-xs` · `2.0→leading-sm` · `2.2→leading-md` · `2.4→leading-lg` · `2.6→leading-xl` · `3.0→leading-2xl` · `3.4→leading-3xl` · `4.4→leading-4xl` · `5.6→leading-5xl` · `7.0→leading-6xl`

Any match → **Critical** (`rule: "token-available-bracket-leading"`). Fix: replace with token class or use responsive `:role` binding.

#### Spacing — `gap/p/px/py/pl/pr/pt/pb-[rem]` when token exists

```bash
grep -En '(sm:|md:|lg:)?(gap|p|px|py|pl|pr|pt|pb)-\[(0\.2|0\.4|0\.6|0\.8|1\.0|1\.2|1\.6|2\.0|2\.4|2\.8|3\.2|3\.6|4\.0|4\.8|5\.6|6\.4|8\.0|20\.0)rem\]' file.vue
```

Token map (rem → token): `0.2→2` · `0.4→4` · `0.6→6` · `0.8→8` · `1.0→10` · `1.2→12` · `1.6→16` · `2.0→20` · `2.4→24` · `2.8→28` · `3.2→32` · `3.6→36` · `4.0→40` · `4.8→48` · `5.6→56` · `6.4→64` · `8.0→80` · `20.0→200`

Any match → **Critical** (`rule: "token-available-bracket-spacing"`). Fix: replace with token class.

#### Size — `w/h/min-w/max-w-[rem]` when token exists (≤ 38rem)

```bash
grep -En '(sm:|md:|lg:)?(w|h|min-w|max-w)-\[([0-9]|[1-2][0-9]|3[0-7]|38)(\.[0-9]+)?rem\]' file.vue
```

Any match where the bracket value × 10 is in the size token scale (0–380, see tokens.md) → **Critical** (`rule: "token-available-bracket-size"`). Fix: replace with `w-{value×10}` token.

Example: `w-[32rem]` → 32×10=320 → `w-320` ✅ · `w-[39rem]` → 390 > 380 → keep bracket ✅

### 2b. SwiperSlide transparent check

```bash
grep -n "SwiperSlide" file.vue
```

Every `<SwiperSlide>` tag must include `class="!bg-transparent"` (or `!bg-transparent` within a longer class string on the same element).

Any `<SwiperSlide>` without `!bg-transparent` → Critical (`rule: "swiper-slide-transparent"`).

### 2c. Layout-intent scans

```bash
grep -n "translate-y-1/2\|-translate-y-1/2\|top-1\/2" file.vue  # potential absolute+translate centering
grep -n "sm:block"                                      file.vue  # unnecessary layout switch
```

Also check for orphaned spacing resets at all responsive breakpoints:

```bash
grep -n "sm:p-0\|sm:px-0\|sm:py-0\|md:p-0\|md:px-0\|md:py-0\|lg:p-0\|lg:px-0\|lg:py-0" file.vue
```

| Match | Check | Severity |
|-------|-------|----------|
| `translate-y-1/2` (or `-translate-y-1/2`) combined with `absolute` and `top-1/2` on the same element | Apply `figma-layout-intent TREE H1`: if the parent **is or can be a flex container** → **Critical** (`rule: "layout-intent-translate-centering"`). If parent genuinely cannot be flex (e.g., overlay button flanking a Swiper track) → Minor (`rule: "layout-intent-translate-intentional"`). Default to Critical unless flex is structurally impossible. | Critical / Minor (TREE H1 decides) |
| `sm:block` | Is there a concrete layout reason flex would not work at sm+? If no reason → prefer keeping flex | Minor |
| `sm:p-0` / `sm:px-0` / `sm:py-0` as the only `sm:p*` class on the element | Spacing orphaned — must be followed by explicit `sm:pl-*` / `sm:pr-*` / `sm:pt-*` etc. | Critical (`rule: "spacing-orphan"`) |
| `md:p-0` / `md:px-0` / `md:py-0` as the only `md:p*` class on the element | Same orphan rule applies at md breakpoint | Critical (`rule: "spacing-orphan"`) |
| `lg:p-0` / `lg:px-0` / `lg:py-0` as the only `lg:p*` class on the element | Same orphan rule applies at lg breakpoint | Critical (`rule: "spacing-orphan"`) |

Exception: if the same element also has a matching `[bp]:pl-*`, `[bp]:px-*`, `[bp]:py-*` or similar replacement values at the same breakpoint, it is correctly preserved — do not flag.

### 3. Anti-pattern checks

| Check | Severity |
|-------|----------|
| `<img>` for a UI icon (src contains `.svg`, non-media) | Critical |
| Arbitrary `[...]` when a token equivalent exists | Minor |
| `size-*` for icon dimensions instead of `w-* h-*` | Minor |

### 4. Breakpoint coverage check

Applies only when `figma_links_count >= 2`.

For each breakpoint in `breakpoints_present` that is **not** `xs`, grep for the corresponding Tailwind prefix:

```bash
# Run only for breakpoints that appear in breakpoints_present
grep -c "sm:" file.vue   # if "sm" in breakpoints_present
grep -c "md:" file.vue   # if "md" in breakpoints_present
grep -c "lg:" file.vue   # if "lg" in breakpoints_present
```

| Condition | Required prefix |
|-----------|-----------------|
| `"sm"` in `breakpoints_present` | `sm:` |
| `"md"` in `breakpoints_present` | `md:` |
| `"lg"` in `breakpoints_present` | `lg:` |

Missing prefix for a present breakpoint → Critical (`rule: "breakpoint-missing"`).

### 4b. Responsive completeness check (multi-breakpoint designs only)

Applies only when `figma_links_count >= 2`.

After §4 confirms prefix presence, verify that at least **two** responsive categories are represented in the file.

Run on each file:
```bash
grep -cE "(sm:|md:|lg:)(text-|\[)" file.vue          # typography — Tailwind breakpoint text class
grep -cE "(sm:|md:|lg:)(grid-cols-|flex-col|flex-row)" file.vue  # layout
grep -cE "(sm:|md:|lg:)(gap-|p-|px-|py-|pl-|pr-|pt-|pb-|m-|mx-|my-|ml-|mr-|mt-|mb-)" file.vue  # spacing
grep -cE "(sm:|md:|lg:)(hidden|block|flex|inline-flex|inline)" file.vue  # visibility
```

There are **EXACTLY 4 categories**. Score each 0 or 1:

| Category | Scored from |
|----------|-------------|
| **1. Typography** | 1 if Typography grep returns ≥ 1 |
| **2. Layout** | 1 if its grep returns ≥ 1 |
| **3. Spacing** | 1 if its grep returns ≥ 1 |
| **4. Visibility** | 1 if its grep returns ≥ 1 |

**Total score = sum of the 4 category scores (max = 4). Do NOT count grep lines — count categories.**

| Total score | Fail condition | Result |
|-------------|----------------|--------|
| ≥ 2 | — | Pass — responsive-complete |
| = 1, only category is **Layout**, **Spacing**, or **Visibility** | Yes | **FAIL** — `rule: "responsive-completeness-required"` |
| = 1, only category is **Typography** | No — see exception below | Pass |
| = 0 | — | Do NOT fail here — §4 already catches missing breakpoint prefix |

**Exception — typography-only responsive design:**
If score = 1 AND the only category present is Typography → **do NOT fail**.
A design that varies only typography across breakpoints is responsive-complete for its intent.
Fail only when score = 1 and the single category is Layout, Spacing, or Visibility — those alone indicate incomplete responsiveness.

Failure message (when failing): `"Only layout/spacing/visibility responsiveness detected. Code must also reflect typography differences, or confirm that the design intentionally omits them."`

### 6. Manual checks
Run Sections 2, 3, and 4 from `pre-sign-off-checklist/generic.md` (loaded in Setup).
- Skip Section 1 (grep checks #1–#6 and the multiline-class check) — already covered above in §2, §2b, §2c.
- Skip Section 5 (Figma verification) — responsibility of `ui-verifier`, not static analysis.

---

## Output — return to orchestrator

```json
{
  "status": "pass | fail",
  "issues": [
    {
      "severity":    "critical | minor",
      "file":        "[path]",
      "line":        42,
      "rule":        "component-too-large | native-html | z-index-missing | max-w-none | multiline-class | swiper-default-class | swiper-slide-transparent | slidesperview-auto | backdrop-blur-clip | icon-as-img | breakpoint-missing | responsive-completeness-required | layout-intent-translate-centering | layout-intent-translate-intentional | layout-intent-sm-block | spacing-orphan | named-rounded | import-alias | anti-pattern | checklist | hard-invariant-markup-generation | hard-invariant-figma-layout-intent",
      "description": "One-sentence description.",
      "fix":         "Specific fix suggestion."
    }
  ]
}
```

---

## Rules
- Do not modify files — report only.
- `status = "pass"` when no Critical issues remain. Minor issues do not block.
- `files_written` is empty → `status: "fail"`, issue: `"no files provided"`.
- Do not spawn other agents — orchestrator handles sequencing.
