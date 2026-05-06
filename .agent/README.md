# 🛡️ Agent Skill Capabilities

This file is **auto-generated**. Do not edit manually.

## 🛡️ Standards

| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **[a11y-wcag](./skills/a11y-wcag/SKILL.md)** | WCAG 2.1 accessibility checklist based on W3C ARRM. Use for a11y audits, compliance checks, and role-based a11y tasks. | — | ✅ Enterprise | 🟢 PASS | ⚪ N/A | ✅ Ryan |
| **[accessibility-wcag](./skills/accessibility-wcag/SKILL.md)** | Use when working with UI, frontend, or accessibility review. Ensures WCAG 2.2 AA compliance, produces accessible markup, reviews/audits a11y issues. | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |
| **[coding-conventions](./skills/coding-conventions/SKILL.md)** | Project-wide naming and coding conventions for files, variables, functions, React components, and Next.js patterns. Use when writing new code, reviewing code, or before committing changes in Next.js p | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |
| **[css-sizing](./skills/css-sizing/SKILL.md)** | Use when determining CSS sizing and layout rules for components. CSS sizing and layout rules for components. Apply to every frontend task. | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |
| **[quality-audit](./skills/quality-audit/SKILL.md)** | Comprehensive quality audit for frontend changes including a11y, next-best-practices, and design consistency. Use for final verification before PR or task completion. | `a11y-wcag`, `next-best-practices`, `coding-conventions`, `react-useeffect`, `review-react` | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |

## 📦 Development

| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **[figma-layout-intent](./skills/figma-layout-intent/SKILL.md)** | Use when translating Figma positioning artifacts into CSS layout strategies. Translates Figma positioning artifacts into correct CSS layout strategy (flex/grid vs absolute). | `.agent/skills/css-sizing/SKILL.md`, `.agent/skills/markup-generation/SKILL.md` | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |
| **[markup-generation](./skills/markup-generation/SKILL.md)** | Use when translating Figma designs into production-ready Next.js 16 (React) components. Governs the end-to-end workflow (Phase 0→3) for translating Figma designs into production-ready Next.js 16 (Reac | `.agent/skills/css-sizing/SKILL.md`, `.agent/skills/figma-layout-intent/SKILL.md`, `.agent/skills/markup-generation/references/semantic.md`, `.agent/skills/markup-generation/references/a11y.md`, `.agent/skills/markup-generation/references/tokens-tailwind.md` | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |
| **[preflight](./skills/preflight/SKILL.md)** | Use when validating Figma URLs, fetching design data, and surfacing errors before code generation. Hard-stop conditions and Figma MCP validation rules. | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |

## 📐 Figma

| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **[figma-node-explorer](./skills/figma-node-explorer/SKILL.md)** | Extract child node-ids from Figma design for component breakdown. Use when user provides Figma URL, wants to explore node hierarchy, break design into components, or implement design section by sectio | — | ✅ Enterprise | 🟢 PASS | ⚪ N/A | ✅ Ryan |
| **[figma-to-next-component](./skills/figma-to-next-component/SKILL.md)** | Extract Figma node data via MCP and implement a polished React component using the project's existing component library and design tokens. Use when converting a Figma URL or node into an independent . | `next-best-practices` | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |

## 🧠 Meta

| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **[find-skills](./skills/find-skills/SKILL.md)** | Helps users discover and install agent skills. Use when user asks questions like "how do I do X", "find a skill for X", "is there a skill that can...", or expresses interest in extending capabilities. | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |

## 🔧 DevOps

| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **[git-commit](./skills/git-commit/SKILL.md)** | Creates git commits following Conventional Commits format with type/scope/subject. Use when user wants to commit changes, create commit, save work, or stage and commit. Handles regular branch commits  | `coding-conventions` | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |

## 📦 Framework

| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **[next-best-practices](./skills/next-best-practices/SKILL.md)** | Use when building Next.js apps to enforce best practices for file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, and bundlin | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |
| **[next-cache-components](./skills/next-cache-components/SKILL.md)** | Use when implementing caching or PPR in Next.js 16+ using use cache directive, cacheLife, cacheTag, and updateTag. | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |
| **[next-compile](./skills/next-compile/SKILL.md)** | Use when checking Next.js compilation errors via a running dev server. Turbopack only. MANDATORY after every code edit before reporting work complete. | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |
| **[next-upgrade](./skills/next-upgrade/SKILL.md)** | Use when upgrading Next.js to the latest version following official migration guides and codemods. | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |

## 🏛️ Architecture

| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **[nextjs-manifesto](./skills/nextjs-manifesto/SKILL.md)** | Foundational principles, core stack (Next.js, Tailwind), and operational workflow for AI Agent development in Next.js projects. Use when establishing project methodology or defining development standa | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |

## 📦 React

| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **[react-useeffect](./skills/react-useeffect/SKILL.md)** | React useEffect best practices from official docs. Use when writing/reviewing useEffect, useState for derived values, data fetching, or state synchronization. Teaches when NOT to use Effect and better | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |
| **[review-react](./skills/review-react/SKILL.md)** | React code review guidelines covering Rules of React, re-render optimization, rendering performance, and advanced patterns. Activates when writing, reviewing, or refactoring React components, hooks, o | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |

## 🎨 Design

| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **[tailwind-v4](./skills/tailwind-v4/SKILL.md)** | "Tailwind CSS v4 patterns: CSS-first config, @theme/@utility/@custom-variant directives, migration from v3. Use when working with Tailwind v4 projects." | — | 🚧 Draft | 🟢 PASS | ⚪ N/A | ⚠️ |


---
*Dashboard maintained by Agent Engine*
