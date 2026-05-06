# WCAG 2.2 — Level AA

Level AA = **SHOULD pass**. Target chính. Violations cần fix trước release.
Bao gồm toàn bộ Level A + các tiêu chí bổ sung dưới đây.

---

## 1. Perceivable

### 1.3 — Adaptable
- **1.3.4** Orientation — Không lock portrait/landscape (ngoại trừ essential: piano app, v.v.)
- **1.3.5** Input Purpose — `autocomplete` cho input thu thập user info: `name` · `email` · `tel` · `street-address` · `new-password` · v.v.

### 1.4 — Distinguishable
- **1.4.3** Contrast Minimum — Normal text ≥ **4.5:1** · Large text (≥18pt / ≥14pt bold) ≥ **3:1** · UI component/icon/focus indicator ≥ **3:1** · Disabled/decorative/logo exempt
- **1.4.4** Resize Text — Dùng `rem`/`em` cho font-size. Browser zoom 200% không mất content. Không fixed `px` cho text
- **1.4.5** Images of Text — Không dùng `<img>` để render text (ngoại trừ logo, essential)
- **1.4.10** Reflow — Tại 320px width (400% zoom) không cần horizontal scroll. Dùng `max-width` + padding, không fixed width. Ngoại trừ: maps, data tables, video
- **1.4.11** Non-text Contrast — UI component borders, focus rings, icons ≥ **3:1** với adjacent color
- **1.4.12** Text Spacing — Không mất content khi user override: line-height ×1.5 · letter-spacing ×0.12 · word-spacing ×0.16 · paragraph spacing ×2. Fix: dùng `min-height` thay vì `height` cho containers chứa text
- **1.4.13** Content on Hover/Focus — Tooltip/popup phải: **dismissible** (Esc đóng) + **hoverable** (pointer vào tooltip không ẩn) + **persistent** (tồn tại đến khi user dismiss)

---

## 2. Operable

### 2.4 — Navigable
- **2.4.5** Multiple Ways — ≥ 2 cách tìm page: nav menu + search, hoặc nav + sitemap
- **2.4.6** Headings & Labels — Heading/label mô tả rõ topic. "Thông tin" ❌ → "Thông tin đặt vé" ✅
- **2.4.7** Focus Visible — Focus indicator visible. `* { outline: none }` ❌ hoàn toàn. Dùng `:focus-visible` để style lại
- **2.4.11** Focus Not Obscured (Minimum) — Focused element không bị sticky header/footer che **hoàn toàn**. Fix: `scroll-padding-top: [header-height]px`

### 2.5 — Input Modalities
- **2.5.7** Dragging Movements — Drag action → có single-pointer alternative (nút up/down thay vì chỉ drag-to-sort)
- **2.5.8** Target Size Minimum — Click/touch target ≥ **24×24 CSS px** (ngoại trừ inline text link). Khuyến nghị 44×44px cho mobile

---

## 3. Understandable

### 3.1 — Readable
- **3.1.2** Language of Parts — Text ngôn ngữ khác → `<span lang="en">sold out</span>`

### 3.2 — Predictable
- **3.2.3** Consistent Navigation — Nav lặp lại trên nhiều pages → cùng vị trí, cùng thứ tự
- **3.2.4** Consistent Identification — Components cùng chức năng → cùng label trên toàn site
- **3.2.6** Consistent Help — Help mechanism (chat, FAQ, phone) ở cùng vị trí mọi page

### 3.3 — Input Assistance
- **3.3.3** Error Suggestion — Khi có lỗi và suggestion khả thi → phải cung cấp. "Ngày không hợp lệ" ❌ → "Nhập theo định dạng DD/MM/YYYY" ✅
- **3.3.4** Error Prevention (Legal/Financial/Data) — Action quan trọng: ít nhất 1 trong 3: reversible (undo) · checked (verify trước submit) · confirmed (confirmation step)
- **3.3.7** Redundant Entry — Cùng một flow, không hỏi lại thông tin đã nhập (trừ security, ví dụ: confirm password)
- **3.3.8** Accessible Auth (Minimum) — Login không require cognitive test (CAPTCHA puzzle) mà không có alternative

---

## 4. Robust

### 4.1 — Compatible
- **4.1.3** Status Messages — Update không move focus phải exposed programmatically: success/info → `role="status" aria-live="polite"` · critical error → `role="alert" aria-live="assertive"` · loading → `aria-busy="true"`
