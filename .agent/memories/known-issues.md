# Known Issues & Pitfalls

Errors and defects that have occurred or been discovered. Read this file before writing code to avoid repeating them.

---

## ESLint: missing semicolon on `import` statements in page files
<!-- status: active -->
<!-- scope: all page .vue files -->

**Incident:** `demo-test.vue` line 2 — `import BannerComp from '...'` had no trailing semicolon, triggering ESLint `semi` error on save.

**Root cause:** Code-generator omitted the semicolon on the last `import` line in `<script setup>` blocks.

**Fix:** Add `;` at end of every `import` statement.

**Rule:** All `import` lines in `<script setup lang="ts">` must end with a semicolon.

---

## `absolute` element without a z-index token
<!-- status: mitigated-by: sign-off-checker §2 grep (absolute check) -->

**Issue:** Many components have `absolute` but no z-token → stacking order is undefined.

**Rule:** Every `absolute` element must have a z-token on the same line:
- Background / decor: `z-base`
- Overlays / groups: `z-docked`
- Content above overlay: `z-sticky`
- Navigation / floating: `z-docked`

**Detection:** `grep -n "absolute" <file> --include="*.vue"` → every match must have a z-token.

---

## Text element: always set `text-align` explicitly
<!-- status: mitigated-by: sign-off-checker checklist S4 -->

**Incident:** BubblyzComp game name/genre had no `text-align` → overridden by external CSS (parent, global stylesheet).

**Fix:** Always pass `text-left` (or `text-center`, `text-right`) directly on every text container.

```vue
<!-- ❌ Missing text-align — gets overridden -->
<p class="text-white">{{ game.name }}</p>

<!-- ✅ Correct -->
<p class="text-white text-left">{{ game.name }}</p>
```

**Rule:** Never leave text alignment to the browser or inheritance. Every text element must declare it explicitly — especially inside card / overlay / carousel contexts.

---



<!-- ============================================================ -->
<!-- GROUP: Swiper                                                 -->
<!-- ============================================================ -->

## Swiper: using default classes `swiper-button-prev/next`
<!-- status: mitigated-by: sign-off-checker §2 grep -->

