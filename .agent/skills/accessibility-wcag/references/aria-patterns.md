# ARIA Patterns Reference

> **Nguyên tắc số 1:** Semantic HTML luôn ưu tiên. ARIA chỉ dùng khi native HTML không đủ.
> **Nguyên tắc số 2:** No ARIA is better than bad ARIA.

---

## Index

- [Landmarks](#landmarks)
- [Buttons & Controls](#buttons--controls)
- [Forms](#forms)
- [Widgets: Modal / Dialog](#modal--dialog)
- [Widgets: Dropdown / Listbox](#dropdown--listbox)
- [Widgets: Tabs](#tabs)
- [Widgets: Accordion](#accordion)
- [Widgets: Tooltip](#tooltip)
- [Widgets: Combobox / Autocomplete](#combobox--autocomplete)
- [Live Regions](#live-regions)

---

## Landmarks

Mọi page phải có đủ landmark structure để screen reader navigate nhanh.

```html
<header role="banner">          <!-- implicit: <header> top-level -->
  <nav aria-label="Navigation chính">...</nav>
</header>

<main id="main-content">        <!-- implicit: <main> -->
  <section aria-label="Hero">...</section>
  <section aria-label="Danh sách sự kiện">...</section>
</main>

<aside aria-label="Bộ lọc">...</aside>

<footer role="contentinfo">     <!-- implicit: <footer> top-level -->
  <nav aria-label="Navigation footer">...</nav>
</footer>
```

**Rules:**
- Nhiều `<nav>` → phân biệt bằng `aria-label`
- Nhiều `<section>` → cần `aria-label` hoặc `aria-labelledby` (heading bên trong)
- `<aside>` luôn có `aria-label`
- Không nest `<main>` trong `<main>`

---

## Buttons & Controls

### Standard button
```html
<!-- ✅ hành động -->
<button type="button">Thêm vào giỏ</button>

<!-- ✅ icon-only (cần aria-label) -->
<button type="button" aria-label="Đóng">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- ✅ toggle button -->
<button type="button" aria-pressed="false" aria-label="Yêu thích">
  ❤️
</button>
```

### Link vs Button
```html
<!-- Link = navigation (thay đổi URL) -->
<a href="/events/123">Xem sự kiện</a>

<!-- Button = action (không thay đổi URL) -->
<button onclick="addToCart()">Thêm vào giỏ</button>

<!-- ❌ sai hoàn toàn -->
<a href="#" onclick="addToCart()">Thêm vào giỏ</a>
```

---

## Forms

### Label linkage
```html
<!-- Method 1: for/id (recommended) -->
<label for="email">Địa chỉ email <span aria-hidden="true">*</span></label>
<input id="email" type="email" required aria-required="true">

<!-- Method 2: wrap (khi không có id) -->
<label>
  Địa chỉ email
  <input type="email" required>
</label>

<!-- Method 3: aria-label (khi không có visible label) -->
<input type="search" aria-label="Tìm kiếm sự kiện">

<!-- Method 4: aria-labelledby (dùng text element làm label) -->
<h2 id="billing-heading">Thông tin thanh toán</h2>
<fieldset aria-labelledby="billing-heading">...</fieldset>
```

### Error handling
```html
<div class="form-field">
  <label for="phone">Số điện thoại</label>
  <input
    id="phone"
    type="tel"
    aria-describedby="phone-hint phone-error"
    aria-invalid="true"
  >
  <span id="phone-hint" class="hint">Ví dụ: 0912345678</span>
  <span id="phone-error" role="alert" class="error">
    Số điện thoại phải có 10 chữ số.
  </span>
</div>
```

### Fieldset + legend (groups)
```html
<!-- Radio group -->
<fieldset>
  <legend>Giới tính</legend>
  <label><input type="radio" name="gender" value="male"> Nam</label>
  <label><input type="radio" name="gender" value="female"> Nữ</label>
  <label><input type="radio" name="gender" value="other"> Khác</label>
</fieldset>

<!-- Checkbox group -->
<fieldset>
  <legend>Loại sự kiện yêu thích</legend>
  <label><input type="checkbox" name="type" value="music"> Âm nhạc</label>
  <label><input type="checkbox" name="type" value="sport"> Thể thao</label>
</fieldset>
```

---

## Modal / Dialog

### Pattern chuẩn
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
  tabindex="-1"
  id="confirm-dialog"
>
  <h2 id="dialog-title">Xác nhận hủy đơn</h2>
  <p id="dialog-desc">Hành động này không thể hoàn tác.</p>
  <div class="dialog-actions">
    <button type="button" autofocus>Hủy đơn</button>
    <button type="button">Giữ lại</button>
  </div>
  <button type="button" aria-label="Đóng dialog" class="close-btn">×</button>
</div>
```

**Focus management (JS bắt buộc):**
```javascript
// Khi mở dialog
dialog.removeAttribute('hidden')
dialog.focus() // hoặc focus vào first focusable element

// Trap focus trong dialog
dialog.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') trapFocus(e, dialog)
  if (e.key === 'Escape') closeDialog()
})

// Khi đóng dialog
dialog.setAttribute('hidden', '')
triggerButton.focus() // trả focus về trigger
```

---

## Dropdown / Listbox

### Custom select (listbox pattern)
```html
<!-- Trigger -->
<button
  id="dropdown-trigger"
  aria-haspopup="listbox"
  aria-expanded="false"
  aria-controls="dropdown-list"
>
  Chọn thể loại <span aria-hidden="true">▼</span>
</button>

<!-- List -->
<ul
  id="dropdown-list"
  role="listbox"
  aria-labelledby="dropdown-trigger"
  hidden
>
  <li role="option" aria-selected="false" id="opt-1">Âm nhạc</li>
  <li role="option" aria-selected="true" id="opt-2">Thể thao</li>
  <li role="option" aria-selected="false" id="opt-3">Ẩm thực</li>
</ul>
<!-- ⚠️ KHÔNG dùng aria-current trên listbox option — aria-current dành cho navigation (breadcrumb, nav link).
     Listbox option chỉ dùng aria-selected. -->
```

**Keyboard:** `↑↓` navigate, `Enter`/`Space` select, `Esc` close.

---

## Tabs

```html
<div>
  <!-- Tab list -->
  <div role="tablist" aria-label="Thông tin sự kiện">
    <button
      role="tab"
      id="tab-info"
      aria-controls="panel-info"
      aria-selected="true"
      tabindex="0"
    >Thông tin</button>
    <button
      role="tab"
      id="tab-schedule"
      aria-controls="panel-schedule"
      aria-selected="false"
      tabindex="-1"
    >Lịch trình</button>
  </div>

  <!-- Panels -->
  <div role="tabpanel" id="panel-info" aria-labelledby="tab-info">
    Nội dung thông tin...
  </div>
  <div role="tabpanel" id="panel-schedule" aria-labelledby="tab-schedule" hidden>
    Nội dung lịch trình...
  </div>
</div>
```

**Keyboard:** `←→` navigate tabs (roving tabindex), `Enter`/`Space` activate, `Home`/`End`.

---

## Accordion

```html
<div class="accordion">
  <h3>
    <button
      type="button"
      aria-expanded="false"
      aria-controls="section-1-content"
      id="section-1-header"
    >
      Câu hỏi 1
    </button>
  </h3>
  <div
    id="section-1-content"
    role="region"
    aria-labelledby="section-1-header"
    hidden
  >
    Nội dung câu trả lời...
  </div>
</div>
```

**Note:** `role="region"` chỉ dùng khi panel content có ý nghĩa landmark. Nếu là simple show/hide → không cần `role="region"`.

---

## Tooltip

```html
<!-- Trigger -->
<button
  type="button"
  aria-describedby="tooltip-1"
  id="info-btn"
>
  <svg aria-hidden="true">...</svg>
  <span class="sr-only">Thông tin thêm</span>
</button>

<!-- Tooltip -->
<div
  role="tooltip"
  id="tooltip-1"
  class="tooltip"
  hidden
>
  Phí dịch vụ được tính dựa trên giá vé gốc.
</div>
```

**Rules:**
- `role="tooltip"` — chỉ cho informational content, không interactive
- Tooltip là `aria-describedby` (bổ sung), không `aria-labelledby` (thay thế)
- Xem WCAG 1.4.13 trong `wcag-aa.md` — hoverable + dismissible + persistent

---

## Combobox / Autocomplete

```html
<label for="event-search">Tìm sự kiện</label>
<input
  id="event-search"
  type="text"
  role="combobox"
  aria-autocomplete="list"
  aria-expanded="false"
  aria-controls="search-results"
  aria-activedescendant=""
  autocomplete="off"
>
<ul id="search-results" role="listbox" hidden>
  <li role="option" id="result-1">Summer Fest 2025</li>
  <li role="option" id="result-2">Summer Music Night</li>
</ul>
```

**Keyboard:** `↑↓` navigate, `Enter` select, `Esc` close.

---

## Live Regions

```html
<!-- Status: polite (không interrupt) -->
<div role="status" aria-live="polite" aria-atomic="true">
  <!-- Inject text động: "Đã thêm vào giỏ hàng" -->
</div>

<!-- Alert: assertive (interrupt ngay) — dùng hạn chế -->
<div role="alert" aria-live="assertive">
  <!-- Chỉ cho critical errors -->
</div>

<!-- Busy state -->
<div aria-busy="true" aria-live="polite">
  Đang tải dữ liệu...
</div>
```

**Tips:**
- Inject text vào live region SAU khi element đã có trong DOM (không inject cùng lúc render)
- `aria-atomic="true"` — đọc toàn bộ region khi có thay đổi bất kỳ
- `aria-relevant="additions"` — mặc định, chỉ thông báo khi thêm nodes

---

---

