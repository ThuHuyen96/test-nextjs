# Learned Patterns

Patterns that have been successfully implemented in this project. Reuse instead of reinventing.

---

## 1. Responsive background image (`<picture>`)
<!-- status: active -->

Use when: a section has different background images per breakpoint.
`<picture>` is a valid exception — no stove-ui equivalent.

```vue
<picture class="absolute inset-0 z-base pointer-events-none">
  <source v-if="bgSrcLg" media="(min-width: 1440px)" :srcset="bgSrcLg" />
  <source v-if="bgSrcMd" media="(min-width: 1024px)" :srcset="bgSrcMd" />
  <source v-if="bgSrcSm" media="(min-width: 768px)"  :srcset="bgSrcSm" />
  <img :src="bgSrcXs || bgSrcSm || bgSrcMd || bgSrcLg || ''" alt=""
       class="w-full h-full object-cover" />
</picture>
```

Key points:
- Props pattern: `bgSrcXs`, `bgSrcSm`, `bgSrcMd`, `bgSrcLg` — all optional, default `''`

---

## 2. Blur + gradient mask overlay (card bottom)
<!-- status: active -->

Use when: Figma has a card with text overlay on an image, background blur + gradient fade.
⚠️ Requires clip-path on card outer, NOT overflow-hidden — see `backdrop-blur.md`.

```vue
<!-- Card outer — clip-path replaces overflow-hidden -->
<article class="relative rounded-3xl aspect-[290/256] game-card-clip">
  <img :src="item.imageSrc" :alt="item.name"
       class="absolute inset-0 w-full h-full object-cover z-base" />

  <!-- Blur overlay wrapper -->
  <div class="absolute bottom-0 left-0 right-0 z-docked p-20 md:p-24">
    <!-- Blur layer — blur + gradient mask combined -->
    <div class="absolute inset-0 backdrop-blur-[5rem] bg-black/50 blur-mask z-base" />
    <!-- Content above blur -->
    <div class="relative z-sticky flex items-end gap-8 w-full">
      <!-- ... content -->
    </div>
  </div>
</article>

<style scoped>
.game-card-clip {
  clip-path: inset(0 round 2rem);  /* value matches card border-radius */
}
.blur-mask {
  /*
   * ⛔ STOP — DO NOT copy values from this block.
   * Run get_design_context(nodeId, fileKey) → locate mask-image in the CSS output → paste here.
   * Required checks: (1) direction — deg vs "to top/bottom", (2) number of stops, (3) opacity per stop.
   * See: known-issues.md §Blur overlay mask + §Blur mask gradient
   */
  -webkit-mask-image: /* FETCH FROM FIGMA */;
  mask-image: /* FETCH FROM FIGMA */;
  mask-size: 100% 100%;
}
</style>
```

---

## 3. Flanking navigation (absolute, outside Swiper)
<!-- status: active -->

Use when: Figma places prev/next buttons on either side of the carousel track.
From `swiper-guide.md` — nav buttons at `±22px` outside the wrapper edge.

```vue
<div class="relative">
  <Swiper v-bind="swiperOptions">...</Swiper>

  <div class="absolute -left-[2.2rem] top-1/2 -translate-y-1/2 z-docked">
    <SArrowButton direction="prev" class="prefix-nav-prev" />
  </div>
  <div class="absolute -right-[2.2rem] top-1/2 -translate-y-1/2 z-docked">
    <SArrowButton direction="next" class="prefix-nav-next" />
  </div>
</div>
```

Key points:
- Parent section needs enough `px-*` so buttons don't overflow the viewport.

---

## 4. Game / content card with play button (stove-ui)
<!-- status: active -->

Use for media cards with a play action. `SButton` instead of a bare `<button>`.

```vue
<div class="relative z-sticky flex items-end gap-8 w-full">
  <div class="flex-1 min-w-0 flex flex-col">
    <SText as="p" role="btn2" fontWeight="bold" color="white"
           class="w-full overflow-hidden text-ellipsis">
      {{ item.name }}
    </SText>
    <SText as="p" role="text4" color="white/80"
           class="whitespace-nowrap overflow-hidden text-ellipsis w-full">
      {{ item.genre }}
    </SText>
  </div>
  <SButton variant="ghost" size="sm"
           class="flex-none flex items-center gap-4 h-32 px-12 rounded-full bg-white/20">
    <SIcon icon="ic-v2-media-av-play-round-fill" class="w-16 h-16 flex-none text-white" />
    <SText role="btn3" color="white" class="whitespace-nowrap">Play</SText>
  </SButton>
</div>
```

---

## 5. Section wrapper with title + description block
<!-- status: active -->

Common pattern: section with a title + optional description, content below.

```vue
<SBox as="section" class="relative overflow-clip rounded-[3.2rem] flex flex-col
                           pt-20 px-28 pb-28 gap-28
                           sm:p-40 sm:gap-40">
  <!-- Title block -->
  <div class="relative z-sticky flex flex-col
              sm:pl-8 sm:pr-240 sm:pt-8
              lg:pl-12 lg:pr-[44rem] lg:pt-12">
    <SText as="h2" role="title5" fontWeight="bold" color="white"
           class="overflow-hidden text-ellipsis line-clamp-2
                  sm:text-4xl sm:leading-3xl
                  lg:text-[3.6rem] lg:leading-4xl">
      {{ title }}
    </SText>
    <SText v-if="description" as="p" role="text3" color="white"
           class="hidden overflow-hidden text-ellipsis whitespace-nowrap
                  sm:block sm:text-md sm:leading-lg
                  lg:text-xl lg:leading-xl">
      {{ description }}
    </SText>
  </div>
  <!-- Content slot -->
  <slot />
</SBox>
```

---

## 6. Swiper options object (standard pattern)
<!-- status: active -->

