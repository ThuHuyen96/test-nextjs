---
name: coding-conventions
description: Project-wide naming and coding conventions for files, variables, functions, React components, and Next.js patterns. Use when writing new code, reviewing code, or before committing changes in Next.js projects. Covers App Router file conventions, PascalCase components, kebab-case TS files, and event handler patterns.
category: Standards
human_reviewed: false
---
# Coding Conventions

## Scope
- **Use for**: Writing new code, code reviews, pre-commit verification in Next.js projects.
- **Core Focus**: Naming rules (files, variables, functions) + React/Next.js patterns + TypeScript best practices.
- **Applies to**: Next.js App Router projects.

## Quick Reference

| Import path | `@components/Button` | `../../components/Button` |

## 1) Import Path Aliases (required)

ALWAYS use the following aliases defined in `tsconfig.json` for imports. NEVER use relative paths (`../`) for directories mapped below:

| Alias | Target Directory | Use for |
|---|---|---|
| `@app/*` | `src/app/*` | Pages, layouts, and app-specific logic |
| `@components/*` | `src/components/*` | Reusable UI components |
| `@hooks/*` | `src/hooks/*` | Custom React hooks |
| `@configs/*` | `src/configs/*` | Application configurations |
| `@api/*` | `src/api/*` | API client and request logic |
| `@types/*` | `src/types/*` | TypeScript type definitions |
| `@domain/*` | `src/domain/*` | Business logic and domain models |
| `@utils/*` | `src/utils/*` | Helper functions and utilities |
| `@/*` | `src/*` | General access to src root |

## 2) File Naming (required)

Read the detailed rules: [file-naming](references/file-naming.md)

Summary:

| File Type | Convention | Example |
|---|---|---|
| App Router Reserved | `lowercase` | `page.tsx`, `layout.tsx`, `loading.tsx` |
| React Component | `PascalCase.tsx` | `UserCard.tsx`, `SidebarNav.tsx` |
| Custom Hook | `camelCase.ts` | `useUserProfile.ts`, `useWindowSize.ts` |
| TypeScript Utility | `kebab-case.ts` | `date-formatter.ts`, `auth-service.ts` |
| Context/Provider | `PascalCaseProvider.tsx` | `AuthProvider.tsx` |
| Type/Interface | `{kebab-case}.type.ts` | `user.type.ts` |
| Constant file | `{kebab-case}.config.ts` | `api.config.ts` |
| Directory | `kebab-case` | `user-profile/` |

## 2) Variable & Function Naming (required)

Read the detailed rules: [variable-naming](references/variable-naming.md)

Summary:

- **Variables & Functions**: `camelCase` — must be descriptive.
- **Constants**: `SNAKE_CASE` — includes config objects and action types.
- **Booleans**: prefix with `is~`, `has~`, `can~`.
- **Event handlers**: `on` prefix + event context (e.g. `onClickLogin`, `onChangeUsername`).
- **No underscore prefix**: `_internal` → `internalMethod`.
- **Explicit return types**: always annotate function return types, including hooks if complex.

## 3) React & Next.js Patterns (required)

Read the detailed rules: [react-next-patterns](references/react-next-patterns.md)

Summary:

- **Server-First**: use Server Components unless interactivity is required.
- **`'use client'` Directive**: Place only at the top of files that need client-side hooks/APIs.
- **Component Props**: Use TypeScript interfaces, suffix with `Props` (e.g., `ButtonProps`).
- **Fragments**: Use `<>...</>` instead of unnecessary `<div>` for grouping.
- **Key Prop**: Always provide a unique `key` when mapping arrays.
- **No Business Logic in Render**: Extract complex logic to hooks or utility functions.
- **Tailwind CSS**: Use Tailwind for all styling. No CSS-in-JS or raw CSS files unless necessary.

## 4) JS/TS Patterns (required)

Read the detailed rules: [js-ts-patterns](references/js-ts-patterns.md)

Summary:

- **No `enum`**: use `as const` object + union type.
- **No literal strings/numbers**: use constant objects (`ROLES.ADMIN`).
- **No nested `if`**: max depth = 1 level. Use guard clauses.
- **Immutability**: Use spread operators (`...`) instead of mutating objects/arrays.
- **Error Handling**: Use `try/catch` in Server Actions and async functions.

## 5) Pre-commit Verification

Before every commit, verify:

- [ ] All new/modified files follow naming conventions (Section 1)
* [ ] Event handlers use `on*` prefix (Section 2)
- [ ] React components are PascalCase and have typed Props (Section 3)
- [ ] No `enum`, no literal strings, no nested `if` (Section 4)
- [ ] Server/Client component boundaries are correctly defined (Section 3)
