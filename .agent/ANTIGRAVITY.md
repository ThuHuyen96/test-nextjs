# 🚀 Antigravity Project Manual

File này chứa các chỉ dẫn quan trọng để Antigravity hoạt động tối ưu trong dự án **flake-fe**.

## 🎯 Điều kiện kích hoạt (Activation)
Khi nhận được các yêu cầu sau, hãy luôn đọc file này trước:
- Link Figma (`figma.com/design/...`) hoặc Node ID (`123:456`).
- Yêu cầu triển khai UI ("implement UI", "render component", "markup task", "generate markup").
- Các lệnh liên quan đến `Tailwind CSS`.

## 🛠 Stack công nghệ & Thư viện
- **Core:** Vue 3 (Composition API) + Nuxt 3.
- **Styling:** Tailwind CSS (v3 config, hướng tới v4 patterns).
- **Breakpoints:** `xs: 360px`, `sm: 768px`, `md: 1024px`, `lg: 1440px`.

## 🧠 Quy trình thực thi (Workflow)
Luôn tuân thủ quy trình 4 giai đoạn (Phase 0 → 3) được định nghĩa trong `.agent/skills/markup-generation/SKILL.md`.

### Các Skill hiện có trong `.agent/skills/`:
1. **Preflight (`preflight`):** Giai đoạn "gatekeeper". Validate Figma URL, fetch design data và screenshot trước khi bắt đầu code.
2. **Markup Generation (`markup-generation`):** Quy trình chính chuyển thiết kế sang Vue 3. Thực thi theo 4 Phase (0: Planning, 1: Checklist, 2: Implementation, 3: Sign-off).
3. **Figma Layout Intent (`figma-layout-intent`):** Phân tích intent của thiết kế để chọn layout CSS phù hợp (ưu tiên Flex/Grid hơn Absolute).
4. **CSS Sizing (`css-sizing`):** Đảm bảo component có tính linh hoạt (layout-agnostic), sử dụng `rem` và tránh fixed width không cần thiết.
5. **Accessibility (`accessibility-wcag`):** Đảm bảo markup đạt chuẩn WCAG 2.2 AA.

### Các Vai trò (Roles) trong `.agent/roles/`:
- **Orchestrator:** Điều phối toàn bộ workflow từ Figma đến Code.
- **UI Verifier:** Kiểm tra độ khớp visual giữa code và thiết kế bằng multimodal vision.
- **Code Generator:** Chuyên trách việc viết markup Vue 3 chuẩn SEO và Accessibility.
- **Sign-off Checker:** Kiểm duyệt cuối cùng trước khi hoàn thành task.

### Các Slash Commands hỗ trợ:
- `/markup-task <task-name>`: Chạy workflow Figma → Vue dựa trên file task tại `.agent/tasks/`.
- `/index-components`: Đồng bộ chỉ mục component (`.agent/vue-index.json`).

## 📏 Quy tắc quan trọng (Critical Rules)
- **Phase 0 mandatory:** KHÔNG bao giờ viết code trước khi hoàn thành Phase 0 (Layout planning).
- **Mobile-first (xs base):** Luôn bắt đầu từ `xs` (360px), các breakpoint lớn hơn (`sm`, `md`, `lg`) chỉ dùng để override hoặc bổ sung.
- **Single-child rule:** Tuyệt đối không để wrapper div nếu nó chỉ chứa 1 phần tử con duy nhất. Di chuyển style lên child hoặc parent.
- **Flatten CSS:** Hạn chế lồng ghép div vô tội vạ. Mỗi div sinh ra phải có mục đích layout rõ ràng.
- **Tokens over Pixels:** Sử dụng Tailwind tokens cho màu sắc, spacing, typography. Hạn chế tối đa dùng `[...]`.

## 📂 Tài liệu tham khảo ưu tiên
1. `.agent/skills/markup-generation/SKILL.md` (Hướng dẫn workflow chính).
2. `.agent/skills/preflight/SKILL.md` (Quy tắc parse Figma và fetch data).
3. `.agent/skills/figma-layout-intent/SKILL.md` (Quy tắc chọn Absolute vs Flex).

---
*Manual này được duy trì bởi Antigravity Agent.*