```ts
const swiperOptions = {
  modules: [Navigation],
  slidesPerView: 1,
  spaceBetween: 12,
  breakpoints: {
    768:  { slidesPerView: 2, spaceBetween: 12 },
    1024: { slidesPerView: 3, spaceBetween: 20 },
    1440: { slidesPerView: 4, spaceBetween: 20 },
  },
  navigation: {
    prevEl: '.[prefix]-nav-prev',
    nextEl: '.[prefix]-nav-next',
    disabledClass: '[prefix]-nav-disabled',
  },
}
```

Key points:
- Options always in a `const` + `v-bind` — NEVER inline on `<Swiper>`
- `[prefix]` = component-specific (e.g. `bubblyz`, `community`) — avoids selector collision
- `disabledClass` must match CSS in `<style scoped>`

---

## 7. Swiper navigation using `id` instead of `class` (multi-instance safe)
<!-- status: active -->

Use when: a component may appear multiple times on the same page. ID-based nav prevents Swiper instances from cross-linking.

```ts
// Props receive sliderId from outside
const props = defineProps<{ sliderId?: string }>()
const sid = computed(() => props.sliderId ?? 'default-slider')

// swiperOptions as computed to react to sliderId changes
const swiperOptions = computed(() => ({
  modules: [Navigation],
  navigation: {
    prevEl: `#${sid.value}-prev`,
    nextEl: `#${sid.value}-next`,
  },
  // ... breakpoints
}))
```

```vue
<SBox class="absolute left-[-2.2rem] top-1/2 -translate-y-1/2 z-sticky hidden md:flex">
  <SArrowButton direction="prev" :id="`$[sid]-prev`" />
</SBox>
<SBox class="absolute right-[-2.2rem] top-1/2 -translate-y-1/2 z-sticky hidden md:flex">
  <SArrowButton direction="next" :id="`$[sid]-next`" />
</SBox>
```

Key points:
- Nav buttons wrapped in `hidden md:flex` — always in DOM (Swiper can query by ID even with `display:none`), visually shown at md+
- No separate hidden fallback SBox needed — the wrapper handles both DOM presence and visibility

**Rule:** When a carousel component may render multiple times → use `id` prop + `computed` swiperOptions. When guaranteed single instance → class-based is fine.

---

## 8. Character illustration: single combined `<img>` prop (preferred)
<!-- status: active -->

When Figma shows a multi-layer character group (ellipse glow + characters + sparkles), ask the designer to export as one PNG. In markup: receive via `characterSrc` prop, render as a single `<img>`.

```vue
<SBox
  class="absolute z-docked pointer-events-none
         right-[-7.2rem] top-0 w-[26rem] h-[26rem]
         sm:right-[-4rem] sm:top-[-2.4rem] sm:w-[40rem] sm:h-[40rem]
         md:right-[8rem] md:w-[40rem] md:h-[40rem]
         lg:right-[10rem] lg:w-[48rem] lg:h-[48rem]"
  aria-hidden="true"
>
  <img :src="characterSrc" alt="" class="absolute inset-0 w-full h-full object-contain pointer-events-none" />
