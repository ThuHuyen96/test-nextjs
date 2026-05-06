# ADR 001: Frontend Technology Stack Selection

**Date**: 2026-03-17
**Status**: Accepted
**Expires**: 2026-09-17
**Superseded-by**: (none)

## Context
The project requires a modern, future-proof frontend stack that provides excellent developer experience, strong typing, and minimal payload size. We also need strict adherence to a custom internal design system without the bloat of third-party overriding CSS.

## Decision
1. **Framework**: We will use **Next.js 16** alongside **React 19**.
2. **Styling**: We will use **Tailwind CSS v4** as the absolute source of truth for all styling and design tokens.
3. **Component Variants**: We will use **CVA (Class Variance Authority)** to type-safely manage UI component states and variants based on Tailwind classes.
4. **Restriction**: We strictly forbid the use of MUI, Ant Design, Chakra UI, or any other pre-built external UI component libraries unless explicitly mandated by the user. All UI component code must be built from scratch utilizing the Tailwind token system.

## Consequences
- **Positive**: We maintain full ownership over the DOM and Design System. The final bundle size remains optimized.
- **Positive**: CVA ensures that developer mistakes regarding component properties are caught by TypeScript at compile time.
- **Negative**: Initial development velocity for standard complex components (like Modals or nested Selects) will be slower compared to using an off-the-shelf library.
