# AUDIT FE — Hard-code màu / style không đồng bộ với UI/UX tổng thể

**Ngày:** 2026-06-06  
**Phạm vi:** Frontend React + Tailwind (`src/`, `tailwind.config.js`, `index.css`)  
**Mục tiêu:** Liệt kê chỗ dùng màu / layout hard-code lệch design system VietTune, ưu tiên sửa theo impact thị giác.

---

## 1. Design system đang có (baseline)

Nguồn chuẩn: `tailwind.config.js` + `@layer components` trong `src/index.css`.

| Token | Giá trị / vai trò | Ghi chú |
|---|---|---|
| `primary-*` | Đỏ VietTune `#da251d` … | CTA, header, brand accent |
| `secondary-*` | Vàng cờ VN `#f59e0b` … | Tab active, highlight phụ |
| `cream-50/100/200` | `#FFF7E6`, `#FFF2D6`, `#FFECC4` | Nền ấm |
| `surface.panel` | `#FFFCF5` | Panel/card sáng hơn nền |
| `neutral-*` | Text + border | **`neutral-50` = `#FFF2D6`** — trùng cream, dễ nhầm |
| `.btn-vt-*`, `.vt-container` | Component classes | **Hầu như không được import trong TSX** |
| `Button.tsx`, `Badge.tsx` | Shared components | Style riêng, không khớp `.btn-vt-*` |

**Tông UI/UX mong muốn (từ layout chính):** nền kem ấm, panel sáng (`surface-panel`), accent đỏ–vàng, bo góc lớn (`rounded-2xl` / `rounded-full`), shadow nhẹ.

---

## 2. Tóm tắt phát hiện

| Mức | Vấn đề | Số file ước lượng | Impact |
|---|---|---:|---|
| **P0** | Nhiều sắc kem hard-code hex thay vì token | ~20 | Nền/trang/hover lệch nhau dù “cùng kiểu” |
| **P0** | `amber-*` (Tailwind mặc định) thay cho `secondary-*` / semantic token | ~50 | Cảnh báo / advisory trông khác tab & badge vàng brand |
| **P1** | Chart & graph dùng palette indigo/xanh/đỏ generic | ~8 | Admin analytics & KG lệch brand đỏ–vàng |
| **P1** | Semantic màu (`success`, `danger`, `info`) không thống nhất | ~15 | Badge, checklist, button danger khác tông |
| **P1** | `bg-white` bị override global → panel “trắng” thực ra là kem | ~80+ | Kỳ vọng trắng vs thực tế cream gây patchy UI |
| **P2** | 3 hệ button song song (inline / `Button` / `.btn-vt-*`) | rộng | Hover scale, radius, shadow không đồng nhất |
| **P2** | Modal header gradient copy-paste `#FFF8EA` | 4 | Duplicate, khó đổi theme một lần |
| **P3** | Canvas / WaveSurfer hex riêng | ~5 | Chấp nhận được nếu map qua `brandColors.ts` |

---

## 3. P0 — Nền kem & hover hard-code

### 3.1 Bảng màu kem “song song” (chưa có token)

| Hex | Gần token nhất | Xuất hiện | Vấn đề |
|---|---|---|---|
| `#FFF2D6` | `cream-100` / `neutral-50` | `MainLayout`, auth pages, `index.css`, `:root` | Dùng **cả** class lẫn `bg-[#FFF2D6]` |
| `#FFF7E6` | `cream-50` | `SingleTrackPlayer`, `KnowledgeBasePanel` inline style | Trùng token nhưng bypass Tailwind |
| `#FFF8EA` | *(không có)* | Modal headers (`ModerationModals`, `StageTransitionConfirmDialog`) | Sắc kem thứ 4, lệch `cream-50` |
| `#F5F0E8` | *(không có)* | Hover nút/pagination/search (~8 file) | Hover xám-kem, khác `primary-50` / `secondary-50` |
| `#fafaf8` | *(không có)* | Metadata suggestion panels | Panel xám lạnh, không “ấm” như brand |
| `#fffef9` | *(không có)* | `.vt-section-accent` trong CSS | Section accent thứ 5 |
| `#FFF1F3` | *(không có)* | `ChatbotPage` message area gradient | **Hồng nhạt** — lệch hoàn toàn palette kem–đỏ–vàng |