</SBox>
```

Key points:
- `object-contain` (not `cover`) to preserve aspect ratio
- `aria-hidden="true"` on wrapper — decorative image
- `pointer-events-none` prevents blocking clicks on underlying content
- Container `overflow` not set (no clip needed — no backdrop-blur inside)

---

## 9. Demo page shell for a markup component
<!-- status: active -->

Use when: a `markup/pages/*/demo-*.vue` page is needed to preview a new component without complex layout.

```vue
<script setup lang="ts">
definePageMeta({ layout: 'default' })

const sampleItems = [
  { id: 1, name: 'Item Name', genre: 'GENRE', imageSrc: '...' },
]
</script>

<template>
  <main class="max-w-[134rem] mx-auto w-full px-20 sm:px-40 py-40">
    <MyComponent
      title="Sample Title"
      description="Sample description text"
      bgSrcXs="..."
      bgSrcSm="..."
      bgSrcMd="..."
      bgSrcLg="..."
      :items="sampleItems"
      slider-id="my-demo"
    />
  </main>
</template>
```

Key points:
- `definePageMeta({ layout: 'default' })` — required for Nuxt to use the correct layout
- Contained width: `max-w-[134rem] mx-auto w-full px-20 sm:px-40`
- `slider-id` prop (kebab-case in template) passes a unique ID to prevent nav cross-linking with multiple instances
- Sample data uses temporary Figma MCP asset URLs — replace with real data when integrating

---

## 10. Swiper xs-only pagination dots + hidden nav SBox elements
<!-- status: active -->

Use when: carousel shows pagination dots at xs only (no arrow nav), sm+ layout reflows via Swiper breakpoints.

```vue
<!-- Pagination dots — xs only -->
<SBox class="flex items-center justify-center mt-16 sm:hidden">
  <SBox :id="`$[sliderId]-pagination`" class="banner-pagination" />
</SBox>

<!-- Hidden nav elements — Swiper needs prevEl/nextEl to exist in DOM -->
<SBox :id="`$[sliderId]-prev`" class="hidden" aria-hidden="true" />
<SBox :id="`$[sliderId]-next`" class="hidden" aria-hidden="true" />
```

```ts
const swiperOptions = computed(() => ({
  modules: [Navigation, Pagination],
  slidesPerView: 1,
  spaceBetween: 12,
  breakpoints: {
    768:  { slidesPerView: 2, spaceBetween: 12 },
    1024: { slidesPerView: 2, spaceBetween: 20 },
    1440: { slidesPerView: 3, spaceBetween: 20 },
  },
  navigation: {
    prevEl: `#${props.sliderId}-prev`,
    nextEl: `#${props.sliderId}-next`,
    disabledClass: `${props.sliderId}-nav-disabled`,
  },
  pagination: {
    el: `#${props.sliderId}-pagination`,
    clickable: true,
  },
}))
```

```css
.banner-pagination :deep(.swiper-pagination-bullet) {
  width: 0.6rem;
  height: 0.6rem;
  background: #ccc;
  opacity: 1;
}
.banner-pagination :deep(.swiper-pagination-bullet-active) {
  background: #1f1f1f;
}
```

Key points:
- Pagination wrapper `sm:hidden` — dots visible at xs only; sm+ Swiper shows the correct number of slides
- Nav elements use `SBox` (not `<div>`) to comply with stove-ui rules — `class="hidden"` with `aria-hidden="true"`
- Swiper id-based nav + `computed` swiperOptions — safe for multi-instance (see Pattern 7)
- `SBox :id="…"` — use `:id` (dynamic binding) to receive the `sliderId` prop

---

## 11. `SBox as="span"` for custom-styled badge with no stove-ui equivalent
<!-- status: active -->

Use when: the design has a badge/label with custom styling (background, border-radius, padding, font) that does not map to any stove-ui component (SBadge, SChips, etc.).

```vue
<!-- Sale percent badge — custom styled, no stove-ui equivalent -->
<SBox
  v-if="game.salePercent"
  as="span"
  class="shrink-0 bg-brand-primary text-white text-sm leading-md font-bold px-4 py-px rounded-lg md:text-lg md:leading-lg md:px-5 md:py-2"
>
  {{ game.salePercent }}%
</SBox>
```

Key points:
- `SBox as="span"` = inline element with a stove-ui compliant wrapper — do not use native `<span>`
- Check `SBadge`, `SChips` first — only use this pattern when no stove-ui equivalent exists
- Color token: `bg-brand-primary` + `text-white` instead of hardcoded hex
- Typography token: `text-sm leading-md` (13px/22px) instead of arbitrary `text-[1.3rem]`

---

## 12. Responsive typography: `role` base + md breakpoint override
<!-- status: active -->

Use when: a component has different text sizes between XS/SM and MD/LG, and stove-ui `role` does not support responsive variants.

```vue
<!-- Game name: 14px (xs/sm) → 16px (md/lg) -->
<SText as="p" role="title8" fontWeight="bold" color="on-surface-elevation-1" class="text-left md:text-[1.6rem] md:leading-[2.4rem] md:tracking-[-0.048rem]">
  {{ game.name }}
</SText>

<!-- Price: 15px (xs/sm) → 18px (md/lg) -->
<SText as="p" role="text2" fontWeight="bold" color="on-surface-elevation-1" class="text-left md:text-[1.8rem] md:leading-[2.6rem] md:tracking-[-0.054rem]">
  {{ game.price }}
</SText>
```

Key points:
- Use the smallest `role` (xs/sm size) as base — override at md+ with arbitrary `text-[…]rem` + `leading-[…]rem`
- `tracking-[…]rem` also needs an override if letter-spacing changes
- SBox badge has no `role` → use Tailwind classes directly for both base and override
- rem values: px ÷ 10 = rem (stove-ui: 1rem = 10px)

---

## 13. Banner image with aspect-ratio container + absolute img fill
<!-- status: active -->

Use when: a banner image needs to maintain a dynamic aspect ratio relative to container width instead of a fixed height.

```vue
<!-- Container: relative + aspect-ratio + overflow-clip -->
<SBox class="relative w-full overflow-clip rounded-[2rem] shrink-0 aspect-[2/1] z-base">
  <!-- img: absolute inset-0 fills the container -->
  <img :src="bannerSrc" :alt="alt" class="absolute inset-0 w-full h-full object-cover pointer-events-none z-base" />
</SBox>
```

Key points:
- `aspect-[2/1]` = width:height = 2:1 (Figma component name "Banner image 2:1")
- Container needs `relative` + `overflow-clip` so the img doesn't overflow
- Img uses `absolute inset-0 w-full h-full object-cover` to fill the container at the correct ratio
- `z-base` on `img` because it is an absolute element — required by rule
- Do NOT use a fixed `h-[120px]` from Figma codegen — that is a static value at design time, not responsive
- Thumbnail 1:1 uses the same pattern: `relative w-60 h-60 overflow-clip rounded-[1.2rem]` + absolute img fill

---

## 14. Fixed-width PR banner carousel with `slidesPerView: 'auto'`
<!-- status: active -->

Use when: a banner/promotional carousel has fixed-width cards (same width at md and lg) and a banner control pill (current/total indicator) that moves with the active slide.

```vue
<!-- PrBanner.vue — swiperOptions -->
const swiperOptions = computed(() => ({
  modules: [Navigation],
  slidesPerView: 'auto' as const,
  spaceBetween: 12,
  centeredSlides: true,
  breakpoints: {
    1024: { spaceBetween: 20 },
  },
  navigation: {
    prevEl: `#${sid.value}-prev`,
    nextEl: `#${sid.value}-next`,
    disabledClass: `${sid.value}-nav-disabled`,
  },
  on: {
    slideChange: (swiper: { activeIndex: number }) => {
      activeIndex.value = swiper.activeIndex
    },
  },
}))

<!-- SwiperSlide: fixed width per breakpoint -->
<SwiperSlide class="!bg-transparent !w-320 sm:!w-720">
  <PrBannerCard :item="item" :is-active="activeIndex === index" ... />
</SwiperSlide>
```

```vue
<!-- PrBannerCard.vue — banner control pill (absolute, clip-path for backdrop-blur) -->
<SBox
  v-if="props.isActive"
  class="absolute bottom-24 left-24 sm:bottom-auto sm:top-[17rem] sm:left-[62.5rem] z-sticky inline-flex items-center gap-6 backdrop-blur-[1rem] bg-black/70 px-16 py-8 pr-banner-pill-clip"
>
  <SBox class="flex items-center gap-2">
    <SText as="span" role="cap1" fontWeight="bold" color="white" class="text-left">{{ activeIndex + 1 }}</SText>
    <SText as="span" role="cap1" color="white" class="text-left">/</SText>
    <SText as="span" role="cap1" color="white" class="text-left">{{ totalCount }}</SText>
  </SBox>
  <SIcon icon="ic-v2-media-av-play-fill" class="w-16 h-16 text-white" aria-hidden="true" />
</SBox>

<!-- <style scoped> -->
.pr-banner-pill-clip { clip-path: inset(0 round 999px); }
```

Key points:
- `slidesPerView: 'auto'` + fixed `!w-*` on `<SwiperSlide>` — correct when card width is the same at md and lg
- `centeredSlides: true` — active card centred, adjacent cards peek on both sides
- `activeIndex` tracked via Swiper `on.slideChange` callback → passed as prop to card for conditional pill render
- Banner control pill uses `clip-path: inset(0 round 999px)` NOT `rounded-full` — avoids backdrop-blur halo (see known-issues.md)
- Arrow nav `hidden md:flex` + ID-based — always in DOM for Swiper query, visible only at md+
- Card outer uses `clip-path: inset(0 round 3.2rem)` — no `overflow-clip` (backdrop-blur.md)

---

## 15. Component filename starting with a number → aliased import
<!-- status: active -->

Use when: a component filename starts with a digit (e.g. `3x1Banner.vue`) and needs to be imported into a page or another component.

```ts
// ❌ Wrong — Vue identifier cannot start with a number
import 3x1Banner from './3x1Banner.vue'

// ✅ Correct — alias to a valid PascalCase identifier
import ThreeByOneBanner from '../../components/TestAgent/3x1Banner.vue'
```

```vue
<template>
  <ThreeByOneBanner :banners="banners" />
</template>
```

Key points:
- Vue/JS identifiers cannot start with a digit → import alias is mandatory
- Alias uses full PascalCase (e.g. `3x1` → `ThreeByOne`)
- Nuxt does not auto-import components whose filename starts with a digit → explicit import required in `<script setup>`

---

## 16. Banner card: flex throughout + absolute image (with responsive clip-path)
<!-- status: active -->

Use when: a card has text top-aligned at xs (no vertical centering needed) and text vertically centered at sm+, with an image that overflows the card top at sm+.

The card **stays flex at all breakpoints** — never switch to `sm:block`. The image is `absolute` at all breakpoints (xs: bottom-right inside card; sm+: top-right overflowing card).

```vue
<template>
  <!-- xs: items-start (text near top, no vertical centering needed) -->
  <!-- sm+: items-center (flex centers text vertically in fixed h-220) -->
  <article
    class="relative flex items-start sm:items-center h-280 w-full rounded-[3.2rem] sm:h-220 pr-banner-card"
    :style="{ background: item.bgColor }"
  >
    <!-- Text: flex child at ALL breakpoints — no absolute, no translate-y needed -->
    <!-- sm:p-0 sm:pl-48 explicitly replaces xs p-24 — never leave sm:p-0 as the final state -->
    <SBox class="flex flex-col gap-8 p-24 w-full sm:p-0 sm:pl-48 sm:max-w-[44.1rem]">
      <SText as="h3" role="title5" fontWeight="bold" color="white" class="text-left sm:text-4xl sm:leading-3xl sm:tracking-[-0.072rem]">...</SText>
      <SText as="p" role="text4" color="white" class="text-left sm:text-md sm:leading-lg sm:tracking-[-0.042rem]">...</SText>
    </SBox>

    <!-- Image: absolute at xs (bottom-right, clipped inside card) and sm+ (overflows top) -->
    <SBox class="absolute right-16 bottom-0 z-docked sm:right-auto sm:bottom-auto sm:left-[48rem] sm:-top-20">
      <SBox class="relative overflow-hidden w-156 h-156 rounded-[3.2rem] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.15)] sm:w-200 sm:h-200 sm:shadow-[0px_40px_40px_0px_rgba(0,0,0,0.25)]">
        <img :src="item.imageSrc" :alt="item.title" class="absolute inset-0 w-full h-full object-cover pointer-events-none z-base" />
      </SBox>
    </SBox>

    <!-- Pill: absolute in both layouts, position shifts at sm+ -->
    <SBox v-if="isActive" class="absolute bottom-24 left-24 z-sticky ... sm:bottom-auto sm:top-[17rem] sm:left-[62.5rem] pr-banner-pill-clip">
      ...
    </SBox>
  </article>
</template>

<style scoped>
/* xs: clip to card bounds — keeps image inside + fixes backdrop-blur halo on pill */
.pr-banner-card {
  clip-path: inset(0 round 3.2rem);
}
/* sm+: remove clip so image can overflow the card top */
@media (min-width: 768px) {
  .pr-banner-card {
    clip-path: none;
  }
}
</style>
```

Key points:
- Card stays `flex` throughout — `items-start` at xs (text anchored top), `sm:items-center` at sm+ (flex vertically centers text in fixed height)
- **Never use `absolute + top-1/2 + -translate-y-1/2` for text** when parent flex can center natively
- **Never use `sm:block`** just to enable absolute children — absolute children work inside flex parents
- Text section: `sm:p-0 sm:pl-48` — the `sm:p-0` resets xs padding, `sm:pl-48` replaces it. `sm:p-0` alone is always wrong.
- Image stays `absolute` at both xs and sm+ — only position values change. No flex-overflow tricks needed.
- xs clip-path via scoped `@media` → keeps image within card bounds, prevents backdrop-blur halo
- sm+ clip removed → image can deliberately overflow card top (`sm:-top-20`)
- Pill stays `absolute` in both layouts; only position values change with `sm:` overrides

---

## 17. Split ambient blur: xs vs sm+ as separate elements
<!-- status: active -->

Use when: a section's ambient blur background needs completely different sizing and positioning between xs and sm+ (the values are too different for responsive overrides on one element).

```vue
<!-- xs: small blur, extends slightly beyond section edges -->
<SBox
  class="absolute aspect-square -left-[26rem] -right-[28.6rem] -top-[16rem] blur-[56.6px] pointer-events-none z-base sm:hidden"
  aria-hidden="true"
