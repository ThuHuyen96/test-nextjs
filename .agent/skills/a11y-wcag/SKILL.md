---
name: a11y-wcag
description: WCAG 2.1 accessibility checklist based on W3C ARRM. Use for a11y audits, compliance checks, and role-based a11y tasks.
category: Standards
human_reviewed: Ryan
---

# Frontend Accessibility (WCAG 2.1)

> **Layer:** Domain (knowledge reference)

WCAG 2.1 accessibility checklist based on W3C ARRM framework with role-based task ownership.

> **Note:** This document highlights the critical tasks. For the complete list of all 254 ARRM tasks, please read `references/wcag-arrm-full.md`.

## Beginner Context

Accessibility (a11y) ensures that digital products are usable by people with disabilities. The WCAG principles are organized around four core concepts (POUR):

- **Perceivable**: Users must be able to perceive the information presented (e.g., providing alt text for screen readers).
- **Operable**: Users must be able to operate the interface (e.g., full keyboard usability, no keyboard traps).
- **Understandable**: The information and operation of the UI must be understandable (e.g., clear error messages).
- **Robust**: Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies.

When in doubt, prioritize native semantic HTML (e.g., `<button>` over `<div onClick="...">`) as it comes with built-in accessibility features out of the box.

## Quick Reference

### Task Categories

| Prefix | Category    | Count | Primary Focus                 |
| ------ | ----------- | ----- | ----------------------------- |
| IMG    | Images      | 22    | Alt text, decorative images   |
| SEM    | Semantics   | 29    | HTML structure, headings      |
| INP    | Input       | 25    | Keyboard, focus, pointer      |
| FRM    | Forms       | 39    | Labels, errors, instructions  |
| CSS    | Styles      | 23    | Color, contrast, reflow       |
| NAV    | Navigation  | 31    | Skip links, focus order       |
| TAB    | Tables      | 17    | Data tables, headers          |
| ANM    | Audio/Media | 37    | Captions, transcripts         |
| SCT    | Content     | 29    | Language, reading level       |
| DYN    | Dynamic     | 3     | Status messages, live regions |

### WCAG Levels

- **A** (Basic) - Must pass for basic accessibility
- **AA** (Target) - Legal compliance target (most common)
- **AAA** (Enhanced) - Highest level, not always achievable

## Role-Based Checklists

### Markup Developer (Primary)

Focus: HTML structure, semantic markup, ARIA implementation.

**Critical Tasks (Level A):**

```
IMG-003  Decorative images use null alt (alt="")
IMG-004  Adjacent described images use null alt
IMG-007  Informative images in foreground, not CSS
SEM-002  HTML elements used per specification
SEM-003  Navigation in <nav> or <ul>/<ol>
SEM-005  Main content in <main>
SEM-008  Elements used for semantics, not appearance
SEM-011  Heading elements for actual headings
SEM-013  Headings use <h1>-<h6>
SEM-014  Page has h1 describing content
SEM-016  Native HTML over custom widgets
SEM-017  DOM order matches visual order
SEM-024  Proper nesting per spec
SEM-025  Complete start/end tags
SEM-026  Unique ID values
SEM-027  No duplicate attributes
FRM-001  Labels use <label> element
FRM-002  Labels associated via for/id
FRM-003  Submit uses <button> or input[type=submit]
FRM-004  Related fields in <fieldset>/<legend>
FRM-007  Instructions conveyed to AT
FRM-009  Required fields announced to AT
INP-012  Can navigate away from all elements
INP-015  Tab order matches visual order
INP-016  No positive tabindex values
INP-018  Visible focus indicator
NAV-012  Skip links work correctly
CSS-005  No informative ::before/::after content
CSS-014  Text resizable without overflow
```

**Critical Tasks (Level AA):**

```
FRM-013  Autocomplete attributes set correctly
CSS-022  outline not set to none/0
DYN-003  Status messages use ARIA live regions
```

### Frontend Developer (Primary)

Focus: JavaScript behavior, dynamic interactions, keyboard support.

