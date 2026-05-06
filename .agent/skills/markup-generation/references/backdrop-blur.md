# Backdrop-blur + Rounded Corners — Full Rules

> Read this file when implementing `backdrop-blur` with `rounded-*`.

---

## Problem

`backdrop-filter` + `rounded-*` causes **halos / fringe** in WebKit (Safari, iOS). `overflow-clip`/`overflow-hidden` cannot clip a `backdrop-filter` compositing layer.

---

## Rule: clip-path on CARD OUTER

Place `clip-path: inset(0 round <radius>)` on the **outermost element** that defines the rounded boundary.
Remove `overflow-clip`/`overflow-hidden` from that same element — `clip-path` replaces it.

```html
<!-- ✅ Correct -->
<!-- <style scoped> .card-clip { clip-path: inset(0 round 2rem); } </style> -->
<article class="card-clip relative rounded-3xl aspect-[290/256] w-full">
  <img class="absolute inset-0 w-full h-full object-cover z-base" alt="..." />
  <div class="absolute bottom-0 left-0 right-0 p-20 z-docked">
    <!-- NO clip-path on this intermediate div -->
    <div class="backdrop-blur-md bg-black/50 blur-mask-fade" />
    <div class="relative z-sticky">content</div>
  </div>
</article>

<!-- ❌ Wrong 1: blur + rounded on the same element -->
<div class="backdrop-blur-md rounded-3xl bg-white/10 p-20">...</div>

<!-- ❌ Wrong 2: overflow-clip on parent -->
<div class="rounded-3xl overflow-clip">
  <div class="absolute inset-0 overflow-clip">
    <!-- overflow cannot clip backdrop-filter in WebKit -->
    <div class="backdrop-blur-md bg-black/50" />
  </div>
</div>

<!-- ❌ Wrong 3: clip-path on INTERMEDIATE wrapper -->
<!-- Any clip-path between card outer and blur creates a stacking context → mask-image BREAKS -->
<article class="rounded-3xl overflow-clip">
  <div class="absolute bottom-0 ...">
    <div class="[clip-path:inset(0_round_2rem)]">  <!-- ← stacking context, breaks mask-image -->
      <div class="backdrop-blur-md blur-mask" />
    </div>
  </div>
</article>
```

**Three rules, in order:**
1. `clip-path: inset(0 round <radius>)` on the **card outer** — clips the entire card including blur.
2. **Remove `overflow-clip`/`overflow-hidden`** from that element — `clip-path` replaces it.
3. **No intermediate `clip-path` wrapper** between card outer and blur — breaks `mask-image`.

---

## ⚠️ Conflict: `clip-path` vs overflow children

`clip-path` creates a hard clip boundary — **no child can render outside it**. If the design requires a child element (decorative image, badge, label) to overflow the card boundary at any breakpoint, `clip-path` cannot be active at that breakpoint.

**Resolution — split by breakpoint:**

```css
/* xs: clip-path active — no overflow needed, backdrop-blur pill requires it */
.card-clip { clip-path: inset(0 round 3.2rem); }

/* sm+: overflow child needed — remove clip-path, rely on border-radius alone */
@media (min-width: 768px) {
  .card-clip { clip-path: none; }
}
```

At breakpoints where `clip-path: none`, the card must have `border-radius` (Tailwind `rounded-[Xrem]`) but **no `overflow-hidden`** — this preserves rounded corners while allowing child overflow.

**Decision checklist before applying `clip-path` on a card:**
```
[ ] Does any child need to overflow this card at any breakpoint?
    YES → remove clip-path at those breakpoints (clip-path: none in media query)
         keep clip-path only at breakpoints where overflow is not needed
    NO  → clip-path at all breakpoints is safe
```

**`border-radius` vs `clip-path` reference:**

| Approach | Clips children? | Fixes backdrop-blur halo? |
|----------|-----------------|---------------------------|
| `border-radius` alone | ❌ No | ❌ No |
| `border-radius` + `overflow-hidden` | ✅ Yes | ❌ No (WebKit bug) |
| `clip-path: inset(0 round X)` | ✅ Yes | ✅ Yes |
| `clip-path: none` + `border-radius` | ❌ No (overflow free) | N/A |

---

## Mask + backdrop-blur

When Figma has both `mask-image` and `backdrop-filter`, implement **both**. Dropping mask = defect.

```html
<!-- In template -->
<div class="backdrop-blur-md bg-black/50 blur-mask" />

<!-- In <style scoped> — values below are PLACEHOLDERS, copy exact from Figma -->
<style scoped>
.blur-mask {
  /* ⚠️ DO NOT use these values — copy exact direction, stops, opacity from Figma */
  -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.80) 42%, #000 83%);
  mask-image: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.80) 42%, #000 83%);
  mask-size: 100% 100%;
}
</style>
```

**Rules:**
- **Gradient values = copy exact from Figma** — direction (`180deg` ≠ `to top`), number of stops, opacity per stop.
- **Do NOT copy from `learned-patterns.md` or any example code** — always take from Figma inspect panel.
- Always set `mask-size: 100% 100%` (or `contain`/`cover`) — never fixed px/rem.
- Prefer CSS `linear-gradient` masks over SVG `url()` when a fade is sufficient.
- Both `-webkit-mask-image` and `mask-image` required for cross-browser.
- Known value for BubblyzComp design: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.80) 42%, #000 83%)`

**Fallback — blur fails to composite:** If `backdrop-blur` doesn't appear or bleeds through rounded corners even after applying `clip-path`, add `isolation: isolate` on the card shell element.