>
  <img v-if="activeSrc" :src="activeSrc" alt="" class="absolute inset-0 w-full h-full object-cover z-base" />
</SBox>

<!-- sm+: massive blur (2560×2560px), positioned far outside section bounds -->
<SBox
  class="absolute hidden sm:block w-[256rem] h-[256rem] -top-[103rem] -left-[18.3rem] blur-[150px] pointer-events-none z-base"
  aria-hidden="true"
>
  <img v-if="activeSrc" :src="activeSrc" alt="" class="absolute inset-0 w-full h-full object-cover z-base" />
</SBox>
```

Key points:
- Use `sm:hidden` / `hidden sm:block` to show exactly one at a time
- Both elements are `absolute` → both need `z-base`
- The img inside each is also `absolute inset-0` → also needs `z-base`
- Section must have `overflow-hidden` to clip the massive sm+ element
- `activeSrc` is reactive (computed from active slide) → background color and blur update on slide change

---

## 18. Responsive product grid (2-col xs → 3-col sm+)
<!-- status: active -->

Use when: a shop/product listing has a grid of cards with image, name, sub-info, price, and a CTA button. Adapts 2-col at xs to 3-col at sm+.

```vue
<!-- Grid container -->
<SBox class="grid grid-cols-2 gap-x-12 gap-y-24 sm:grid-cols-3 sm:gap-x-16 sm:gap-y-32">
  <SBox v-for="item in items" :key="item.id" as="article" class="flex flex-col gap-12">
    <!-- Square image with optional colored bg -->
    <SBox class="relative w-full">
      <SBox class="relative w-full overflow-hidden rounded-[2rem] aspect-square" :style="item.imageBg ? { background: item.imageBg } : {}">
        <img :src="item.imageSrc" :alt="item.name" class="absolute inset-0 w-full h-full object-cover pointer-events-none z-base" />
      </SBox>
      <!-- Optional badge overlay -->
      <SBox v-if="item.badge" as="span" class="absolute top-8 left-8 z-docked inline-flex items-center px-8 py-4 rounded-[0.6rem] bg-on-surface-elevation-1">
        <SText role="cap1" color="white" class="text-left whitespace-nowrap">{{ item.badge }}</SText>
      </SBox>
    </SBox>
    <!-- Content -->
    <SBox class="flex flex-col gap-8">
      <SText as="h3" role="title8" fontWeight="bold" color="on-surface-elevation-1" class="text-left line-clamp-2">{{ item.name }}</SText>
      <SText v-if="item.subInfo" role="cap1" color="on-surface-elevation-3" class="text-left">{{ item.subInfo }}</SText>
      <!-- Price row -->
      <SBox class="flex items-center gap-4">
        <SIcon icon="ic-v2-stove-flake-color" class="w-16 h-16 flex-none" aria-hidden="true" />
        <SText as="p" role="title8" fontWeight="bold" color="brand-primary" class="text-left">{{ formatPrice(item.price) }}</SText>
      </SBox>
      <!-- Full-width CTA button -->
      <SButton :disabled="item.isExchanged" variant="outline" class="w-full !rounded-[0.8rem]">
        <SText role="btn2" :color="item.isExchanged ? 'on-surface-elevation-4' : 'brand-primary'" class="text-center">
          {{ item.isExchanged ? '교환완료' : '교환하기' }}
        </SText>
      </SButton>
    </SBox>
  </SBox>