**Critical Tasks (Level A):**

```
INP-004  All elements keyboard reachable
INP-005  All elements keyboard activatable
INP-006  Not device-specific event handlers only
INP-010  Custom widgets replicate native keyboard
INP-011  No JS events on non-interactive elements
SEM-010  All behaviors in JavaScript
IMG-015  Dynamic image alt updates with image
FRM-019  No auto context change on input
NAV-013  Focus order is logical
NAV-016  Focus returns after modal close
NAV-017  Focus not unexpectedly moved
ANM-023  Volume controls independent of system
ANM-029  Media player keyboard operable
```

### Designer (Primary)

Focus: Visual design, UX patterns, interaction design.

**Critical Tasks (Level A):**

```
INP-007  Hover/focus states designed
INP-008  Focus states planned for all elements
NAV-001  CTAs visually identifiable
NAV-009  Skip link mechanism designed
NAV-014  Logical focus order defined
CSS-006  Not shape/location only for info
```

**Critical Tasks (Level AA):**

```
INP-017  Focus indicator designed
CSS-009  Not color only for info
CSS-010  Link contrast 3:1 vs surrounding text
CSS-011  Regular text 4.5:1 contrast
CSS-012  Large text 3:1 contrast
CSS-013  Text resizable to 200%
CSS-019  No multidirectional scroll on reflow
CSS-020  Non-text UI 3:1 contrast
CSS-023  Touch targets 44x44 (AAA but recommended)
```

### Content Editor (Primary)

Focus: Content authoring, alt text, labels.

**Critical Tasks (Level A):**

```
IMG-001  Informative alt text (not "image.jpg")
IMG-002  Clear, meaningful alt descriptions
IMG-006  Image-of-text includes all text
IMG-008  Complex image purpose described
IMG-010  Complex image full explanation
IMG-013  Functional images describe purpose
IMG-014  Alt doesn't duplicate visible text
IMG-017  Decorative images identified
SEM-012  Headings follow hierarchy (no skips)
SEM-019  Page title matches h1
SEM-020  Unique, descriptive page titles
NAV-018  Link text describes destination
```

**Critical Tasks (Level AA):**

```
SEM-022  Heading text describes topic
SEM-023  Main heading describes page
FRM-016  Form control purpose clear
FRM-033  Error messages explain how to fix
```

## Complex ARIA Code Examples

When native HTML is insufficient, ARIA (Accessible Rich Internet Applications) attributes are required. Here are some complex patterns:

### 1. Accessible Modal/Dialog (Focus Management)

```html
<!-- The dialog should have role="dialog" and aria-modal="true" -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  tabindex="-1"
  id="my-modal"
>
  <h2 id="modal-title">Settings</h2>

  <!-- Content... -->
  <input type="text" aria-label="Setting 1" />

  <button aria-label="Close settings modal" id="close-btn">Close</button>
</div>
```

_Note: You must use JavaScript to trap the focus inside the modal and return focus to the trigger button when closed._

### 2. ARIA Live Regions (Dynamic Updates)

```html
<!-- Use aria-live to announce dynamic changes without stealing focus -->
<div aria-live="polite" aria-atomic="true">
  <!-- Content injected here via JS will be announced by the screen reader smoothly -->
  <span id="form-error-message" class="error">Username is already taken.</span>
</div>

<!-- For urgent interruptions, use aria-live="assertive" or role="alert" -->
<div role="alert">Your session will expire in 1 minute.</div>
```

### 3. Disclosures / Accordions

```html
<!-- Button controls the expanded state and links to the content panel -->
<button
  aria-expanded="false"
  aria-controls="accordion-content-1"
  id="accordion-btn-1"
>
  Toggle Details
</button>

<!-- The content panel must be associated with the button -->
<div
  id="accordion-content-1"
  role="region"
  aria-labelledby="accordion-btn-1"
  hidden
>
  Here are the hidden details.
</div>
```

## React & Next.js Implementation

