# VietTune — UI/UX khu vực Admin

Tài liệu mô tả trải nghiệm giao diện và luồng tương tác cho **Quản trị viên (ADMIN)** trên frontend, bám theo code trong `src/pages/admin/**`, `src/components/admin/**`, và `src/features/admin/**`.

---

## 1. Phạm vi & điều hướng

### 1.1. Route được bảo vệ

Các route dưới `/admin` bọc trong **`AdminGuard`** (`src/components/admin/AdminGuard.tsx`):

| Path | Trang / panel | Ghi chú UX |
|------|----------------|------------|
| `/admin` | `AdminDashboard` | **≥lg:** lưới 2 cột — rail trái (`AdminDashboardRail`) + cột chính; **Tóm tắt nhanh** (`AdminOverviewStrip`); dải **Tri thức & taxonomy** (`AdminGovernanceStrip`, thẻ tới master-data / KB admin / Researcher / KB public); stepper chip + footer wizard **ẩn** trên desktop (dùng rail). **&lt;lg:** giữ stepper ngang + footer như trước (không hiện governance strip). Query `?section=` đồng bộ bước. |
| `/admin/create-expert` | `CreateExpertPage` | Form tạo tài khoản Chuyên gia. |
| `/admin/knowledge-base` | `KnowledgeBasePage` | Bọc `KnowledgeBasePanel`, `listBackTo="/admin"`. |
| `/admin/master-data` | `MasterDataPage` | CRUD dữ liệu tham chiếu (sidebar + bảng). |
| `/admin/operations` | `AdminOperationsPage` | P3 — vận hành & quản trị AI: circuit semantic, placeholder nhật ký job, sao chép chẩn đoán. Chỉ hiện CTA đầy đủ trên dashboard + link dưới rail khi `VITE_ADMIN_OPERATIONS_PAGE=true` \| `1`; không cờ vẫn mở URL (card hướng dẫn bật cờ). `BackButton` về luồng trước. |

**Header (feature strip):** với user `ADMIN`, `getLayoutFeatureItems` thêm hai mục: **«Cấp tài khoản Chuyên gia»** → `/admin/create-expert`, **«Quản trị hệ thống»** → `/admin` (`src/utils/layoutFeatureItems.ts`).

**Từ dashboard:** nút **«Dữ liệu hệ thống»** dùng `navigate('/admin/master-data')` (SPA). Khi cờ P3 bật, thêm nút **«Vận hành & AI»** → `/admin/operations`; rail desktop thêm mục **«Vận hành & AI»** (link). Trang `/admin` đồng bộ bước stepper với query **`?section=`** (`users` \| `analytics` \| `aiMonitoring` \| `moderation`); giá trị không hợp lệ bị xóa khỏi URL; không có `section` mặc định là bước Quản lý người dùng.

### 1.2. Trạng thái guard (trước khi vào nội dung)

- **Đang xác định / chưa đăng nhập:** card giữa màn hình, spinner + «Đang chuyển đến đăng nhập…».
- **Không đủ quyền:** tương tự + «Bạn không có quyền truy cập khu vực quản trị» → redirect theo `routeAccess`.
- **Tài khoản inactive:** thông báo «Tài khoản chưa khả dụng» + CTA quay lại.

Khuyến nghị UX: giữ copy ngắn, một thông điệp chính + một dòng phụ — đã đúng hướng trong `AdminGuard`.

---

## 2. Ngôn ngữ thị giác (design system)

Admin **không tách theme** khỏi phần còn lại của app: dùng chung token VietTune (đỏ primary, vàng secondary, nền kem `surface-panel`, viền `neutral-200`, bo `rounded-2xl` / `rounded-full` cho CTA).

### 2.1. Mẫu lặp trên `AdminDashboard`