</SBox>
```

Key points:
- `grid-cols-2` at xs, `sm:grid-cols-3` at sm+ — standard shop grid
- Image area uses `aspect-square` (not a fixed height) — responsive and avoids Figma static values
- `overflow-hidden` on image container is safe here because no `backdrop-blur` inside
- Badge overlay uses `absolute z-docked` on a wrapper with `relative` parent
- `SButton variant="outline" class="w-full !rounded-[0.8rem]"` — full-width CTA, `!` required to override SButton's default border-radius
- Price row: `SIcon ic-v2-stove-flake-color` + `SText color="brand-primary"` for Flake currency display
- `formatPrice`: `price.toLocaleString('ko-KR')` for Korean number formatting

---

## 19. Centered nav buttons via `max-w` + `mx-auto` overlay
<!-- status: active -->

Use when: carousel nav buttons must be centered at a specific horizontal span (e.g. 748px) relative to the viewport center, not relative to the Swiper wrapper edge.

```vue
<!-- Wrapper: covers full section, passes clicks through -->
<SBox class="absolute inset-0 pointer-events-none z-sticky hidden md:flex items-center" aria-hidden="true">
  <!-- Inner: fixed max-width centered = nav span matches Figma's nav-button spread -->
  <SBox class="w-full max-w-[74.8rem] mx-auto flex items-center justify-between">
    <SBox class="pointer-events-auto flex-none">
      <SArrowButton :id="`$[sid]-prev`" direction="prev" />
    </SBox>
    <SBox class="pointer-events-auto flex-none">
      <SArrowButton :id="`$[sid]-next`" direction="next" />
    </SBox>
  </SBox>
