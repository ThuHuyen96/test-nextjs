---
trigger: always_on
description: Workspace context and technology routing. Check package.json to load relevant skills.
---

## Workspace Context

**Before any task**: read the root `package.json` to determine the technologies and versions being used.

### Skill Routing

| Signal in package.json | Skill to load |
|---|---|
| `next` | `next-best-practices`, `next-upgrade`, `nextjs-manifesto`, `coding-conventions` |
| `next ^16` | `next-cache-components` |
| `tailwindcss ^4` or `@tailwindcss/postcss` | `tailwind-v4` |