**File tiêu biểu:**

- `src/components/layout/MainLayout.tsx` — `bg-[#FFF2D6]` → nên `bg-cream-100` hoặc `bg-neutral-50`
- `src/pages/auth/LoginPage.tsx`, `RegisterPage.tsx`, `ConfirmAccountPage.tsx` — cùng hex
- `src/components/features/SearchBar.tsx`, `SearchBarPrimitives.tsx`, `Pagination.tsx`, `MediaUploadStep.tsx` — `hover:bg-[#F5F0E8]`
- `src/components/features/upload/MetadataSuggestionPanel.tsx` — `bg-[#fafaf8]`
- `src/pages/ChatbotPage.tsx` — `to-[#FFF1F3]` (duy nhất vùng hồng)

### 3.2 Khuyến nghị token mới (Tailwind `extend.colors`)

```js
surface: {
  panel: "#FFFCF5",      // đã có
  hover: "#F5F0E8",      // thay mọi hover:bg-[#F5F0E8]
  muted: "#FAFAF8",      // metadata / read-only panel
  accent: "#FFF8EA",     // modal header gradient start
},
```

Utility đề xuất trong `index.css`:

```css
.vt-surface-hover { @apply hover:bg-surface-hover; }
.vt-modal-header { @apply bg-gradient-to-b from-surface-accent to-cream-50/80 border-b border-secondary-200/80; }
```

---

## 4. P0 — `amber-*` vs `secondary-*` (cảnh báo / advisory)

Design system quy ước **vàng = `secondary-*`**. Thực tế ~**50 file** dùng **`amber-*`** của Tailwind default cho:

- Phản hồi kiểm duyệt (`ContributorReviewFeedbackBanner`, `ContributionsDetailModal`)
- AI advisory (`AIAnalysisSummaryCard`, `DeclaredDetectedInstrumentPanel`, `MetadataStepSection`)
- Compare researcher (`CompareResultStep`, `ResearcherPortalCompareTab`)
- Admin / chatbot flags