</SBox>
```

Key points:
- Outer SBox: `absolute inset-0 pointer-events-none z-sticky` — covers section, allows click-through to carousel
- Inner SBox: `max-w-[74.8rem] mx-auto flex justify-between` — centers nav at exact Figma span (748px)
- Wrap each SArrowButton in `pointer-events-auto flex-none` to restore click handling
- Appropriate when `centeredSlides: true` and the active slide center aligns with viewport center
- `hidden md:flex` on wrapper: nav always in DOM (Swiper finds by ID), visible only at md+

---

## 20. Empty-state step guide card (multi-column, horizontal)
<!-- status: active -->

Use when: a section shows a horizontal row of N steps (onboarding / process guide) with a step label, title, description, and an illustration icon at the bottom-right of each cell — inside a single bordered card.

```vue
<SBox class="border border-border rounded-[1.2rem] flex items-center overflow-hidden w-full max-w-[90rem]">
  <SBox
    v-for="(item, index) in steps"
    :key="item.step"
    class="relative flex flex-col gap-[1.4rem] items-start flex-1 h-[26rem] pt-32 pb-24 px-24"
  >
    <!-- Vertical divider between cells -->
    <SBox
      v-if="index > 0"
      class="absolute left-0 top-0 bottom-0 w-px bg-border z-base"
    />
    <!-- Step label (STEP 01 …) -->
    <SText as="p" role="cap2" fontWeight="bold" class="text-left text-blue600 whitespace-nowrap">
      {{ item.step }}
    </SText>
    <!-- Title + description -->
    <SBox class="flex flex-col gap-10 items-start w-full">
      <SText as="h3" role="title6" fontWeight="bold" color="on-surface-elevation-1" class="text-left w-full">
        {{ item.title }}
      </SText>
      <SText v-for="(line, i) in item.description" :key="i" as="p" role="text3" color="on-surface-elevation-1" class="text-left leading-[1.6] w-full">
        {{ line }}
      </SText>
    </SBox>
    <!-- Illustration: absolute bottom-right -->
    <SBox class="absolute bottom-24 right-24 w-48 h-48 z-docked">
      <img :src="item.illustSrc" alt="" aria-hidden="true" class="absolute inset-0 w-full h-full object-contain pointer-events-none z-base" />
    </SBox>
  </SBox>
</SBox>
```

Key points:
- Outer card uses `border border-border rounded-[1.2rem] overflow-hidden` — never `rounded-xl` (stove-ui token mismatch)
- Each cell uses `flex-1` for equal-width columns; `h-[26rem]` matches Figma 260px fixed cell height
- Vertical dividers: `absolute left-0 top-0 bottom-0 w-px bg-border z-base` on all cells except the first (`v-if="index > 0"`)
- Illustration is `absolute` in the cell with `z-docked`; `<img>` is a valid exception (decorative illustration, not a UI icon)
- Step label color: `text-blue600` (Figma `#2b7fff` = blue600 in stove-ui palette)
- All multi-attribute elements use one-attribute-per-line format (ESLint: `vue/max-attributes-per-line`)

---

## 21. Game section with carousel + character illustration overflow
<!-- status: active -->

Use when: a section has a purple/colored background, a decorative character illustration that partially overflows the right edge, a title + optional description, and a Swiper carousel of game cards with blur overlay.

```vue
<!-- Section outer: rounded-[3.2rem] ONLY — no overflow-clip (character overflows boundary) -->
<SBox as="section" class="relative rounded-[3.2rem] flex flex-col gap-28 pt-20 px-28 pb-28 sm:gap-40 sm:p-40">
  <!-- Background per-breakpoint via <picture> -->
  <picture class="absolute inset-0 z-base pointer-events-none">
    <source v-if="bgSrcLg" media="(min-width: 1440px)" :srcset="bgSrcLg" />
    <source v-if="bgSrcMd" media="(min-width: 1024px)" :srcset="bgSrcMd" />
    <source v-if="bgSrcSm" media="(min-width: 768px)" :srcset="bgSrcSm" />
    <img :src="bgSrcXs || ''" alt="" class="w-full h-full object-cover" />
  </picture>

  <!-- Character: overflows right edge — z-docked, sizes change per breakpoint -->
  <SBox
    v-if="characterSrc"
    class="absolute z-docked pointer-events-none right-[-7.2rem] top-0 w-260 h-260 sm:right-[-4rem] sm:-top-24 sm:w-[40rem] sm:h-[40rem] md:right-80 lg:right-100 lg:w-[48rem] lg:h-[48rem]"
    aria-hidden="true"
  >
    <img :src="characterSrc" alt="" class="absolute inset-0 w-full h-full object-contain pointer-events-none z-base" />
  </SBox>

  <!-- Title block: right padding reserves space for character -->
  <SBox class="relative z-sticky flex flex-col sm:pl-8 sm:pr-240 sm:pt-8 md:pl-12 md:pr-360 md:pt-12 lg:pr-[44rem]">
    <SText as="h2" role="title5" fontWeight="bold" color="white"
           class="text-left whitespace-nowrap overflow-hidden text-ellipsis sm:text-3xl sm:leading-2xl md:text-[2.8rem] md:leading-3xl lg:text-5xl lg:leading-4xl">
      {{ title }}
    </SText>
    <!-- Description: hidden xs, shown sm+ -->
    <SText as="p" role="text3" color="white"
           class="hidden sm:block text-left overflow-hidden text-ellipsis whitespace-nowrap lg:text-xl lg:leading-xl">
      {{ description }}
    </SText>
  </SBox>

  <!-- Carousel with flanking nav (id-based, computed swiperOptions) -->
  <SBox class="relative z-sticky">
    <Swiper v-bind="swiperOptions">
      <SwiperSlide v-for="item in items" :key="item.id" class="!bg-transparent">
        <!-- Game card: clip-path for backdrop-blur Safari fix -->
        <SBox as="article" class="relative w-full aspect-[290/256] bubblyz-card-clip">
          <img :src="item.imageSrc" :alt="item.gameName" class="absolute inset-0 w-full h-full object-cover z-base" />
          <SBox class="absolute bottom-0 left-0 right-0 z-docked p-20 md:p-24">
            <SBox class="absolute inset-0 backdrop-blur-[5rem] bg-black/50 bubblyz-blur-mask z-base" />
            <SBox class="relative z-sticky flex items-end gap-8 w-full">
              <SBox class="flex-1 min-w-0 flex flex-col">
                <SText as="p" role="title8" fontWeight="bold" color="white"
                       class="text-left w-full overflow-hidden text-ellipsis whitespace-nowrap md:text-xl md:leading-lg">
                  {{ item.gameName }}
                </SText>
                <SText as="p" role="text4" color="white/80"
                       class="text-left w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {{ item.genre }}
                </SText>
              </SBox>
              <SButton variant="ghost" class="flex-none flex items-center gap-4 h-32 px-12 !rounded-full !min-h-0 !bg-white/20">
                <SIcon icon="ic-v2-media-av-play-round-fill" class="w-16 h-16 flex-none text-white" />
                <SText role="btn3" color="white" class="text-left whitespace-nowrap">Play</SText>
              </SButton>
            </SBox>
          </SBox>
        </SBox>
      </SwiperSlide>
    </Swiper>
    <!-- Nav: always in DOM (hidden md:flex), id-based -->
    <SBox :id="`$[sid]-prev`" class="absolute -left-[2.2rem] top-1/2 -translate-y-1/2 z-sticky hidden md:flex">
      <SArrowButton direction="prev" />
    </SBox>
    <SBox :id="`$[sid]-next`" class="absolute -right-[2.2rem] top-1/2 -translate-y-1/2 z-sticky hidden md:flex">
      <SArrowButton direction="next" />
    </SBox>
  </SBox>
</SBox>
```