**Issue:** Some older components used `swiper-button-prev` and `swiper-button-next` (Swiper's default CSS classes) → conflicted with Swiper's own styles; disabled state could not be controlled.

**Rule:** Always use custom classes with a component-specific prefix:
```ts
navigation: {
  prevEl: '.bubblyz-nav-prev',
  nextEl: '.bubblyz-nav-next',
  disabledClass: 'bubblyz-nav-disabled',
}
```
```css
.bubblyz-nav-disabled { opacity: 0.3; pointer-events: none; }
```

---

## Swiper options written inline instead of as a `const`
<!-- status: open -->

**Issue:** Passing options directly as props on `<Swiper>` → verbose and hard to maintain.

**Rule:** Put options in `const swiperOptions = {...}` + `v-bind="swiperOptions"`.

---

## `slidesPerView: 'auto'` with equal-width cards
<!-- status: mitigated-by: sign-off-checker §2 grep -->

**Issue:** Using `'auto'` when cards actually have equal widths → Swiper calculates layout incorrectly.

**Rule:** Only use `'auto'` when card widths are truly variable (variable content). Otherwise → use a numeric `slidesPerView` + `breakpoints`.

---

## SwiperSlide: missing `bg-transparent`
<!-- status: mitigated-by: sign-off-checker §2b -->

**Incident:** BubblyzComp — `<SwiperSlide>` without `class="bg-transparent"` → slide rendered with white/default background, overriding the card background image.

**Root cause:** The rule was documented in `swiper-guide.md` ("Default slide class: `bg-transparent`") but the code-generator omitted it when creating `<SwiperSlide>`.

**Fix:**
```vue
<!-- ❌ Wrong — missing bg-transparent -->
<SwiperSlide v-for="item in items" :key="item.id">

<!-- ✅ Correct -->
<SwiperSlide v-for="item in items" :key="item.id" class="bg-transparent">
```

**Rule:** EVERY `<SwiperSlide>` must have `class="bg-transparent"` — no exceptions.

---

## Duplicate DOM id — nav button + hidden fallback div both share the same `:id`
<!-- status: open -->

**Incident:** `PrBanner.vue` — initial draft rendered both `<button :id="`$[sid]-prev`">` (inside a `hidden md:flex` wrapper) AND `<div :id="`$[sid]-prev`" class="hidden md:hidden">` as a separate fallback. Two elements shared the same `id`, violating the HTML spec.

**Root cause:** Assumed Swiper needed a separate always-visible DOM anchor, so added a hidden div fallback alongside the nav button. Forgot that `hidden` (`display:none`) elements are still queryable by `document.querySelector('#id')`.

**Fix:** Remove the redundant hidden div. Keep only the `<button :id="…">` inside its `hidden md:flex` wrapper. `display:none` does NOT remove the element from the DOM — Swiper can find it by ID at all breakpoints.

**Rule:** Never duplicate `id` values. When Swiper needs `prevEl`/`nextEl` in the DOM: put the actual nav button in a `hidden md:flex` wrapper — it is always in the DOM even when CSS-hidden. No separate fallback anchor needed.

---

<!-- ============================================================ -->
<!-- GROUP: backdrop-blur / clip-path                             -->
<!-- ============================================================ -->

## `overflow-hidden` / `overflow-clip` on a card that contains `backdrop-blur`
<!-- status: mitigated-by: sign-off-checker §2 grep (backdrop-blur check) -->

**Issue:** Using `overflow-hidden` or `overflow-clip` on the card outer when a child has `backdrop-blur` → WebKit (Safari) render bug: blur is clipped or a halo appears.

**Fix:** Use `clip-path: inset(0 round [radius])` on the card outer instead of overflow.

```css
.card-clip { clip-path: inset(0 round 2rem); }
```

**Clarification (BubblyzComp task — CORRECTED):** This rule applies only to the element that directly contains `backdrop-blur` (the card outer). For the **outer section wrapper**: do NOT use `overflow-clip` if the character illustration intentionally overflows the section boundary (e.g. `right-[-7.2rem]`). `overflow-clip` would clip the character. Use `rounded-[Xrem]` alone on the section outer — no overflow property needed, since there is no backdrop-blur on the section itself.

See: `.agent/skills/markup-generation/references/backdrop-blur.md`

---

## `clip-path` on card outer clips overflow children — use `border-radius` instead
<!-- status: open -->

**Incident:** `PrBannerCard.vue` (sm+) — game image must overflow the card's top edge. Initial implementation used `clip-path: inset(0 round 3.2rem)` at all breakpoints. At sm+, the image was cut off by the clip-path even though the layout intended it to overflow.

**Root cause:** `clip-path` creates a hard clip boundary — no child element can render outside it, regardless of `overflow: visible`. This conflicts with any design where a child must overflow the card boundary (decorative images, badges, labels that bleed outside).

**Contrast with `border-radius`:** `border-radius` alone does NOT clip children. Children overflow freely unless `overflow-hidden` / `overflow-clip` is also applied. So:
- Need rounded corners + child overflow → `border-radius` (no overflow clipping)
- Need rounded corners + clip all content (no overflow) → `border-radius + overflow-hidden` OR `clip-path: inset(0 round X)`
- Need rounded corners + `backdrop-blur` child (Safari fix) → `clip-path: inset(0 round X)` on card outer

**Conflict scenario:** Card has `backdrop-blur` child (requires `clip-path`) AND overflow child (forbidden by `clip-path`).
**Resolution:** Split by breakpoint — apply `clip-path` only at the breakpoints where no overflow is needed; remove it (`clip-path: none`) at breakpoints where overflow is required. Use scoped CSS:
```css
/* xs: clip active — image inside card bounds, backdrop-blur pill needs clip */
.pr-banner-card { clip-path: inset(0 round 3.2rem); }

/* sm+: remove clip — image must overflow card top */
@media (min-width: 768px) {
  .pr-banner-card { clip-path: none; }
}
```
At sm+ the card has `border-radius` (from Tailwind `rounded-[3.2rem]`) but no `overflow-hidden`, so the overflow image is visible and the corners are still rounded.

**Rule:** Before applying `clip-path` on a card outer, ask: does any child element need to overflow this card at any breakpoint? If YES → use breakpoint-scoped CSS to remove `clip-path` at those breakpoints and rely on `border-radius` alone for corner rounding. Never assume `clip-path: inset(…)` and child overflow can coexist.

---

## `backdrop-blur` + `rounded-*` on a small inline element (pill, badge, control)
<!-- status: mitigated-by: sign-off-checker §2 grep (backdrop-blur check) -->

**Incident:** `PrBanner` — the banner control pill used `backdrop-blur-[1rem]` and `rounded-full` on the same `SBox` element → potential WebKit halo/fringe on Safari (same root cause as card outer, but for a small inline element).

**Root cause:** The "clip-path on card outer" rule was known for card-level elements, but was not applied to smaller inline blurred elements (pills, badges, overlays) that also combine `backdrop-blur` with `rounded-*`.

**Fix:** Remove `rounded-full` from the element; add a scoped CSS class with `clip-path: inset(0 round 999px)` instead:

```css
.pr-banner-pill-clip {
  clip-path: inset(0 round 999px);
}
```

**Rule:** The `clip-path` rule for `backdrop-blur` + `rounded-*` applies to ALL elements — not just card outers. Any element (pill, badge, floating control) that combines `backdrop-blur` with a border-radius must use `clip-path: inset(0 round <radius>)` via a scoped CSS class. Never use `rounded-*` directly on a `backdrop-blur` element.

---

## `backdrop-blur` without `mask-image` — gradient must be copied exactly from Figma
<!-- status: open -->
<!-- merged from: "backdrop-blur without mask-image" + "Blur overlay mask: gradient direction" + "Blur mask gradient: using old pattern value" -->

**Issue:** Implementing a blur overlay but forgetting `mask-image` gradient → blur has a hard edge, no fade. Or: copying a gradient value from an old pattern instead of reading it from Figma inspect → wrong direction, wrong stops.

**Incidents:**
1. BubblyzComp (1st time) — forgot `mask-image` entirely → hard blur edge.
2. BubblyzComp (2nd time) — used `linear-gradient(to top, black 0%, black 55%, transparent 100%)` but the actual design was `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.80) 42%, #000 83%)`.
3. BubblyzComp (3rd time) — code-generator read `learned-patterns.md §3` and copied the example gradient (which still had the wrong value from incident 2). `known-issues.md` was not read before implementing.

**Root cause:** Assumed gradient direction was "to top" (bottom-transparent) when the design used `180deg` (top-transparent, bottom-solid). `180deg` = top → bottom. Also: reading pattern examples without verifying against Figma.

**Fix:** Always fetch `mask-image` from Figma inspect for the specific component. Never copy blindly from a pattern.

```css
/* ❌ Wrong — assumed default gradient, not from Figma */
-webkit-mask-image: linear-gradient(to top, black 0%, black 55%, transparent 100%);

/* ✅ Correct — copied from Figma inspect (actual values vary per component) */
-webkit-mask-image: /* RUN get_design_context → copy mask-image value here */;
mask-image:         /* same */;
mask-size: 100% 100%;
```

**Rule:** Gradient mask = copy exact from Figma inspect. Check: (1) direction (`deg` vs `"to top/bottom"`), (2) number of stops, (3) opacity at each stop. `180deg` = top → bottom (opposite of `to top`). Pattern examples with `⚠️` comment must always be verified against Figma — never copy blindly.

**Rule:** `known-issues.md` must be read BEFORE implementing, not after.

---

<!-- ============================================================ -->
<!-- GROUP: Vue / layout patterns                                  -->
<!-- ============================================================ -->

## Hiding grid items with `hidden md:flex` instead of responsive grid columns
<!-- status: open -->

**Incident:** `3x1BannerComp.vue` — the 3rd article card was hidden at sm with `:class="{ 'hidden md:flex': index === 2 }"`. This silently removes real content from the user at xs/sm breakpoints, which contradicts the design intent (all 3 publisher cards are equally important content).

**Root cause:** Code-generator assumed "sm shows 2 cards → 3rd must be hidden" instead of "sm shows 2 columns → 3rd card wraps to the next row."

**Fix:** Use `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3` — all items always rendered, columns reflow:
```vue
<!-- ❌ Wrong — hides content from user -->
<div class="flex flex-row">
  <div :class="{ 'hidden md:flex': index === 2 }">...</div>
</div>

<!-- ✅ Correct — all items rendered, layout reflows -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-20">
  <div v-for="item in items" :key="item.id">...</div>
</div>
```

**Rule:** Never use `hidden`/`v-show`/`v-if` to suppress grid items at a breakpoint unless the Figma design **explicitly shows different content** at that breakpoint (e.g. a completely different section). If the design simply shows fewer columns → change the column count, not the item count.

---

## `overflow-x-auto` added without explicit scroll indicator in Figma
<!-- status: open -->

**Incident:** `3x1BannerComp.vue` — a horizontal scroll wrapper (`overflow-x-auto sm:overflow-x-visible`) was added to the banner grid even though the Figma design at xs shows no scroll affordance (no partial card visible, no scroll indicator, no scroll hint in design notes).

**Root cause:** Code-generator assumed "xs can't fit 3 columns → must scroll" without checking the actual xs Figma frame for scroll intent.

**Fix:** Check the xs Figma frame:
- Cards stack vertically → `grid-cols-1` (no scroll)
- Partial next card visible at edge → horizontal scroll with `overflow-x-auto`
- Design explicitly notes "swipe" / carousel → use Swiper

**Rule:** Never add `overflow-x-auto` to a grid/list container unless the xs Figma frame explicitly shows a scroll pattern (partial card bleed, scroll hint, or design annotation). Default to vertical stacking via `grid-cols-1`.

---

## `v-if` on a text prop: removes from DOM instead of CSS toggle
<!-- status: open -->

**Incident:** BubblyzComp description — `v-if="props.description"` caused the element to not exist in the DOM when the prop was empty, but the design required the element to always be present (only hidden/shown by breakpoint).

**Root cause:** `v-if` with an empty string default → false → element removed. When breakpoint-based toggling is needed, the element must always be in the DOM.

**Fix:** Remove `v-if`; use `class="hidden sm:block"` (or the relevant breakpoint) to control visibility with CSS.

**Rule:** Distinguish two cases:
- Element **truly does not exist** in some scenarios (optional data, conditional feature) → use `v-if`
- Element **always in DOM** but hidden/shown by breakpoint or state → use `hidden` / `sm:block` CSS

---

## `items-center` on `flex flex-col` card → children are narrowed
<!-- status: open -->

**Incident:** `BannerCard.vue` used `<article class="flex flex-col gap-16 items-center …">` → children (banner image, publisher block, games list) were center-aligned horizontally → did not fill the full card width.

**Root cause:** In `flex flex-col`, `items-center` aligns children on the **cross axis** (horizontal) → children are only as wide as their natural width instead of stretching to full width.

**Fix:** Remove `items-center` from the flex-col card container. Children default to `items-stretch` = full width.

**Rule:** Flex-col card containers must NOT use `items-center` unless children are intentionally not filling full width. The default `items-stretch` is correct for card layout.

---

## Inner wrapper grouping two sections → breaks gap rhythm + double padding
<!-- status: open -->

**Incident:** `BannerCard.vue` wrapped the publisher block and games list in an inner `<div class="flex flex-col gap-8 …">` — while the card outer already had `gap-16`. The publisher block inside also added `px-16` → total padding from card edge = 16 + 16 = 32px.

**Root cause:** Code-generator wanted to "group" related sections → wrapped them in one container. The container had `gap-8` (smaller) → overrode `gap-16` for the publisher ↔ games spacing. Publisher block added its own `px-16` → double padding not present in the design.

**Fix:** Remove the inner wrapper. Publisher block and games list are direct children of the card (same level as banner image) → card `gap-16` applies evenly. Publisher does not add extra `px-*`.

**Rule:** When a card uses `flex flex-col gap-[N]`, inner sections (banner, publisher, games) must be direct children of the card — do NOT wrap in an intermediate container. Intermediate wrappers break the gap rhythm and create opportunities for double padding.

---

## `withDefaults` cannot reference local variables in `<script setup>`
<!-- status: open -->

**Incident:** `3x1Banner.vue` — `withDefaults(defineProps<Props>(), { items: () => defaultItems })` caused a Vite build error: "`defineProps()` in `<script setup>` cannot reference locally declared variables because it will be hoisted outside of the setup() function."

**Root cause:** `defineProps` (and `withDefaults`) is hoisted by the compiler outside `setup()` scope. A variable declared in the same `<script setup>` is not accessible at hoist time.

**Fix:** Drop `withDefaults`; use `defineProps<Props>()` directly. Provide defaults via `??` inline in the template or a computed:
```vue
<!-- ❌ Wrong — runtime error -->
const props = withDefaults(defineProps<Props>(), {
  items: () => defaultItems
})
const defaultItems = [...]

<!-- ✅ Correct — defineProps directly, fallback via ?? -->
const props = defineProps<Props>()
const defaultItems = [...]
// template: v-for="item in props.items ?? defaultItems"
```

**Rule:** Never use `withDefaults` with a default value that references a local variable. If complex default data is needed: use `??` in template/computed, or extract `defaultItems` to a separate imported file.

---

## Typography: breakpoint override must be derived independently from Figma px
<!-- status: open -->

**Issue:** Using `sm:text-xl` (= 20px) for a 24px sm breakpoint title, when the correct class is `sm:text-2xl` (= 24px). The base `text-xl` (20px) is correct for xs, but the breakpoint override must independently map from Figma px → token rem — not assume "one step up" from the base size.

**Root cause:** The implementing agent incremented from `text-xl` (the base size) by one Tailwind step instead of directly mapping the Figma breakpoint value (24px) to the token table.

**Fix:** Always derive breakpoint overrides directly from Figma px → token table independently:
```
Figma xs title: 20px → text-xl (20px) ← base size, no override needed
Figma sm title: 24px → text-2xl (24px) → sm:text-2xl sm:leading-8
Figma md title: 28px → text-[28px] (off-scale) → md:text-[28px] md:leading-9
Figma lg title: 36px → text-4xl (36px) → lg:text-4xl lg:leading-10
```

**Rule:** Breakpoint typography overrides must be derived from Figma px values via the token table independently — never by incrementing from the base class. Check the token table for each breakpoint value separately.

---

<!-- ============================================================ -->
<!-- GROUP: Code style / formatting                                -->
<!-- ============================================================ -->

## `class="…"` manually broken across multiple lines
<!-- status: open -->

**Incident:** BubblyzComp — class string was split across multiple lines with manual indentation:
```vue
class="text-left line-clamp-2
       sm:text-[2.4rem] sm:leading-[3.4rem]"
```

**Root cause:** Code-generator split the class string across lines for readability by breakpoint. Prettier does not understand this intent → merges it according to its own print width → creates noisy diffs and may cause parse errors in some Prettier configs.

**Fix:** Keep the entire class string on one line:
```vue
<!-- ❌ Wrong -->
class="text-left line-clamp-2
       sm:text-[2.4rem]"

<!-- ✅ Correct -->
class="text-left line-clamp-2 sm:text-[2.4rem]"
```

**Rule:** `class="…"` always on one line — never manually break. Let Prettier handle wrapping at the attribute level.

---

## ESLint: multi-attribute elements and inline text content require line breaks
<!-- status: open -->

**Incident:** `PrBannerCard.vue` — ESLint reported errors on elements with 2+ attributes written on one line, and on `{{ slot }}` content inline with the opening tag.

**Root cause:** Project ESLint config enforces `vue/max-attributes-per-line` (attributes split to own lines when count ≥ 2) and requires template expression content on its own line inside block elements.

**Fix:**
```vue
<!-- ❌ Wrong — inline content + all attrs on one line -->
<h3 class="text-xl font-bold text-white ...">{{ title }}</h3>

<!-- ✅ Correct — content on its own line -->
<h3 class="text-xl font-bold text-white ...">
  {{ title }}
</h3>

<!-- ❌ Wrong — 2+ attrs inline on element -->
<div class="..." v-if="x">

<!-- ✅ Correct — attrs on own lines when 2+ -->
<div
  class="..."
  v-if="x"
>
```

**Rule:** Any element with 2+ attributes → each attribute on its own line. Any `{{ expression }}` text content → on its own line inside the element. The `class="..."` string itself stays single-line (do not break the class value).

---

<!-- ============================================================ -->
<!-- GROUP: Project structure / setup                              -->
<!-- ============================================================ -->

## Wrong output path — not verified before writing
<!-- status: open -->

**Issue:** Files written to the wrong path (e.g. `src/markup/` instead of `markup/`) because the path was not verified first.

**Fix:** Always read `prompt-requirement.md §4. Output paths` to get the correct path.

**Rule:** Before writing the first file, run `ls [output_root]` to confirm the directory exists. Output root is not fixed — it may be `markup/`, `src/markup/`, `packages/web/markup/`, etc.

---

## Demo page: `markup/components/` is not auto-imported by Nuxt
<!-- status: open -->

**Incident:** `demo-test.vue` used `<BubblyzComp>` without an explicit import → "Failed to resolve component: BubblyzComp" at runtime.

**Root cause:** Nuxt auto-import only scans the `components/` directory at the root (or as configured in `nuxt.config` `components` array). `markup/components/` is outside that scope → components are not automatically registered.

**Fix:** Add an explicit import in `<script setup>`:
```ts
import BubblyzComp from '~/markup/components/TestAgent/BubblyzComp.vue'
```

**Rule:** Every component in `markup/components/**` MUST be explicitly imported in the demo page — never rely on Nuxt auto-import. Applies to all pages in `markup/pages/`.

---

## `import 'swiper/css'` TS error with `verbatimModuleSyntax: true`
<!-- status: resolved-by: swiper-css.d.ts -->

**Incident:** `PrBanner.vue` — TS error 2882: "Cannot find module or type declarations for side-effect import of 'swiper/css'". Same error would affect all Swiper CSS imports project-wide.

**Root cause:** `tsconfig.json` (via `.nuxt-markup/tsconfig.json`) enables `verbatimModuleSyntax: true`. With this flag, TypeScript requires explicit type declarations for side-effect imports of non-JS/TS modules (CSS files). Swiper's package does not ship `.d.ts` files for its CSS entry points.

**Fix:** Created `/swiper-css.d.ts` at project root declaring all Swiper CSS modules:
```ts
declare module 'swiper/css'
declare module 'swiper/css/navigation'
// ... etc
```
The `.nuxt-markup/tsconfig.json` `include` path `../` picks this up automatically.

**Rule:** When adding a new `import 'swiper/css*'` variant, add the module declaration to `swiper-css.d.ts` if not already present.


## Escalated task: low-confidence
<!-- status: open -->

**Incident:** Task escalated with abort_reason='low-confidence' after 0 retry attempt(s)

**Root cause:** low-confidence

**Fix:** Requires manual review

**Rule:** Unresolved failures:
  - [visual:xs] UI verifier crashed: Task 'Perform independent visual verification by comparing the generated Vue implementation against Figma design screenshots.
INPUT DATA: Files written: ["markup/components/TestAgent/3x1BannerComp.vue", "markup/pages/test/demo-test.vue"] Figma file key: Y5MV9hy2H23CZSzaSzCu1S Figma node IDs: {"xs": "3216:349027", "sm": "3216:349024", "md": "3216:349021", "lg": "3216:349029"} Preflight screenshots: [{"type": "text", "text": "Breakpoint: xs"}, {"type": "image_url", "image_url": {"url": "type='image' data='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"}}, {"type": "text", "text": "Breakpoint: sm"}, {"type": "image_url", "image_url": {"url": "type='image' data='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"}}, {"type": "text", "text": "Breakpoint: md"}, {"type": "image_url", "image_url": {"url": "type='image' data='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"}}, {"type": "text", "text": "Breakpoint: lg"}, {"type": "image_url", "image_url": {"url": "type='image' data='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"}}] UI Library: stove-ui
YOUR MISSION: 1. Use the ui_compare tool with files_written, figma_file_key,
   figma_node_ids, screenshots, and ui_lib.
2. The tool fetches FRESH Figma screenshots (not preflight ones)
   and performs visual comparison for each non-null breakpoint.
3. Parse the tool's JSON output. 4. Return the result as your structured output.
CRITICAL: - Do NOT read .vue file contents — avoid confirmation bias. - Do NOT use preflight screenshots as visual comparison baseline. - If UICompareTool returns pass, you MUST return pass without any issues.
' execution timed out after 300 seconds. Consider increasing max_execution_time or optimizing the task.

---

