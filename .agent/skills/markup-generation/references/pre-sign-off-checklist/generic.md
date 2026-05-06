# Pre-sign-off Checklist — Generic (All UI libs)

**Run before sign-off.** Do not skip. Each item must pass.

---

## 1. Grep checks (run in workspace)

> **`[output_root]`** = the root directory of output files in this task.
> Taken from the `output_paths` passed in — e.g. `markup/`, `src/markup/`, `packages/web/markup/`.
> Grep only on files written in this task, not the entire repo.

| # | Command | Action if match |
|---|---------|-----------------|
| 1 | `grep -r "max-w-none\|max-h-none" [output_root]/` | Replace with `max-w-[none]`, `max-h-[none]` |
| 2 | `grep -rn 'className="' [output_root]/ --include="*.tsx" \| grep -v '^[^:]*:[^:]*:.*className="[^"]*"'` | If `className="` is found without a closing `"` on the same line → merge onto one line. Alternative: `grep -Pn 'className="[^"]*$' [output_root]/**/*.tsx` (requires grep -P) |
| 3 | `grep -r "swiper-button-prev\|swiper-button-next" [output_root]/` | Use custom class — see `swiper-guide.md` |
| 4 | `grep -r "slidesPerView: 'auto'" [output_root]/` | Check: variable width needed? If not → use numeric + breakpoints |
| 5 | `grep -r "backdrop-blur" [output_root]/` | For each match: verify card outer uses `clip-path: inset(...)`, NOT `overflow-clip` — see `backdrop-blur.md` |
| 6 | `grep -rn "absolute" [output_root]/ --include="*.tsx"` | **Most commonly missed.** For every matched line: does that element also have a `z-[N]` class? If not → add the appropriate z-index. Scan ALL matches — background imgs, overlays, decor groups, nav buttons — none exempt. |

---

## 2. Manual checks (per modified file)

| # | Check | Rule |
|---|-------|------|
| 4 | **backdrop-blur + overlay (absolute bottom):** Does it have `mask-image` / `-webkit-mask-image` in the same file? | `backdrop-blur.md §Mask + backdrop-blur` |
| 5 | **absolute (confirmed by grep #5 above):** Every `absolute` has a z-index token. Background (z-base), decor/overlay (z-docked), content (z-sticky+). None exempt, including `aria-hidden`. | `markup-rules.mdc §Absolute` |
| 6 | **blur + clip-path:** (a) `clip-path: inset(0 round ...)` on **card outer**? (b) `overflow-clip`/`overflow-hidden` removed from that element? (c) No intermediate `clip-path` wrapper between card outer and blur? | `backdrop-blur.md` |
| 9 | **Swiper nav:** Prev/next outside Swiper, custom class, `disabledClass`? No nav position in Figma → nav below track? | `swiper-guide.md` |
| 10 | **mask-image gradient:** Values copied exact from Figma? Check: (1) direction — `180deg` vs `to top/bottom`, (2) number of stops, (3) opacity per stop. Default pattern values are PLACEHOLDERS only. | `known-issues.md §Blur overlay mask` |

---

## 3. Token pass

- Open the **token file `references/tokens-tailwind.md`**
- For each `text-[…]`, `leading-[…]`, `p-[…]`, `gap-[…]`, `rounded-[…]`: is there an equivalent token? → replace if yes

---

## 4. Root cause scan

- Copy-paste from codegen without token pass?
- LG values used as base for xs?
- Over-engineering (slot instead of prop, computed for static)?

---

## 5. Figma verification

- xs/sm/md/lg compared with `get_screenshot`? → All **yes** before done.

---

**Violation = defect.** Do not sign-off when violations remain.