Key points:
- Section outer uses `rounded-[3.2rem]` ONLY — NO `overflow-clip` (character illustration overflows right edge; overflow-clip would clip it)
- Character sizes per breakpoint: xs `w-260 h-260`, sm `w-[40rem] h-[40rem]`, lg `w-[48rem] h-[48rem]`
- Title right-padding reserves space for character: `sm:pr-240`, `md:pr-360`, `lg:pr-[44rem]`
- Card outer uses `.bubblyz-card-clip { clip-path: inset(0 round 2rem); }` — replaces overflow-hidden for backdrop-blur Safari fix
- `disabledClass` is a fixed string (`bubblyz-nav-disabled`) — must match the CSS class name in `<style scoped>`
- SButton bg override requires `!bg-white/20` (SButton sets bg internally)

---

## 22. 3×N banner grid: responsive CSS Grid (xs 1-col → sm 2-col → md/lg 3-col)
<!-- status: active — corrected from scroll+hide approach -->

Use when: a section shows 3 banner cards. All cards are **always rendered** at every breakpoint — layout reflows via grid columns, never hides items.

```vue
<!-- grid-cols-1 xs → grid-cols-2 sm → grid-cols-3 md/lg — all 3 cards always visible -->
<SBox class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-20">
  <SBox
    v-for="item in items"
    :key="item.id"
    as="article"
    class="flex flex-col gap-16 pt-16 px-16 pb-20 md:pb-24 bg-surface-elevation-1 rounded-[3.2rem]"
  >
    <!-- Banner image 2:1 -->
    <SBox class="relative w-full overflow-clip rounded-[2rem] shrink-0 aspect-[2/1] z-base">
      <img :src="item.bannerSrc" :alt="item.publisherName"
           class="absolute inset-0 w-full h-full object-cover pointer-events-none z-base" />
    </SBox>

    <!-- Publisher info + games list -->
    <SBox class="flex flex-col gap-8 w-full">
      <SBox class="flex flex-col px-12 md:px-16 w-full">
        <SText as="h3" role="title5" fontWeight="bold" color="on-surface-elevation-1"
               class="text-left w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {{ item.publisherName }}
        </SText>
        <SText role="text3" color="on-surface-elevation-3"
               class="text-left w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {{ item.publisherDesc }}
        </SText>
      </SBox>

      <SBox class="flex flex-col px-4 md:px-8 w-full">
        <SBox
          v-for="game in item.games"
          :key="game.id"
          class="flex flex-row gap-16 items-center p-8 rounded-[2rem] w-full"
        >
          <SBox class="relative w-60 h-60 md:w-64 md:h-64 overflow-clip rounded-[1.2rem] shrink-0 z-base">
            <img :src="game.thumbnailSrc" :alt="game.name"
                 class="absolute inset-0 w-full h-full object-cover pointer-events-none z-base" />
          </SBox>
          <SBox class="flex flex-col gap-2 md:gap-4 min-w-0 flex-1">
            <SText as="p" role="title8" fontWeight="bold" color="on-surface-elevation-1"
                   class="text-left w-full overflow-hidden text-ellipsis whitespace-nowrap md:text-[1.6rem] md:leading-[2.4rem] md:tracking-[-0.048rem]">
              {{ game.name }}
            </SText>
            <SBox class="flex flex-row items-center gap-4 w-full">
              <SBox v-if="game.salePercent" as="span"
                    class="shrink-0 inline-flex items-center bg-brand-primary rounded-[0.6rem] px-4 py-px md:rounded-[0.8rem] md:px-[0.5rem] md:py-[0.2rem]">
                <SText role="text4" fontWeight="bold" color="white"
                       class="text-left whitespace-nowrap md:text-lg md:leading-lg md:tracking-[-0.045rem]">
                  {{ game.salePercent }}%
                </SText>
              </SBox>
              <SText as="p" role="text2" fontWeight="bold"
                     :color="game.salePercent ? 'brand-primary' : 'on-surface-elevation-1'"
                     class="text-left whitespace-nowrap md:text-[1.8rem] md:leading-[2.6rem] md:tracking-[-0.054rem]">
                ₩{{ formatPrice(game.price) }}
              </SText>
            </SBox>
          </SBox>
        </SBox>
      </SBox>
    </SBox>
  </SBox>
</SBox>
```

Key points:
- **`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3`** — single source of truth for layout; no overflow-x-auto, no flex tricks
- All 3 cards always rendered — xs stacks 3 rows, sm shows 2+1, md/lg shows 3 in a row
- No `:class="{ 'hidden md:flex': ... }"` — never hide grid items (see known-issues.md §Hiding grid items)
- No `overflow-x-auto` unless the design explicitly calls for horizontal scroll (check Figma)
- Gap: `gap-12 md:gap-20`; card padding: `pb-20 md:pb-24`
- Banner text horizontal padding: `px-12 md:px-16`; games list: `px-4 md:px-8`
- Thumbnail size: `w-60 h-60 md:w-64 md:h-64`
- Game name: `role="title8"` base (14px) + `md:text-xl md:leading-lg md:tracking-title7` override
- Price: `role="text2"` base (15px) + `md:text-2xl md:leading-xl md:tracking-title6` override
- Sale badge rounded: `rounded-[0.6rem]` (6px off-scale) + `md:rounded-lg` (0.8rem = lg token)
- Sale badge padding md+: `md:px-[0.5rem]` (5px off-scale → bracket required)
- Banner image container: `rounded-3xl` (2.0rem = 3xl token)
- Game row: `rounded-3xl` (2.0rem = 3xl token)
- Thumbnail: `rounded-xl` (1.2rem = xl token)
- Card outer: `rounded-[3.2rem]` (32px — off-scale, bracket required)