- **Tiêu đề trang:** `text-xl sm:text-3xl font-bold text-neutral-900`.
- **Nhóm hành động phải:** nút viền (**Dữ liệu hệ thống**), nút gradient đặc (**Hướng dẫn**), `BackButton`.
- **Khối stepper «Điều hướng quản trị»:** panel kem, chip tròn theo bước — **chỉ hiện dưới `lg`** (`lg:hidden`); màn hình lớn dùng **rail dọc** cố định (`sticky`) trong `src/features/admin/shell/AdminDashboardRail.tsx`.
- **Tóm tắt nhanh (desktop):** bốn thẻ số liệu (`AdminOverviewStrip`) — `hidden lg:block`; không thay đổi layout mobile/tablet.
- **Liên kết governance (desktop):** `AdminGovernanceStrip` — lưới thẻ tới master-data, KB quản trị, `/researcher`, `/knowledge-base`; `hidden lg:block`.
- **Nội dung chính:** `Card variant="bordered"` full width, `!p-0 overflow-hidden` để panel con tự padding; bên trong gọi `AdminDashboardPanels` (`features/admin/dashboard/`) theo `step`.
- **Chân trang wizard:** «Quay lại» / «Tiếp theo» — `lg:hidden` (trùng chức năng rail trên desktop); dưới `lg` giữ hành vi cũ.

### 2.2. Nguyên tắc nhất quán

- Icon **Lucide** cạnh tiêu đề cấp 2 (Users, BarChart3, Bot, Shield…) trong khung `bg-*-100/90 rounded-lg`.
- **Hành động huỷ / nguy hiểm:** dialog xác nhận với nút xác nhận gradient đỏ (`ConfirmationDialog` + `confirmButtonStyle` tùy chỉnh).

---

## 3. Cấu trúc thông tin — `AdminDashboard`

Bốn bước (`StepId`): **users → analytics → aiMonitoring → moderation**.

| Bước | Label UI | Panel | Nội dung chính cho admin |
|------|-----------|--------|---------------------------|
| 1 | Quản lý người dùng | `AdminUserManagement` | Bảng user, gán vai trò, làm mới, hướng dẫn; lỗi API hiển thị banner đỏ có ghi endpoint. |
| 2 | Phân tích & thống kê | `AdminDashboardAnalyticsPanel` | Số liệu tổng hợp (bản ghi, dân tộc, nhạc cụ, user, biểu đồ theo tháng…). |
| 3 | Giám sát hệ thống AI | `AdminDashboardAiMonitoringPanel` | Độ chính xác expert, flagged AI, KB, bảng hiệu suất. |
| 4 | Kiểm duyệt nội dung | `AdminDashboardModerationPanel` | Yêu cầu xóa/sửa bản ghi, chuyển tiếp expert, duyệt xóa tài khoản expert, bảng recording local + xóa. |

**Điều hướng:** chip và rail gọi `goSection` → query **`?section=`** (`replace: true`); scroll `top: 0`. Nút **Tiếp theo** / **Quay lại** (mobile) cũng cập nhật cùng query param.

### 3.1. Modal «Hướng dẫn Quản trị viên»

- Overlay full viewport, `z-[100]`, `bg-black/60 backdrop-blur-sm`, đóng khi click nền.
- Khối nội dung: `max-w-3xl`, `max-h-[90vh]`, scroll nội bộ; header có `aria-labelledby`, nút đóng có `sr-only` «Đóng».
- Nội dung chia **card có cạnh màu** (primary / sky / amber) — giúp quét nhanh từng khối năng lực (người dùng / phân tích / AI / kiểm duyệt).

### 3.2. Phản hồi hành động (toast & tình huống lệch API)

- Gán vai trò / vô hiệu hoá user: nếu API lỗi vẫn cập nhật **UI + `users_overrides` / `admin_deleted_user_ids`** trong storage → toast **cảnh báo** «Chỉ cập nhật trên giao diện» để admin không tưởng BE đã đồng bộ.
- Xóa bản ghi local: `ConfirmationDialog` → toast success/error.

**UX:** rõ ràng phân biệt success vs «optimistic / demo» — tốt cho độ tin cậy; cần lưu ý khi product hoá: giảm reliance vào override local hoặc gắn badge «Chờ đồng bộ» trên dòng user.

---

## 4. Quản lý người dùng (`AdminUserManagement`)

- **Hero copy:** đoạn mô tả vai trò + chất lượng đóng góp (tiếng Việt, tone trung tính).
- **Banner lỗi:** nền đỏ nhạt, icon `FileWarning`, ghi rõ `/api/User/GetAll` để dev/admin hiểu nguyên nhân.
- **Khối «Gợi ý quy trình»:** gợi ý ưu tiên gán **Chuyên gia**; hai nút **Xem hướng dẫn** (mở modal) và **Làm mới** (gọi `load`, toast «Đã làm mới»).
- **Bảng:** `overflow-x-auto` — phù hợp mobile; cột hành động dùng dropdown vai trò (`AdminDashboardDropdowns`).

---

