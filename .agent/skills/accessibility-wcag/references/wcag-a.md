# WCAG 2.2 — Level A

Level A = **MUST pass**. Failure = hard blocker, không ship.

---

## 1. Perceivable

### 1.1 — Text Alternatives
- **1.1.1** Non-text Content — `alt` cho mọi `<img>`: meaningful → mô tả ngắn · decorative → `alt=""` + `aria-hidden="true"` · icon-only button → `aria-label` trên `<button>`

### 1.2 — Time-based Media
- **1.2.1** Audio/Video-only — Audio pre-recorded → transcript · Video pre-recorded → text alt hoặc audio description
- **1.2.2** Captions — Video có audio → `<track kind="captions">` synchronized
- **1.2.3** Audio Description — Video pre-recorded → audio description hoặc text alternative đầy đủ

### 1.3 — Adaptable
- **1.3.1** Info & Relationships — Cấu trúc visual phải có semantic tương ứng: heading → `<h1>`–`<h6>`, list → `<ul>`/`<ol>`, table header → `<th scope="col/row">`, required → `aria-required="true"`
- **1.3.2** Meaningful Sequence — DOM order = thứ tự đọc logic. CSS `order`/`flex-direction: row-reverse` không đổi DOM → screen reader đọc sai
- **1.3.3** Sensory Characteristics — Hướng dẫn không chỉ dựa vào shape/color/size/location. "Bấm nút tròn xanh" ❌ → "Bấm nút 'Xác nhận'" ✅

### 1.4 — Distinguishable
- **1.4.1** Use of Color — Màu không phải thông tin duy nhất. Kết hợp: icon + màu, text + màu, pattern + màu
- **1.4.2** Audio Control — Audio tự động > 3s → cần pause/stop/volume control

---

## 2. Operable

### 2.1 — Keyboard
- **2.1.1** Keyboard — Mọi action thao tác được bằng keyboard. `<div onClick>` ❌ → `<button>` ✅
- **2.1.2** No Keyboard Trap — Focus không bị nhốt (ngoại trừ modal — phải có Esc để thoát)
- **2.1.4** Character Key Shortcuts — Single-char shortcut → phải có cách tắt/remap/chỉ active khi focused

### 2.2 — Enough Time
- **2.2.1** Timing Adjustable — Time limit → user có thể turn off / adjust / extend (×10) trước khi hết
- **2.2.2** Pause, Stop, Hide — Auto-moving/blinking content > 5s → cần pause/stop/hide control

### 2.3 — Seizures
- **2.3.1** Three Flashes — Không có nội dung nhấp nháy > 3 lần/giây

### 2.4 — Navigable
- **2.4.1** Bypass Blocks — Skip link `<a href="#main-content">` ngay đầu `<body>`, visible on focus
- **2.4.2** Page Titled — `<title>` mô tả page: `"Giỏ hàng – Event Hub"`
- **2.4.3** Focus Order — Tab order logical = DOM order (thường). Không dùng `tabindex > 0`
- **2.4.4** Link Purpose — Link text rõ trong context. "Xem thêm" ❌ → `aria-label="Xem chi tiết Summer Fest"` ✅

### 2.5 — Input Modalities
- **2.5.1** Pointer Gestures — Multi-touch gesture (pinch, swipe) → có single-pointer alternative
- **2.5.2** Pointer Cancellation — Click action kích hoạt lúc `mouseup`/`pointerup`, không phải `mousedown`
- **2.5.3** Label in Name — `aria-label` phải chứa visible text label
- **2.5.4** Motion Actuation — Device motion (shake, tilt) → có alternative UI control + có thể disable

---

## 3. Understandable

### 3.1 — Readable
- **3.1.1** Language of Page — `<html lang="vi">` (hoặc `"en"`)

### 3.2 — Predictable
- **3.2.1** On Focus — Focus vào element không auto-trigger context change (navigate, submit)
- **3.2.2** On Input — Thay đổi setting không auto-submit — cần explicit action

### 3.3 — Input Assistance
- **3.3.1** Error Identification — Khi lỗi: chỉ rõ field nào + mô tả lỗi bằng text. Dùng `aria-invalid="true"` + `aria-describedby` trỏ đến error message
- **3.3.2** Labels or Instructions — Mọi input có label. Placeholder ❌ không phải label (biến mất khi type)

---

## 4. Robust

### 4.1 — Compatible
- **4.1.1** Parsing — HTML hợp lệ: unique `id`, tags đóng đúng, không duplicate attributes *(deprecated trong 2.2, vẫn là best practice)*
- **4.1.2** Name, Role, Value — Custom UI component phải expose: name + role + state/value. `<div onClick>` ❌ → `<button role="switch" aria-checked="false">` ✅
