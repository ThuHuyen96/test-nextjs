---
name: nextjs-manifesto
description: Foundational principles, core stack (Next.js, Tailwind), and operational workflow for AI Agent development in Next.js projects. Use when establishing project methodology or defining development standards for React/Next.js.
proactive: match
match:
  - "nextjs"
  - "react"
  - "next manifesto"
  - "next development standards"
category: Architecture
human_reviewed: false
---

# Next.js AI Agent Manifesto

This manifesto defines the foundational principles, core stack, and operational workflow for AI Agent development specifically for **Next.js** environments.

## Quick Start

| Rule | ✅ Correct | ❌ Incorrect |
|------|-----------|-------------|
| Component Type | Server Components by default | Everything as Client Components |
| Interactivity | `'use client'` at the leaf level | `'use client'` at the page level |
| Styling | Tailwind CSS utilities + design tokens | CSS Modules (unless existing), Inline styles |
| Data Fetching | Async Server Components / Server Actions | `useEffect` for initial fetch |
| State | Zustand or React Context | Prop drilling or over-using global state |
| Testing | Vitest/Jest + Playwright | No tests |

## 🏗️ Core Foundation Stack

This stack profile assumes a modern Next.js 15/16 setup.

### Stack Profile: Modern Next.js

| Category | Technology | Notes |
|:---|:---|:---|
| **Framework** | Next.js 15/16 | App Router preferred |
| **Language** | TypeScript 5 | Strict mode enabled |
| **Styling** | Tailwind CSS v3/v4 | Mobile-first, utility-first |
| **State** | Zustand / Context | Minimize global state |
| **Data Fetching** | Fetch API / React Server Components | Built-in caching |
| **Forms** | React Hook Form + Zod | Type-safe validation |
| **Testing** | Vitest + Playwright | TDD approach |

### Principles for AI Agents:
- **Server-First**: Start with Server Components. Only add `'use client'` when browser APIs or state/effects are required.
- **Type Safety**: No `any`. Use Zod for runtime validation (API responses, Form data).
- **Performance**: Optimize images using `next/image` and fonts using `next/font`.
- **SEO**: Use Metadata API (`export const metadata = ...`) on every page.

## 🗺️ Development Workflow

| Phase | Focus | Deliverables |
| :--- | :--- | :--- |
| **1. Discovery** | Identify App Router vs Pages Router, check `package.json` | Technology confirmation |
| **2. Architecture** | Define Server vs Client boundaries | Component hierarchy diagram |
| **3. Implementation** | Clean code, hooks, and shared components | Feature-complete components, Server Actions |
| **4. Optimization** | Hydration checks, image optimization, SEO | Optimized Lighthouse scores |
| **5. Verification** | Tests and quality audit | Green test suite, a11y passed |

## 🕹️ Applicability & Governance

1. **Mandatory Adoption**: This manifesto applies to all tasks involving Next.js/React architecture or feature implementation.
2. **Standardization**: Follow the established folder structure (e.g., `app/`, `components/`, `lib/`, `hooks/`).
3. **No Placeholders**: Agents must ship production-ready code with proper error handling and loading states (e.g., `loading.tsx`, `error.tsx`).
4. **Accessibility (a11y)**: Use semantic HTML and ARIA attributes. Test with screen readers if possible.