## 5. Master Data (`/admin/master-data`)

Layout **master–detail kiểu admin cổ điển:**

- **Sidebar:** `EntitySidebar` — chọn loại thực thể (`instruments`, … theo `entityConfigs`).
- **Toolbar:** `EntityTableToolbar` — tìm kiếm (debounce qua `useEntitySearch`).
- **Bảng:** `EntityTable` + phân trang; loading: `TableSkeleton`; lỗi: `ErrorState`; rỗng: `EmptyState`.
- **Dialog:** `EntityFormDialog` (thêm/sửa), `EntityDeleteDialog` (xóa, có thể kèm usage count sau pre-fetch).

**UX:** luồng «chọn loại → lọc/tìm → CRUD trong dialog» dễ học; nên đảm bảo keyboard focus trap trong dialog (kiểm tra từng `EntityFormDialog` nếu nâng a11y).

---

## 6. Tạo Chuyên gia (`CreateExpertPage`)

- Loading gate khi `isAuthLoading`; non-admin → `navigate('/403')`.
- Form: `Input` + validation tiếng Việt (username pattern, email, password `validatePassword`, khớp xác nhận).
- **Mật khẩu hiển thị một lần** (`expertPasswordRevealOnce`) sau tạo — copy an toàn cho admin truyền tay cho expert (không persist trong UI state lâu dài).

**UX:** rõ ràng cho quy trình onboarding; nên cân nhắc thêm nút «Sao chép mật khẩu» nếu trình duyệt hỗ trợ Clipboard API.

---

## 7. Knowledge Base admin (`KnowledgeBasePage`)

- Shell mỏng: `KnowledgeBasePanel` với **`listBackTo="/admin"`** để breadcrumb/back nhất quán về dashboard.
- Hỗ trợ **`openCreateOnMount`** khi `location.state.kbOpenCreate` — pattern deep-link / handoff từ nơi khác.

---

## 8. Khả năng tiếp cận (a11y) — điểm đã có

- Modal hướng dẫn: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` khớp tiêu đề.
- Một số nút icon có `sr-only` hoặc `title`.

**Gợi ý:** đảm bảo chip stepper có `aria-current` / `role="tablist"` nếu muốn chuẩn pattern wizard; trap focus trong `ConfirmationDialog` khi mở.

---

## 9. Rủi ro UX / kỹ thuật (để backlog)

1. ~~**`window.location` tới master-data**~~ — đã chuyển sang `useNavigate` (P0). Tiếp theo có thể cân nhắc `<Link>` nếu cần mở tab mới / chuột giữa.
2. ~~**Wizard 4 bước không sync URL**~~ — đã có `?section=` (P0). Có thể mở rộng nested route `/admin/users` sau.
3. **Toast «chỉ cập nhật giao diện»** — cần guideline nội bộ khi nào được phép override local vs bắt buộc API thành công.

---

## 10. File tham chiếu nhanh

| File | Vai trò UI |
|------|------------|
| `src/pages/admin/AdminDashboard.tsx` | Layout dashboard (grid `lg+`), rail + overview desktop, stepper mobile, modal hướng dẫn, dialog. |
| `src/features/admin/shell/adminNavConfig.ts` | Nhãn rail theo section. |
| `src/features/admin/shell/AdminDashboardRail.tsx` | Điều hướng dọc desktop (`lg+`). |
| `src/features/admin/shell/AdminOverviewStrip.tsx` | Thẻ tóm tắt nhanh (desktop). |
| `src/components/admin/AdminUserManagement.tsx` | Bảng + banner lỗi + gợi ý quy trình. |
| `src/components/admin/AdminDashboardAnalyticsPanel.tsx` | Thống kê. |
| `src/components/admin/AdminDashboardAiMonitoringPanel.tsx` | AI monitoring. |
| `src/components/admin/AdminDashboardModerationPanel.tsx` | Moderation admin. |
| `src/components/admin/AdminGuard.tsx` | Trạng thái chờ / từ chối truy cập. |
| `src/features/admin/master-data/pages/MasterDataPage.tsx` | Shell master data. |
| `src/pages/admin/CreateExpertPage.tsx` | Form expert. |
| `src/pages/admin/KnowledgeBasePage.tsx` | Entry KB admin. |

---

*Tài liệu này mô tả trạng thái codebase tại thời điểm tạo; khi đổi route hoặc panel, cập nhật bảng mục 1 và mục 10 cho khớt.*