**Vì sao lệch:** `amber-500` (#f59e0b) trùng số với `secondary-500` nhưng scale `amber-50/100/200/800` **khác hue** so với `secondary-50/100/…` đã custom trong config → border/text warning không khớp tab active `ring-secondary-300` hay badge `.badge-warning` (dùng `secondary-100`).

**Pattern đang lặp (nên gom 1 component):**

```tsx
// Xuất hiện 10+ lần, copy-paste
className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-cream-50/50 ..."
```

**Khuyến nghị:**

1. Tạo `AlertBanner` / `AdvisoryPanel` variant=`warning` dùng **`secondary-*` + `cream-*`**, không `amber-*`.
2. Hoặc alias trong Tailwind: `warning: theme('colors.secondary')` nếu muốn tên semantic.

---

## 5. P1 — Biểu đồ & đồ thị (off-brand)

| File | Hard-code | Brand gần đúng |
|---|---|---|
| `ContentAnalyticsPanel.tsx` | `#4F46E5` (indigo), `#16A34A`, `#7C3AED` | `primary-600`, `secondary-600`, `primary-400` |
| `CoverageGapChart.tsx` | `#4F46E5`, `#FB7185` | `primary-600`, `primary-300` |
| `MonthlyTrendChart.tsx` | `#16A34A` (green) | `secondary-600` hoặc token `chart.positive` |
| `KnowledgeGraphViewer.tsx` | `#2563eb` selection ring | `primary-600` |
| `graphViewerHelpers.ts` | `#d97706`, `#b91c1c`, `#7c3aed`… | Map node type → `primary` / `secondary` scale |
| `brandColors.ts` (guest player) | `#1D4ED8` blue | Guest mode OK nếu document; nên tách `brandColors.guest` vs `brandColors.default` |

**Khuyến nghị:** `src/config/chartTheme.ts` export palette đọc từ Tailwind theme (hoặc duplicate hex từ `tailwind.config.js` một lần).

---

## 6. P1 — Semantic state colors

### 6.1 Badge / trạng thái

| Nguồn | Success | Warning | Danger | Info |
|---|---|---|---|---|
| `index.css` `.badge-*` | `green-100/800` | **`secondary-100/800`** | **`primary-100/800`** | — |
| `Badge.tsx` | `green-*` | **`yellow-*`** | **`red-*`** | **`blue-*`** |
| Moderation checklist | `green-*` inline | — | — | — |

→ Cùng “warning” có thể là vàng brand, vàng Tailwind (`yellow`), hoặc `amber`.

### 6.2 Button danger

- `Button.tsx` variant `danger`: `from-red-600 to-red-700` (Tailwind red)
- Brand danger nên là `primary-600/700` (đỏ VietTune `#be1e16`)

### 6.3 Scrollbar

- `index.css`: `#7f1d1d`, `#6b1818`, `#9b2c2c` — gần `primary-800/700` nhưng **hard-code**, không đổi khi retheme.

---

## 7. P1 — `bg-white` vs override global

`index.css`:

```css
.bg-white {
  background-color: #fff2d6 !important;
}
```

Hệ quả:

- Component dùng `bg-white` / `from-white` **nghĩ** là panel trắng → thực tế nền kem (`#fff2d6`).
- Một số chỗ dùng `bg-white/80`, `bg-surface-panel` (`#FFFCF5`) → **3 tầng sáng khác nhau** trên cùng viewport (Researcher portal, Compare, Contributions modal).

**Ví dụ lệch:**

- `ResearcherRecordingList`: `bg-white/70` + `backdrop-blur`
- `CompareResultStep`: `bg-white/80` trên nền `amber-50`
- `ContributionsDetailModal`: `bg-white/90` footer buttons

**Khuyến nghị:**

1. Bỏ override `.bg-white` !important; thay bằng token rõ: `bg-surface-panel`, `bg-cream-100`.
2. Nếu cần “trắng thật”: `bg-surface-panel` hoặc thêm `surface.elevated: #FFFFFF` dùng có chủ đích.

---

## 8. P2 — Button & CTA không một hệ

| Cách làm | Đặc điểm | Ví dụ |
|---|---|---|
| `.btn-vt-primary` (CSS) | `rounded-full`, scale nhẹ | `index.css` — **0 usage TSX** |
| `Button.tsx` | `rounded-full`, **`hover:scale-110`**, gradient mạnh | ~20 import |
| Inline Tailwind | `rounded-xl`, shadow khác nhau | Admin, Upload, Researcher |

**Hệ quả:** Trang Upload / Explore / Admin có nút cùng vai trò nhưng hover scale, shadow, radius khác nhau.

**Khuyến nghị:**

1. Chọn **một** nguồn: mở rộng `Button.tsx` variants `vtPrimary | vtOutline | vtGhost` map từ `.btn-vt-*`.
2. Deprecate `.btn-vt-*` hoặc ngược lại — không giữ song song.

---

## 9. P2 — Bo góc & shadow (layout rhythm)

Quan sát grep `rounded-*` — không có quy  tắc rõ trong code:

| Thành phần | Thường gặp | Nên chuẩn hóa |
|---|---|---|
| Card / section | `rounded-2xl` | `rounded-2xl` (container) |
| Input / dropdown | `rounded-lg` / `rounded-xl` | `rounded-xl` |
| Primary CTA | `rounded-full` | `rounded-full` |
| Alert nhỏ | `rounded-xl` | `rounded-xl` |
| Pagination item | `rounded-full` | OK |

Shadow: mix `shadow-sm`, `shadow-md`, `shadow-xl`, và arbitrary `shadow-[0_4px_6px...]` trong `Pagination.tsx` — nên 2–3 level token: `shadow-vt-sm | md | lg`.

---

## 10. P2 — Inline `style={{ backgroundColor / borderColor }}`

| File | Style | Thay bằng |
|---|---|---|
| `KnowledgeBasePanel.tsx` | `backgroundColor: '#FFF7E6'` | `bg-cream-50` |
| `ResearcherPortalQATab.tsx` | `borderColor: 'rgba(251, 191, 36, 0.6)'` | `border-secondary-300/60` |
| Nhiều modal | `animation: 'fadeIn'/'slideUp'` | `@layer utilities` hoặc Tailwind `animate-*` đã có `@keyframes` trong CSS |

Animation inline **không sai màu** nhưng duplicate logic đã có trong `index.css`.

---

## 11. Ma trận ưu tiên sửa

### Phase 1 — Token hóa nền (1–2 ngày, impact cao)

- [x] Thêm `surface.hover`, `surface.muted`, `surface.accent` vào `tailwind.config.js`
- [x] Thay toàn bộ `bg-[#FFF2D6]`, `hover:bg-[#F5F0E8]`, `bg-[#fafaf8]`, `from-[#FFF8EA]`
- [x] Sửa `ChatbotPage` bỏ `#FFF1F3` → `to-cream-50` hoặc `to-primary-50/30`
- [ ] Gỡ hoặc thay thế override `.bg-white` *(giữ nguyên theo quyết định scope)*

### Phase 2 — Warning / advisory thống nhất (1 ngày)

- [ ] Component `AdvisoryBanner` (secondary + cream)
- [ ] Migrate `amber-*` → `secondary-*` ở Contributor + Moderation + Compare
- [ ] Thống nhất `Badge.tsx` với `.badge-*` (warning = secondary, danger = primary)

### Phase 3 — Chart & graph theme (0.5 ngày)

- [ ] `chartTheme.ts` + refactor Recharts props
- [ ] `KnowledgeGraphViewer` selection `#2563eb` → `primary-600`

### Phase 4 — Button system (1 ngày)

- [ ] Consolidate `Button.tsx` ↔ `.btn-vt-*`
- [ ] Lint rule / grep CI: cấm `bg-[#` và `amber-` trong `src/components` (optional)

---

## 12. Checklist review nhanh cho PR UI

- [ ] Không có hex mới trong TSX (`#[0-9A-Fa-f]{3,8}`) — dùng token Tailwind
- [ ] Cảnh báo / pending / advisory → `secondary-*` hoặc `AdvisoryBanner`, không `amber-*`
- [ ] Panel nền → `bg-surface-panel` hoặc `bg-cream-*`, không `bg-white` trừ khi có `surface.elevated`
- [ ] CTA → `Button` component hoặc `.btn-vt-*`, không copy gradient inline
- [ ] Chart màu → import từ `chartTheme.ts`
- [ ] Danger / reject → `primary-*`, không `red-*` generic

---

## 13. Phụ lục — File cần rà soát trước (top impact)

**Nền / hover hex:**  
`MainLayout.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `ConfirmAccountPage.tsx`, `SearchBar.tsx`, `SearchBarPrimitives.tsx`, `Pagination.tsx`, `MediaUploadStep.tsx`, `MetadataStepSection.tsx`, `MetadataSuggestionPanel.tsx`, `ModerationModals.tsx`, `StageTransitionConfirmDialog.tsx`, `ChatbotPage.tsx`, `KnowledgeBasePanel.tsx`

**Amber advisory (gom component):**  
`ContributorReviewFeedbackBanner.tsx`, `ContributionsDetailModal.tsx`, `CompareResultStep.tsx`, `AIAnalysisSummaryCard.tsx`, `DeclaredDetectedInstrumentPanel.tsx`, `MetadataStepSection.tsx`, `UploadMusic.tsx`

**Charts off-brand:**  
`ContentAnalyticsPanel.tsx`, `CoverageGapChart.tsx`, `MonthlyTrendChart.tsx`, `KnowledgeGraphViewer.tsx`, `graphViewerHelpers.ts`

**Design tokens nguồn:**  
`tailwind.config.js`, `src/index.css`, `src/config/brandColors.ts`

---

*Tài liệu này mô tả hiện trạng codebase tại `main` sau các fix Researcher filter & Contributor review feedback (2026-06-06).*
