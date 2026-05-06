# Swiper / Carousel — Implementation Guide

> Read this file when implementing a carousel.
>
> Use native `<button>` with a suitable `aria-label` for navigation.

---

## Detect as carousel when ANY signal present

- Layer/component name: `carousel`, `slider`, `swiper`, `slide`, `BannerSlider`, `Pagination`
- Prev/next chevrons flanking a horizontal row
- Pagination dots scoped to a card row
- Peek of next slide at edge
- Task annotation: swipe, scroll-snap, "more items off-screen"

**Not a carousel:** A row that only reflows by breakpoint with no stepping, no peek, no dots → use responsive grid.

---

## Full implementation template (React)

```tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export const Carousel = ({ items }: Props) => {
  const swiperOptions = {
    modules: [Navigation, Pagination],
    slidesPerView: 1,
    spaceBetween: 16,
    breakpoints: {
      768:  { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 20 },
      1440: { slidesPerView: 4, spaceBetween: 24 },
    },
    navigation: {
      prevEl: '.prefix-nav-prev',
      nextEl: '.prefix-nav-next',
      disabledClass: 'prefix-nav-disabled',
    },
    pagination: { el: '.prefix-pagination', clickable: true },
  };

  return (
    <div className="relative">
      <Swiper {...swiperOptions}>
        {items.map((item) => (
          <SwiperSlide key={item.id} className="!bg-transparent">
            <ItemCard {...item} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Nav OUTSIDE Swiper — below track when Figma has no explicit position spec */}
      <div className="flex items-center justify-center gap-4 mt-5">
        <button className="prefix-nav-prev" aria-label="Previous">
          <NavPrevIcon />
        </button>
        <div className="prefix-pagination" />
        <button className="prefix-nav-next" aria-label="Next">
          <NavNextIcon />
        </button>
      </div>

      <style jsx global>{`
        .prefix-nav-disabled {
          opacity: 0.3;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
```

**Replace `prefix-`** with a component-specific prefix (e.g. `event-`) to avoid selector collisions.

---

## Rules

| Rule | Detail |
|------|--------|
| Options in `const` + spread | Never inline props on `<Swiper>` |
| Slides use a Card component | Let Swiper size from `slidesPerView` + `spaceBetween` — no manual width on slides |
| Nav outside Swiper | Use nav buttons as siblings, never inside `<Swiper>` |
| Custom class names only | Never `swiper-button-prev` / `swiper-button-next` — always custom |
| Custom `disabledClass` | Matches your prefix; controls `opacity`/`pointer-events` |
| Nav position | If Figma shows no explicit position → nav **below** track with dots (`[Prev] [dots] [Next]`) |
| `slidesPerView` | See **"Choosing slidesPerView"** section below |
| Default slide class | **`!bg-transparent` — MANDATORY on every `<SwiperSlide>`, no exception** |

---

## Choosing slidesPerView

**Question to answer first:** Does the item have its own fixed width (from the design), or does the item fill the container?

### Signals from Figma

Look at the item width at each breakpoint in Figma.

- **At least 2 consecutive breakpoints have the same item width** → item is designed with a fixed size → use `slidesPerView: 'auto'`
- **Item width changes at every breakpoint relative to the container** → item fills the container, the number of columns changes → use `slidesPerView: N`

### `slidesPerView: 'auto'` — item has a fixed width from the design

The item knows its own width. Swiper packs as many as fit.
A fixed width must be set on `<SwiperSlide>` (or the card inside it).

```tsx
const swiperOptions = {
  slidesPerView: 'auto',
  spaceBetween: 12,
  breakpoints: {
    1024: { spaceBetween: 20 },
  },
};

// Template: fixed width on slide (take value from Figma inspect)
<SwiperSlide
  key={item.id}
  className="!bg-transparent !w-[28rem] sm:!w-[40rem] md:!w-[72rem]"
>
  <ItemCard {...item} />
</SwiperSlide>
```

### `slidesPerView: N` — item fills the container, number of columns changes

The item has no fixed width. Swiper calculates width based on `N`.

```tsx
const swiperOptions = {
  slidesPerView: 1,
  spaceBetween: 12,
  breakpoints: {
    768:  { slidesPerView: 2, spaceBetween: 12 },
    1024: { slidesPerView: 3, spaceBetween: 20 },
    1440: { slidesPerView: 4, spaceBetween: 20 },
  },
};

// Template: do NOT set width on slide — Swiper handles it
<SwiperSlide key={item.id} className="!bg-transparent">
  <ItemCard {...item} />
</SwiperSlide>
```

---

## Flanking nav (absolute, from Figma)

When Figma places prev/next **beside** the track (not below), use absolute positioning:

```tsx
<div className="relative">
  <Swiper {...swiperOptions}>...</Swiper>

  <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10">
    <button className="prefix-nav-prev" aria-label="Previous">‹</button>
  </div>
  <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-10">
    <button className="prefix-nav-next" aria-label="Next">›</button>
  </div>
</div>
```
