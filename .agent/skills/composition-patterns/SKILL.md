---
name: composition-patterns
description:
  React composition patterns that scale. Use when refactoring components with
  boolean prop proliferation, building flexible component libraries, or
  designing reusable APIs. Triggers on tasks involving compound components,
  render props, context providers, or component architecture. Includes React 19
  API changes.
category: React
human_reviewed: false
---

# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid
boolean prop proliferation by using compound components, lifting state, and
composing internals. These patterns make codebases easier for both humans and AI
agents to work with as they scale.

## Quick Start

| Rule | ✅ Correct | ❌ Incorrect |
| ---- | ---------- | ------------ |
| **Avoid boolean props** | `<ThreadComposer channelId="abc" />` | `<Composer isThread channelId="abc" showAttachments />` |
| **Children over render props** | `<Composer.Footer><Submit /></Composer.Footer>` | `<Composer renderFooter={() => <Submit />}` |
| **Lift state to provider** | `<ChannelProvider><Composer /></ChannelProvider>` | State trapped inside composer, synced up via `useEffect` |

---

## Rule Categories by Priority

| Priority | Category                | Impact | Prefix          |
| -------- | ----------------------- | ------ | --------------- |
| 1        | Component Architecture  | HIGH   | `architecture-` |
| 2        | State Management        | MEDIUM | `state-`        |
| 3        | Implementation Patterns | MEDIUM | `patterns-`     |
| 4        | React 19 APIs           | MEDIUM | `react19-`      |

---

## Rules

### 1. Component Architecture (HIGH)

- `architecture-avoid-boolean-props` — Don't add boolean props to customize
  behavior; use composition
- `architecture-compound-components` — Structure complex components with shared
  context

### 2. State Management (MEDIUM)

- `state-decouple-implementation` — Provider is the only place that knows how
  state is managed
- `state-context-interface` — Define generic interface with state, actions, meta
  for dependency injection
- `state-lift-state` — Move state into provider components for sibling access

### 3. Implementation Patterns (MEDIUM)

- `patterns-explicit-variants` — Create explicit variant components instead of
  boolean modes
- `patterns-children-over-render-props` — Use children for composition instead
  of renderX props

### 4. React 19 APIs (MEDIUM)

> **⚠️ React 19+ only.** Skip this section if using React 18 or earlier.

- `react19-no-forwardref` — Don't use `forwardRef`; use `use()` instead of `useContext()`

---

## Full Compiled Document

All rules with expanded code examples: `AGENTS.md`

> **Note on code examples**: Rule files use React Native syntax (`TextInput`,
> `onPress`). On the web (Next.js), substitute:
> `TextInput` → `<input>` / `<textarea>`, `onPress` → `onClick`.
