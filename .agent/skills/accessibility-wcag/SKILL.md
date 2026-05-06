---
name: accessibility-wcag
description: Use when working with UI, frontend, or accessibility review. Ensures WCAG 2.2 AA compliance, produces accessible markup, reviews/audits a11y issues.
category: Standards
---

# Accessibility — WCAG 2.2

## Purpose

- Produce markup that meets WCAG 2.2 Level A (must) and AA (should).
- Audit or review existing markup for accessibility violations.
- Use in three modes: **Implementation** (default), **Review**, or **Audit**.

## Required Context

Load by mode:
- **Implementation** → `references/wcag-a.md` + `references/wcag-aa.md` + `references/aria-patterns.md`
- **Review** → `references/wcag-aa.md` (quick scan)
- **Audit** → `references/wcag-a.md` + `references/wcag-aa.md` + `references/wcag-aaa.md` + `assets/audit-template.md`

## Hard Rules

| Level | Obligation |
|-------|-----------|
| A     | **Must** — hard blocker, cannot be skipped |
| AA    | **Should** — primary WCAG 2.2 compliance target |
| AAA   | Optional — only when explicitly requested by the user / PO |

- Semantic HTML takes priority over ARIA — use the correct element before adding roles.
- No ARIA is better than incorrect ARIA — bad ARIA is worse than none.
- Visible focus must not be removed without a replacement.
- `alt` text describes content, not "Image of…".
- Every ARIA reference (`aria-labelledby`, `aria-controls`) must point to an `id` that exists in the DOM.

## Workflow

### Mode 1 — Implementation (default)

Activate when: writing `.tsx`, implementing design, adding form / button / image / media.

1. **Semantic HTML first** — correct element before any ARIA:
   - `<button>` not `<div onClick>`
   - `<a>` for navigation, `<button>` for actions
   - `<label>` associated with every `<input>` (via `for` or wrapping)
   - Heading hierarchy: `h1` → `h2` → `h3`, no skipped levels

2. **Images** — every `<img>` must have `alt`:
   - Meaningful content → short descriptive alt
   - Decorative → `alt=""` + `aria-hidden="true"` on the wrapper if needed

3. **Keyboard** — every interactive element must:
   - Be focusable (native or `tabindex="0"`)
   - Have a visible focus indicator (do not remove outline without a replacement)
   - Respond to `Enter` / `Space`

4. **Color** — never use color as the only means of conveying information:
   - Text/bg contrast ≥ 4.5:1 (normal text) · ≥ 3:1 (large text / UI components)
   - Use icon + text, not color alone

5. **ARIA** — only when native HTML is insufficient (see `references/aria-patterns.md`):
   - Do not override the semantic role of a native element
   - All `id` references must exist in the DOM

6. **Motion** — if animation runs longer than 5 seconds or loops infinitely:
   - Provide a `prefers-reduced-motion` media query or a pause control

### Mode 2 — Review

Activate when: reviewing a PR or an existing `.tsx` / HTML file.

Default scope: Level A + AA violations only.

Scan sequence:
1. Semantic structure (headings, landmarks, lists)
2. Images — `alt` presence and quality
3. Forms — label linkage, error exposure
4. Interactive controls — keyboard operability, focus visibility
5. ARIA usage — valid roles, required attributes, id references
6. Color-only information patterns

Output format per issue:
```
[LEVEL/SEVERITY] A11Y — [criterion, e.g. 1.1.1]
File/Line: ...
Issue: ...
Fix: ...
```

Severity legend:
- `[A/BLOCKER]` — Level A violation, hard blocker
- `[AA/HIGH]` — Level AA violation, fix before release
- `[AA/MEDIUM]` — Level AA, peripheral flow
- `[AAA/LOW]` — Level AAA, enhancement

### Mode 3 — Audit (strict)

Activate when: user requests "audit", "compliance check", "axe report", "lighthouse a11y".

Required: load `assets/audit-template.md` and follow its output format exactly.

Scope: evaluate **all** Level A + AA criteria. Include AAA if explicitly requested.

Output: per-criterion table with Status = `PASS` / `FAIL` / `PARTIAL` / `N/A`.

## Preferred Patterns

- Prefer one visible label over `aria-label` when the design allows it.
- Prefer `role="status"` / `role="alert"` for dynamic status updates over custom polling.

## Avoid

- `<div>` with `onClick` as a primary interactive control.
- Unlabeled form fields.
- Arbitrary `tabindex` values other than `0` and `-1`.
- Removing `:focus-visible` outline without a visible replacement.
- Using color as the sole differentiator (red = error, green = success — add icon or text).

## Verification

Pre-sign-off checklist:
```
[ ] Every <img> has alt (meaningful or decorative distinction)
[ ] Form inputs have a label (visible or aria-label)
[ ] Heading hierarchy is correct — no skipped levels
[ ] <title> is present and descriptive
[ ] Focus is visible on every interactive element
[ ] Color is not the only means of conveying information
[ ] Keyboard-only users can operate the entire UI
[ ] ARIA added only where native HTML is insufficient
[ ] Dynamic status updates use role="status" or role="alert"
[ ] Motion: prefers-reduced-motion honored (if applicable)
```

## References

| Context | File |
|---------|------|
| Forms, inputs, validation | `references/wcag-aa.md §3.3` + `references/aria-patterns.md §Forms` |
| Interactive widgets (modal, dropdown, tabs) | `references/aria-patterns.md §Widgets` |
| Media (video, audio) | `references/wcag-a.md §1.2` |
| Navigation, skip links | `references/wcag-aa.md §2.4` |
| Color contrast | `references/wcag-aa.md §1.4` |
| AAA compliance | `references/wcag-aaa.md` |
| Audit output | `assets/audit-template.md` |
