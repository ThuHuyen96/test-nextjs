# ADR 001: Avoid Deep CSS Pseudo-Selectors for Component State Overrides

## Context

During the implementation of global inputs using shared UI components (e.g., `<Input>`), we needed to explicitly style component containers with a neutral background (`bg-neutral-variant-3`) while retaining default disabled backgrounds (`bg-disabled-variant-3`) when `disabled` was true.
Initially, complex ad-hoc Tailwind pseudo-selectors targeting internal structure like `[&>.input-wrapper:not(.bg-disabled-variant-3)]:!bg-neutral-variant-3` were used. This led to fragility, hard-to-read code, and occasional overriding of critical disabled state visual indicators provided by the UI framework.

## Decision

We mandate the strict usage of React's dynamic `className` binding (often via `clsx` or `tailwind-merge`) on component root elements in place of internal DOM traversing pseudo-classes (`[&>child]`).
When overriding component backgrounds or states conditionally, standard React prop logic must be used to keep boundaries intact.

### Good

```tsx
<Input
  value={val}
  onChange={setVal}
  className={!disabled ? '!bg-neutral-variant-3' : ''}
  disabled={disabled}
/>
```

### Bad

```tsx
<Input
  value={val}
  onChange={setVal}
  className="[&>.input-wrapper:not(.bg-disabled-variant-3)]:!bg-neutral-variant-3"
  disabled={disabled}
/>
```

## Consequences

- **Positive**: Prevents specificity wars, protects component encapsulation, and naturally integrates with React's state for simple state-dependent UI changes.
- **Negative**: May occasionally require adding slightly more granular utility overrides like `!bg-` instead of simple standard tailwind classes to overcome root component specificities.

## Tags

CSS, Tailwind, React, Next.js, Refactoring, Best Practices