## 23. Retry fix: code correction

<!-- status: active -->

Use when: similar sign-off violations or visual mismatches occur (e.g. `style="color: ..."` on SText, absolute elements missing z-token).

```vue
<!-- Corrected in: markup/components/TestAgent/3x1BannerComp.vue -->
<!-- After 1 retry attempt(s) -->
```

Key points:
- (original key points truncated — contained expired Figma asset URLs)
- UI verifier timed out (300s) — not a component defect; retry with longer timeout or skip visual verification for complex full-page designs

---

## 24. Full-page dashboard layout: sticky GNB header + LNB sidebar + main content
<!-- status: active -->

Use when: a full-page Creator Hub / admin dashboard design has a top sticky nav bar (GNB), a fixed-width left sidebar (LNB), and a scrollable main content area.

Key points:
- Root `<SBox>` carries both `light` (mode) and layout classes — never place mode class on a non-root element
- GNB: `sticky top-0 z-sticky` + `backdrop-blur-[1rem]` — requires native `<header>` (not `SBox as="header"`)
- LNB: `sticky top-64 self-start` — `top-64` = GNB height (6.4rem); without `self-start` the sidebar stretches full height and `sticky` has no effect
- Body row uses `flex flex-1 min-h-0` — `min-h-0` prevents the row from overflowing below the viewport in flex-col parents
- Sidebar nav: native `<nav>` + `<ul>/<li>/<a>` — NEVER `SBox as="nav|ul|li"`
- Active nav item: `bg-inverse-elevation-3` (token) not raw hex — `on-inverse-elevation-1` for active text color
- Guide cards: `overflow-hidden` on the card is correct (no backdrop-blur inside); gradient via `:style="{ background: ... }"` not `background-image:`
- Absolute elements in cards: illustration wrapper gets `z-base`, CTA button/content gets `z-docked`
- Story cards: same pattern — thumbnail `div` gets `z-base`, content `div` gets `z-docked`
- `SText color=` prop (never `style="color: ..."`); `style=` is allowed only for dynamic gradient backgrounds
- Single-breakpoint (lg-only) design — no `sm:` / `md:` overrides needed when Figma only provides lg

```vue
<!-- Root: light mode, flex-col, min-h-screen -->
<SBox class="light flex flex-col min-h-screen bg-background-variant-1">

  <!-- GNB: sticky top bar, dark glass effect -->
  <header class="sticky top-0 z-sticky w-full backdrop-blur-[1rem] bg-[rgba(25,25,25,0.94)] border-b border-solid border-inverse-elevation-3">
    <div class="flex items-center justify-between px-40 h-64">
      <nav aria-label="Primary navigation" class="flex items-center gap-32">
        <img src="..." alt="Logo" class="h-32 w-auto" />
        <ul class="flex items-center gap-24 list-none m-0 p-0">
          <li v-for="link in navLinks" :key="link.label">
            <a :href="link.href"><SText role="btn2" color="white">{{ link.label }}</SText></a>
          </li>
        </ul>
      </nav>
      <div class="flex items-center gap-16"> <!-- right actions --> </div>
    </div>
  </header>

  <!-- Body row: sidebar + main -->
  <div class="flex flex-1 min-h-0 px-40 gap-40">

    <!-- LNB sidebar: sticky below GNB, fixed width -->
    <aside class="w-[23rem] shrink-0 flex flex-col gap-12 pt-24 pb-16 sticky top-64 self-start">
      <nav aria-label="Dashboard navigation">
        <ul class="flex flex-col gap-2 list-none m-0 p-0">
          <li v-for="item in sideNav" :key="item.label">
            <a :href="item.href"
               :class="['flex items-center gap-12 px-16 py-12 rounded-xl', item.active ? 'bg-inverse-elevation-3' : '']">
              <SText role="btn2" :color="item.active ? 'on-inverse-elevation-1' : 'on-surface-elevation-3'">{{ item.label }}</SText>
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex flex-1 flex-col gap-40 pt-24 pb-16 min-w-0">
      <!-- Guide cards section -->
      <section>
        <div class="flex gap-20">
          <article v-for="card in guideCards" :key="card.title"
                   class="relative flex flex-1 flex-col justify-between h-[28rem] rounded-xl border border-solid border-inverse-elevation-3 overflow-hidden"
                   :style="{ background: card.gradient }">
            <div class="relative flex flex-col gap-8 p-24 z-docked">
              <SText as="h3" role="title6" fontWeight="bold" color="white" class="text-left">{{ card.title }}</SText>
            </div>
            <div class="absolute bottom-0 right-0 w-[16rem] h-[16rem] z-base pointer-events-none">
              <img :src="card.illustSrc" alt="" class="absolute inset-0 w-full h-full object-contain z-base" />
            </div>
          </article>
        </div>
      </section>

      <!-- Story cards section -->
      <section>
        <div class="flex gap-20">
          <article v-for="story in stories" :key="story.title"
                   class="relative flex flex-1 h-[24rem] rounded-xl overflow-hidden">
            <div class="absolute inset-0 z-base">
              <img :src="story.thumbSrc" :alt="story.title" class="absolute inset-0 w-full h-full object-cover z-base" />
            </div>
            <div class="absolute bottom-0 left-0 right-0 z-docked p-20">
              <SText as="h3" role="title7" fontWeight="bold" color="white" class="text-left">{{ story.title }}</SText>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</SBox>
```

---
