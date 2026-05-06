---
name: quality-audit
description: Comprehensive quality audit for frontend changes including a11y, next-best-practices, and design consistency. Use for final verification before PR or task completion.
category: Standards
human_reviewed: false
depends_on:
  - a11y-wcag
  - next-best-practices
  - coding-conventions
  - react-useeffect
  - review-react
---
# Frontend Quality Audit

## Scope
- **Use for**: Final verification before PR or task completion.
- **Core Focus**: Cross-domain consistency (Accessibility + Code Quality + Design).
- **Orchestration**: This skill acts as a meta-checklist covering accessibility, framework best practices, and design consistency.

This skill provides a rigorous verification checklist to ensure every frontend change meets accessibility, framework best practices, and design standards.

## Quick Reference

| Area | ✅ Correct | ❌ Incorrect |
|------|-----------|-------------|
| Focus states | `focus-visible:ring-2 ring-primary` | No visible focus indicator |
| Landmarks | `<main>`, `<nav>`, `<header>` | `<div className="main">` |
| Components | Server/Client boundaries defined | Mixing server/client logic arbitrarily |
| Colors | `bg-primary`, `text-on-surface` | `#1C1B1F`, hardcoded hex |
## Audit Checklist

### 1. Accessibility

- [ ] **Focus States**: High-contrast rings for keyboard navigation.
- [ ] **Semantic Landmarking**: Use of `<main>`, `<nav>`, `<header>`, etc.
- [ ] **ARIA**: Correct roles for interactive components.
- [ ] **Keyboard**: All interactive elements reachable and activatable via keyboard.

### 2. Framework Best Practices

- [ ] **Next.js App Router**: Correct directory and special file usage (`page.tsx`, `layout.tsx`).
- [ ] **React Server Components**: Server components used by default; `'use client'` only where necessary.
- [ ] **Next.js 16 Caching**: Correct use of `'use cache'`, `cacheLife`, and `cacheTag` (see `next-cache-components`).
- [ ] **State**: Local state managed via hooks; global state managed via context or dedicated library.
- [ ] **Types**: Props fully typed, no `any`.
- [ ] **useEffect**: No unnecessary Effects — derived state calculated during render, event handlers used for user interactions (see `react-useeffect`).
- [ ] **React Rules**: No purity violations, hooks called at top-level only, no inline component definitions (see `review-react`).
- [ ] **Re-render**: No unnecessary re-renders — memoization applied correctly, primitive deps in effects (see `review-react`).

### 3. Design Consistency

- [ ] **Tailwind 4**: Use of `@theme` tokens and CSS variables.
- [ ] **Spacing**: Consistent base-4 grid adherence.
- [ ] **Colors**: No hardcoded hex values — design tokens only.
- [ ] **Responsive**: Layout tested at mobile and desktop breakpoints.

## Verification Workflow

1. Run `browser_subagent` for visual audit.
2. Use `grep_search` for code-level audit against framework best practices.
3. Check keyboard navigation manually (Tab, Enter, Escape flows).
4. Document audit findings appropriately.

## Rules

- **ALWAYS** run this audit before marking a task as "Done".
- **ALWAYS** complete the a11y section — it is non-negotiable for every change.
- **ALWAYS** document any exceptions with justification.
