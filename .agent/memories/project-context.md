# Project Context

## Figma Files in Use
- Main design: `fileKey = Y5MV9hy2H23CZSzaSzCu1S`
  URL pattern: `https://www.figma.com/design/Y5MV9hy2H23CZSzaSzCu1S/...?node-id=...`

## Output Paths
Always read from `prompt-requirement.md §4. Output paths` — this is the source of truth.
Output root can exist at any depth, for example:
- `markup/components/...`
- `src/markup/components/...`
- `packages/web/markup/components/...`

**This project** (event-hub):
- Components: `[output_root]/components/[feature]/[ComponentName].vue`
- Pages:      `[output_root]/pages/[feature]/index.vue`
- Output root: `markup/` (at repo root — no `src/` prefix)

When unsure: run `ls` to confirm the path before writing.

## Stack
- Vue 3 + Nuxt + TypeScript
- `<script setup lang="ts">`
- Nuxt auto-import — use explicit imports when the dependency needs to be clear
- `definePageMeta({ layout: 'default' })` for full-bleed pages

## Project Layout Conventions
- Contained width: `max-w-[134rem] mx-auto w-full px-20 sm:px-40`
- List layout: `lg:max-w-[138rem]` with `layout: 'default'`
- Default grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3`

## Viewport Inset (Horizontal Padding)
| Breakpoint | Pattern |
|------------|---------|
| xs (base)  | `px-20` |
| sm         | `px-40` |
| md         | `px-20` or `px-40` |
| lg         | `px-40` |
Rule: total horizontal inset must be less than the viewport width at that breakpoint.

## Component File Naming
- PascalCase: `LoginForm.vue`, `BubblyzComp.vue`
- Sub-components: `[Feature]/ComponentName.vue`
- Resource items: `*Resource.vue` (e.g. `CommunityCardResource.vue`)

## Import Conventions

**Use relative paths** — do not use `~/` or `@/` aliases for component imports inside `markup/`:

```ts
// ✅ Correct
import MyComp from '../../components/Feature/MyComp.vue'
import type { BannerItem } from '../../components/TestAgent/3x1Banner.vue'

// ❌ Wrong
import MyComp from '~/markup/components/Feature/MyComp.vue'
import MyComp from '@/markup/components/Feature/MyComp.vue'
```

Reference: see actual usage at `markup/pages/stove-connect/index.vue` — all imports use `../../components/...`.

Confirm the actual alias before using it: check `tsconfig.json` / `nuxt.config.ts`.

## Swiper Import Conventions (from Repo)
```ts
import 'swiper/css'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
```
Use PascalCase `<Swiper>` `<SwiperSlide>` in the template.
