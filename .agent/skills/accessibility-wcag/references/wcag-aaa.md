# WCAG 2.2 — Level AAA

Level AAA = **OPTIONAL**. Chỉ implement khi PO/client yêu cầu rõ ràng.
WCAG không khuyến nghị require full AAA — một số tiêu chí mâu thuẫn nhau.

> **Ưu tiên implement trước** (high impact, low effort): 2.3.3 · 2.4.8 · 2.4.13 · 2.5.5

---

## 1. Perceivable

### 1.2 — Time-based Media
- **1.2.6** Sign Language — Video pre-recorded có audio → sign language interpretation
- **1.2.7** Extended Audio Description — Video pause không đủ cho audio description → extended version
- **1.2.8** Media Alternative — Pre-recorded time-based media → full text alternative (script-level)
- **1.2.9** Audio-only Live — Live audio stream → live text captioning

### 1.3 — Adaptable
- **1.3.6** Identify Purpose — UI regions có thể identified programmatically: dùng ARIA landmarks + `aria-label` rõ ràng cho mọi `<nav>`, `<section>`, `<aside>`

### 1.4 — Distinguishable
- **1.4.6** Contrast Enhanced — Normal text ≥ **7:1** · Large text ≥ **4.5:1**
- **1.4.7** Background Audio — Speech audio: background noise ≤ 20dB dưới foreground, hoặc user có thể tắt
- **1.4.8** Visual Presentation — User control được: foreground/background color · width ≤ 80 chars · no justified text · line spacing ≥ 1.5 · font size tăng 200%
- **1.4.9** Images of Text (No Exception) — Text trong ảnh chỉ cho logo hoặc pure decoration, không có exception khác

---

## 2. Operable

### 2.1 — Keyboard
- **2.1.3** Keyboard (No Exception) — Mọi functionality keyboard-operable, không exception nào

### 2.2 — Enough Time
- **2.2.3** No Timing — Không có time limit nào (ngoại trừ real-time events, essential)
- **2.2.4** Interruptions — Alerts/updates có thể bị postpone hoặc tắt (ngoại trừ emergency)
- **2.2.5** Re-authenticating — Sau session expire → user re-authenticate mà không mất data đã nhập
- **2.2.6** Timeouts — User được warn về timeout ảnh hưởng data loss (ngoại trừ session > 20h)

### 2.3 — Seizures
- **2.3.2** Three Flashes — Không flash > 3 lần/giây, không có exception
- **2.3.3** Animation from Interactions ⭐ — Motion animation kích hoạt bởi interaction có thể disabled. Implement `prefers-reduced-motion: reduce` → tắt/giảm animation

### 2.4 — Navigable
- **2.4.8** Location ⭐ — User biết đang ở đâu: breadcrumb (`aria-current="page"`) + active nav item
- **2.4.9** Link Purpose (Link Only) — Link text đủ rõ kể cả khi tách khỏi context, không cần surrounding text
- **2.4.10** Section Headings — Mọi section có heading tổ chức content
- **2.4.12** Focus Not Obscured (Enhanced) — Focused element không bị che BẤT KỲ phần nào (strict hơn AA 2.4.11)
- **2.4.13** Focus Appearance ⭐ — Focus indicator: bao quanh toàn bộ component · contrast change ≥ 3:1 giữa focused/unfocused · outline area ≥ perimeter × 1px

### 2.5 — Input Modalities
- **2.5.5** Target Size Enhanced ⭐ — Click target ≥ **44×44 CSS px**
- **2.5.6** Concurrent Input — Không restrict input method, user có thể mix mouse/keyboard/touch

---

## 3. Understandable

### 3.1 — Readable
- **3.1.3** Unusual Words — Thuật ngữ/jargon → definition qua glossary, tooltip, hoặc `<abbr title="...">`
- **3.1.4** Abbreviations — Mọi abbreviation → expansion lần đầu hoặc `<abbr>`
- **3.1.5** Reading Level — Content ở trình độ trung học cơ sở. Nếu không → cung cấp supplemental content
- **3.1.6** Pronunciation — Từ đọc đa nghĩa → cung cấp pronunciation

### 3.2 — Predictable
- **3.2.5** Change on Request — Context changes chỉ xảy ra khi user request, không auto-navigate

### 3.3 — Input Assistance
- **3.3.5** Help — Context-sensitive help có sẵn: tooltip, inline instruction, link to help page
- **3.3.6** Error Prevention (All) — Mọi submission (không chỉ legal/financial) → reversible / checked / confirmed
- **3.3.9** Accessible Auth (Enhanced) — Login không có cognitive test, không exception nào

---

## Prioritization

| ⭐ Priority | Criterion | Lý do |
|------------|-----------|-------|
| Implement ngay | **2.3.3** Animation | `prefers-reduced-motion` — ít code, impact lớn |
| Implement ngay | **2.4.8** Location | Breadcrumb tốt cho mọi user, không chỉ a11y |
| Implement ngay | **2.4.13** Focus Appearance | Keyboard UX đáng kể |
| Implement ngay | **2.5.5** Target Size 44px | Mobile critical |
| Cân nhắc | **1.3.6** Identify Purpose | Landmarks đã tốt → AAA dễ đạt |
| Cân nhắc | **1.4.6** Contrast Enhanced | Nếu design system support |
| Bỏ qua nếu N/A | 1.2.6–1.2.9 | Chỉ khi có media content |