When working with React/Next.js, apply these syntax and framework-specific rules:

### 1. JSX Attribute Differences
React uses camelCase for many HTML attributes and has specific names for a11y-related ones:
- **`htmlFor`**: Use instead of `for` for associating `<label>` with `<input>`.
- **`tabIndex`**: Use instead of `tabindex` (e.g., `tabIndex={0}`).
- **`className`**: Use instead of `class`.
- **ARIA attributes**: Remain the same (e.g., `aria-label`, `aria-expanded`).

### 2. Next.js Image Optimization (`next/image`)
- The `alt` prop is **required**.
- For decorative images, use `alt=""` (Next.js will translate this to a null alt attribute).
- Do not use "image" or "picture" in the alt text.

### 3. Focus Management in SPAs
Next.js is a Single Page Application. Focus does not automatically reset to the top of the page on route changes in all versions/configurations.
- Use `useEffect` to manage focus for dynamic content or modal triggers.
- Consider using libraries like `react-aria` for complex widgets (tabs, comboboxes).

### 4. Automated Testing
Next.js includes `eslint-plugin-jsx-a11y` by default. Ensure your `eslint` configuration captures these rules to catch errors during development.

---

## Usage Pattern

### 1. Determine Your Role

```
Are you writing:
├── HTML/ARIA markup? → Markup Developer checklist
├── JavaScript/interaction? → Frontend Developer checklist
├── Visual/UX design? → Designer checklist
└── Content/labels? → Content Editor checklist
```

### 2. Filter by WCAG Level

```
Target compliance:
├── Level A only → Filter tasks with "A" level
├── Level AA (common) → Filter "A" + "AA" tasks
└── Level AAA → All tasks (rare requirement)
```

### 3. Check Category

```
Working on:
├── Images? → IMG-* tasks
├── Forms? → FRM-* tasks
├── Navigation? → NAV-* tasks
├── Keyboard? → INP-* tasks
└── Video/Audio? → ANM-* tasks
```

## Quick Audit Checklist

### Level A Minimum (15 items)

```markdown
## Images

- [ ] IMG-002: Alt text describes image
- [ ] IMG-003: Decorative images have alt=""

## Structure

- [ ] SEM-014: Page has h1
- [ ] SEM-012: Headings don't skip levels
- [ ] SEM-020: Page title is descriptive

## Keyboard

- [ ] INP-004: All elements keyboard reachable
- [ ] INP-012: No keyboard traps
- [ ] INP-018: Visible focus indicator

## Forms

- [ ] FRM-001: All inputs have labels
- [ ] FRM-002: Labels programmatically associated
- [ ] FRM-009: Required fields announced

## Navigation

- [ ] NAV-009: Skip link available
- [ ] NAV-013: Focus order logical

## Color

- [ ] CSS-009: Not color only for info
- [ ] CSS-011: Text contrast 4.5:1
```

### Level AA Addition (10 items)

```markdown
## Contrast

- [ ] CSS-020: Non-text UI 3:1 contrast

## Reflow

- [ ] CSS-019: No horizontal scroll at 320px

## Forms

- [ ] FRM-013: Autocomplete attributes used
- [ ] FRM-033: Error messages actionable

## Focus

- [ ] INP-017: Custom focus indicator designed

## Dynamic

- [ ] DYN-003: Status messages use live regions

## Content

- [ ] SEM-022: Headings are descriptive

## Media

- [ ] ANM-007: Captions for video
- [ ] ANM-014: Audio description available
```

## Important Rules

- **ALWAYS** check tasks relevant to YOUR role first
- **ALWAYS** target Level AA for legal compliance
- **NEVER** assume decorative without verification
- **NEVER** remove focus indicator (outline: none)
- Group related fixes → single commit

## Definition of Done

- [ ] Role-specific tasks checked
- [ ] Level A tasks pass
- [ ] Level AA tasks pass (if targeting AA)
- [ ] Tested with keyboard only
- [ ] Tested with screen reader (basic)
- [ ] Color contrast verified
