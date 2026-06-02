# PLAN — Cultural Archive Governance & Operations Center (Admin Evolution)

| Field | Value |
|-------|--------|
| **Slug** | `admin-governance-center` |
| **Mode** | Planning only (no code in this deliverable) |
| **Audience** | SEP490 capstone / active codebase maintainers |
| **Constraints** | Incremental refactor; respect `docs/FE-CONTEXT.md`, `src/features/**`, existing design tokens |

---

## Phase −1 — Context check (resolved)

**Product:** VietTune — Vietnamese traditional music archive (Guest → Contributor → Expert → Researcher → Admin).

**Existing admin surface (verified in repo):**

- Routes: `/admin`, `/admin/create-expert`, `/admin/knowledge-base`, `/admin/master-data` (`AdminGuard`, standalone checks on create-expert).
- Dashboard steps: `users` | `analytics` | `aiMonitoring` | `moderation` (`AdminDashboard.tsx` ~546 lines — orchestration + dialogs + guide modal).
- Data hub: `useAdminDashboardData` (large hook — aggregates users, recordings, analytics slices, AI flags, KB counts, expert performance, etc.).
- Panels: `AdminUserManagement`, `AdminDashboardAnalyticsPanel`, `AdminDashboardAiMonitoringPanel`, `AdminDashboardModerationPanel`.
- Master data: `src/features/admin/master-data/**` (sidebar + table + dialogs).
- Cross-domain: moderation lives in `src/features/moderation/**`; KG in `src/features/knowledge-graph/**`; researcher in `src/features/researcher/**`; AI services in `src/services/*`.

**Assumptions (Socratic gate — defaults for this plan):**

1. Backend OpenAPI will evolve **incrementally**; FE may ship UI shells with feature flags where BE lags.
2. **No monorepo split** — admin stays inside current Vite app.
3. **Primary demo stakeholder** — academic jury + archive narrative (governance story > pixel-perfect enterprise chrome).

---

## Phase 0 — Socratic gate (questions → plan defaults)

| Question | Default for this plan |
|----------|------------------------|
| Single vs multi-tenant admin? | Single-tenant VietTune; future “org” is out of scope unless BE adds it. |
| Must admin embed KG viewer or deep-link? | **P1:** deep-link + lightweight “KG health” cards on admin; **P2:** optional embed. |
| Real-time ops (SignalR) for admin-only? | Reuse existing `notificationHub` patterns; **no** second hub until justified. |
| Replace stepper when? | **P1** introduce URL-synced `?section=`; **P2** add persistent **left admin sidebar** on `lg+` while keeping stepper chips on mobile OR merge into one nav component. |

---

# 1. CURRENT STATE ANALYSIS

## 1.1. Strengths (keep)

| Area | Why it works |
|------|----------------|
| **Route + guard model** | `AdminGuard` + `routeAccess` is consistent with rest of app; low surprise for contributors reading `FE-CONTEXT`. |
| **Feature folders** | `features/admin/master-data` already shows the right direction for domain-heavy admin. |
| **Design language** | Cream / primary red / secondary gold, `Card`, `rounded-2xl`, lucide icons — matches public + moderation; **do not** introduce a second admin theme. |
| **Operational realism** | Toasts that distinguish API success vs “UI-only override” (`users_overrides`) — honest UX for flaky demo backends. |
| **Separation of “pages” vs “widgets”** | `pages/admin/*` vs `components/admin/*` is learnable. |

## 1.2. UX limitations (evolve)

| Issue | Symptom | Impact |
|-------|---------|--------|
| **Wizard/stepper without URL** | `useState(step)` only | Refresh loses context; cannot share “admin analytics” link; browser Back confusing. |
| **Horizontal chip overload at scale** | 4 steps OK today; 7+ modules will wrap awkwardly on tablet. | Cognitive + motor load. |
| **`window.location` to master-data** | Hard navigation from dashboard | Loses SPA transitions; harder to preserve future global admin layout state. |
| **Single mega-hook** | `useAdminDashboardData` centralizes too many concerns | Hard to test, hard to lazy-load panels, risk of unnecessary refetch on unrelated UI toggles. |
| **Moderation vs Admin duplication** | Expert sees moderation; Admin sees moderation governance — boundaries blur in UI copy | Risk of building two parallel queues without explicit “governance lens”. |

## 1.3. Scalability issues

- **AdminDashboard.tsx** acts as layout + router + modal host + mutation handlers — **scaling limit reached** for new “operations” modules without decomposition.
- **Analytics + AI + Moderation** will each want **different refresh cadences** (polling vs on-demand); one hook refresh pattern may over-fetch.
- **Large tables** (users, recordings) need virtualized lists or server pagination contracts — current table may not hold 10k rows demo story.

## 1.4. Architecture bottlenecks

- **Orchestration in page file** instead of thin route shell + `features/admin/shell` coordinator.
- **Cross-feature imports** from admin page into many services — acceptable short-term; becomes tangled as “operations center” grows.
- **State split**: Zustand used globally but admin-specific optimistic overrides in `storageService` keys — needs a **documented invalidation map** when BE becomes source of truth.

## 1.5. Technical debt risks

- Divergence between **demo persistence** (`users_overrides`, `admin_deleted_user_ids`) and **production admin APIs** — risk of shipping UI that “lies” in prod.
- **Legacy panels** (`LegacyAdminPanelId`) inside moderation step — risk of permanent “legacy” pocket unless scheduled for removal or formal “advanced” fold.
- **AI monitoring** tied to aggregated metrics — if endpoints change, panel breaks silently without typed contracts.

## 1.6. What should **stay** / **evolve** / **not rewrite**

| Stay | Evolve | Do **not** rewrite |
|------|--------|---------------------|
| `AdminGuard`, `routeAccess` policy | `AdminDashboard` → thinner shell + URL state | Entire moderation feature module |
| VietTune Tailwind tokens & `Card`/`Button` patterns | `useAdminDashboardData` → split by domain sub-hooks or query modules | Researcher compare engine / graph internals |
| Route namespace `/admin/*` | Navigation model (add sidebar on large screens) | `openapi-fetch` client architecture |
| Master-data feature module layout | Copy: rename steps to “governance” language without changing role enums | Auth store / storage hydration |

---

# 2. TARGET ADMIN VISION

## 2.1. Philosophy

**Cultural Archive Governance & Operations Center** = a **single accountable surface** where an administrator can:

1. **See** integrity and health of the archive (content, taxonomy, AI, graph).
2. **Act** on policy exceptions (users, moderation escalations, master data).
3. **Observe** AI-assisted pipelines without mystifying them (“what ran, on what, with what outcome”).
4. **Coordinate** with Expert/Researcher workflows **by reference** (deep links, status), not by duplicating their entire UIs.

Tone: **governance** (accountability, auditability) + **operations** (throughput, incidents) — avoid generic “SaaS admin” blank dashboards.

## 2.2. Governance direction

- **Policy:** who can publish, who can verify, what metadata is mandatory, what AI suggestions are allowed to auto-apply (future).
- **Provenance:** link AI outputs to model/version/run id when BE supports it (FE prepares placeholders).
- **Taxonomy integrity:** master data changes propagate visibly to Explore/Search filters (already partially true via ref data).

## 2.3. Operational responsibilities

| Ops pillar | Admin responsibility |
|------------|---------------------|
| **User governance** | Roles, activation, expert provisioning, deletion workflows |
| **Moderation governance** | Queue health, SLA-ish indicators, escalation, policy flags — *not* replacing Expert UI |
| **AI governance** | Flagged responses, embedding/monitoring cards, cost/usage if BE exposes |
| **Taxonomy / master data** | CRUD reference entities, usage warnings before delete |
| **KG governance** | Graph health, broken links, rebuild jobs (mostly BE; FE surfaces status) |
| **KB governance** | Publication pipeline, admin KB view already exists — unify language with “archive policy” |
| **Analytics** | Coverage, growth, contributor quality — already started |
| **System operations** | Feature flags, incident banners, dependency health (incremental) |

## 2.4. Relationship map (conceptual)

```text
                    ┌─────────────────┐
                    │  Admin Shell    │
                    │ (nav + overview)│
                    └────────┬────────┘
         ┌──────────┼──────────┬────────────┬──────────────┐
         ▼          ▼          ▼            ▼              ▼
    User Gov.   Mod. Gov.   AI Gov.   Taxonomy Gov.   Analytics
         │          │          │            │              │
         │          └────┬─────┘            │              │
         │               ▼                  │              │
         │      Expert Moderation UI       │              │
         │      (deep link, not fork)      │              │
         ▼               │                  ▼              ▼
    authStore      notificationHub    masterDataService  analyticsApi
```

**Rule:** Admin **orchestrates** and **governs**; Expert **executes** moderation tasks; Researcher **analyzes**; KG/KB **consume** governed taxonomy.

---

# 3. PHASED IMPLEMENTATION PLAN

## P0 — Foundation & honesty (low risk)

| Field | Content |
|-------|---------|
| **Objective** | Make admin navigable, shareable, and honest about demo vs prod data. |
| **User value** | Admins can bookmark sections; less confusion on refresh; fewer “silent wrong” states. |
| **Technical scope** | Add `section` (or `tab`) query param synced to dashboard step; `replace: true` updates optional; replace `window.location` master-data with `useNavigate` / `<Link>`. |
| **UI scope** | Same visual stepper + optional deep links from Header; no new theme. |
| **Backend dependency** | None mandatory. |
| **Risk** | Low |
| **Complexity** | **S** (1–2 dev days) |
| **FE status** | Đã triển khai: query `?section=` đồng bộ stepper + nút Master Data dùng `navigate()` (SPA). |

## P1 — Shell v1: “Operations rail” + overview (medium risk)

| Field | Content |
|-------|---------|
| **Objective** | Introduce **persistent admin navigation** on desktop without removing mobile-friendly patterns. |
| **User value** | Faster cross-module jumps; mental model shifts from “wizard” to “control center”. |
| **Technical scope** | New thin layout component under `src/features/admin/shell/` (or `components/admin/AdminShell.tsx`) wrapping `Outlet` for child routes **or** wrapping dashboard only if routes stay flat — prefer **layout route** under `/admin` with nested routes later. Start with **dashboard-only shell** to avoid router surgery: two-column `lg+` layout: left rail (icons + labels), right content = existing panels. |
| **UI scope** | Wireframe: `lg+` — `[ Rail ~15rem | Main flex-1 ]` + dải **Tóm tắt nhanh** (thẻ số liệu); `<lg` — giữ stepper chip ngang + footer Quay lại/Tiếp theo (**không** thêm drawer hamburger trong scope hiện tại). |
| **Backend dependency** | Optional: lightweight `/api/health` or reuse existing analytics ping for “system status” card. |
| **Risk** | Medium (layout regressions on MainLayout padding) |
| **Complexity** | **M** (3–5 dev days) |
| **FE status** | **Đã giao phần desktop:** `src/features/admin/shell/` (`adminNavConfig`, `AdminDashboardRail`, `AdminOverviewStrip`) + `AdminDashboard` grid `lg+`, ẩn stepper/footer trên `lg+`. Mobile/tablet **không đổi** UX (theo yêu cầu). Chưa làm: nested layout route `/admin/...`, drawer «More sections». |

## P2 — Domain modules & governance lenses (medium–high)

| Field | Content |
|-------|---------|
| **Objective** | Split **governance** views from **raw operational** views; add KG/KB governance cards + deep links. |
| **User value** | Clear story for capstone + research: “integrity control center”. |
| **Technical scope** | Extract dashboard sections into `features/admin/dashboard/` submodules (`usersPanel`, `analyticsPanel`, …) **re-exporting** existing components first (move file later). Introduce `features/admin/governance/` for cross-cutting types + `useAdminSectionQuery` hooks. Add **feature flags** (`import.meta.env` or small config) to hide unfinished BE. |
| **UI scope** | Overview dashboard: 2-row grid of **cards** (health, incidents, queue depth proxy, master-data pending). Each card navigates to section. |
| **Backend dependency** | New read-only endpoints ideal; can mock with existing `analyticsApi` + `adminApi` until ready. |
| **Risk** | Medium–high (scope creep) |
| **Complexity** | **L** (1–2 weeks calendar time part-time) |
| **FE status** | **Một phần (slice đầu):** `src/features/admin/governance/` (`adminGovernanceTargets`, `AdminGovernanceStrip`) — dải thẻ liên kết desktop (`hidden lg:block`) dưới `AdminOverviewStrip`; `src/features/admin/dashboard/AdminDashboardPanels.tsx` gom chọn panel theo `step` (component panel vẫn trong `components/admin/*`). Chưa: feature flags, `useAdminSectionQuery`, lưới overview 2 hàng đầy đủ, nested layout route `/admin` + `Outlet`. |

## P3 — AI governance & system operations (higher, flag-gated)

| Field | Content |
|-------|---------|
| **Objective** | Formalize **AI run logs**, **model version**, **rollback** affordances; system ops page. |
| **User value** | Trust + audit for AI-in-archive narrative. |
| **Technical scope** | New route `/admin/operations` or section; integrate with `semanticSearchService` / AI admin endpoints when available; respect circuit-breaker messaging already used in explore. |
| **UI scope** | Timeline/table of incidents; detail drawer; never block main layout on heavy graph — **link out** to researcher KG for heavy viz. |
| **Backend dependency** | **High** — needs contract for AI job logs, permissions. |
| **Risk** | High without BE |
| **Complexity** | **L–XL** (multi-sprint) |
| **FE status** | **Slice P3 (flag):** route `/admin/operations` (`AdminOperationsPage`); cờ `VITE_ADMIN_OPERATIONS_PAGE=true` \| `1` bật CTA trên `AdminDashboard` + mục rail «Vận hành & AI»; hiển thị trạng thái circuit semantic (`getSemanticSearchCircuitBreakerState`), placeholder bảng nhật ký job, nút «Sao chép chẩn đoán»; khi cờ tắt, vào URL vẫn thấy hướng dẫn bật cờ. Chưa: API logs/model version/rollback, drawer chi tiết incident, SignalR maintenance. |

## P4 — Wayfinding & refresh honesty (low risk)

| Field | Content |
|-------|---------|
| **Objective** | Chuẩn hoá **breadcrumb** trên các trang con `/admin/*` và hiển thị **thời điểm cập nhật gần nhất** trên dashboard (minh bạch polling ~30s). |
| **User value** | Admin luôn biết đang ở đâu trong cây Quản trị; giảm hiểu nhầm “dữ liệu vừa mới 100%”. |
| **Technical scope** | `buildAdminBreadcrumbItems` + `AdminBreadcrumbs`; `lastDashboardRefreshAt` trong `useAdminDashboardData` (set sau `load`); slot `breadcrumbSlot` trên `KnowledgeBasePanel`. **Không** bắt buộc nested layout `/admin` + `Outlet` trong slice này. |
| **UI scope** | Một dải breadcrumb đầu trang (desktop/mobile); dòng chú thích “Dữ liệu tổng hợp cập nhật …” trên `AdminDashboard` khi đã có ít nhất một lần tải. |
| **Backend dependency** | None. |
| **Risk** | Low |
| **Complexity** | **S** |
| **FE status** | **Đã triển khai (slice):** `adminBreadcrumbUtils.ts`, `AdminBreadcrumbs.tsx`; gắn vào `AdminDashboard`, `MasterDataPage`, `KnowledgeBasePage` (qua `breadcrumbSlot`), `CreateExpertPage`, `AdminOperationsPage`; `lastDashboardRefreshAt` trả về từ `useAdminDashboardData`. |

---

# 4. UI/UX EVOLUTION PLAN

## 4.1. Stepper: remain or replace?

| Stage | Recommendation |
|-------|------------------|
| **Short term (P0–P1)** | **Keep** stepper chips — users already learned them; add URL sync. |
| **Medium (P1–P2)** | **Add left rail** on `lg+` as *primary* nav; stepper becomes **secondary** or collapses to “Section” title on mobile. |
| **Long** | Stepper optional; rail + overview is canonical. |

**Avoid:** sudden removal of stepper without replacement — breaks muscle memory for demo.

## 4.2. Responsive strategy

- **`<lg`:** drawer/rail for sections; preserve touch targets ≥44px (already pattern in app).
- **`lg+`:** fixed admin rail inside content max-width (`max-w-7xl` consistent with dashboard).
- **Tables:** horizontal scroll **plus** column priority (hide low-value columns < `md`).

## 4.3. Information hierarchy

1. **Overview** (new): “Archive health at a glance” — 4–6 cards, no dense charts first paint.
2. **Governance modules** — existing four + future ops.
3. **Deep workspaces** — master-data, KB, create-expert stay as **focused pages** (full width) linked from rail.

## 4.4. Dashboard overview strategy

- **KPI strip** (text + sparkline optional) — reuse `AdminStatsCards` patterns if present; else add small stat component in `components/admin/primitives/`.
- **Incident / attention queue** — aggregate counts already computed in `useAdminDashboardData` where possible.

## 4.5. Wireframe-like layouts

**A. Desktop post-P1**

```text
+----------------------------------------------------------------+
| Header (global)                                                |
+----------------------------------------------------------------+
| Back | Title "Governance & Operations" | Quick links (KB, MD) |
+--------+-------------------------------------------------------+
| Rail   |  Overview row (cards)                                 |
| - Ovr  |  ---------------------------------------------------  |
| - Users|  Active section content (e.g. Users table)           |
| - Anly |                                                       |
| - AI   |                                                       |
| - Mod  |                                                       |
| - Ops* |                                                       |
+--------+-------------------------------------------------------+
```

**B. Mobile**

```text
[ Title.................................... [≡ Menu] ]
[ Chip stepper row scrolls horizontally        ]
[ Content card                                  ]
[ Sticky bottom optional: primary action        ]
```

## 4.6. Operational UX improvements

- **Breadcrumbs** inside admin: `Admin > Master Data > Instruments` (use `react-router` nested routes when ready).
- **Last refreshed** timestamp near analytics (ties to polling honesty).
- **Dangerous actions** — keep `ConfirmationDialog`; add typed reason field only if BE requires (P2+).

---

# 5. FEATURE BREAKDOWN (A–I)

For each: **purpose · UI · hooks · services · API · state · loading/error · realtime**

---

## A. Dashboard Overview (new; P1–P2)

| Aspect | Plan |
|--------|------|
| **Purpose** | Single entry summarizing governance + ops attention items. |
| **UI components** | `AdminOverviewGrid` (new, thin), `AdminAttentionCard`, reuse `Card`, icons lucide. |
| **Hooks** | `useAdminOverviewMetrics` — thin selector over existing `useAdminDashboardData` outputs **or** split data hook first. |
| **Services** | Reuse `adminApi`, `analyticsApi`, `recordingService` read-only. |
| **API requirements** | Prefer one aggregated “admin summary” endpoint later; until then **compose** existing calls with `Promise.allSettled`. |
| **State** | URL `?section=overview` or default route `/admin` shows overview + optional `?highlight=ai`. |
| **Loading/error** | Skeleton cards; partial failure per card (one red border) without failing whole page. |
| **Realtime** | Optional: subscribe to notification types affecting counts; else manual refresh button. |

---

## B. User Governance (existing → hardened)

| Aspect | Plan |
|--------|------|
| **Purpose** | Role assignment, activation, expert lifecycle alignment. |
| **UI** | Keep `AdminUserManagement`; extract row subcomponents if table grows (`AdminUserTableRow`, `AdminRoleCell`). |
| **Hooks** | Move user list fetching to `useAdminUsersQuery` inside `features/admin/users/`. |
| **Services** | `adminApi` (+ documented `users_overrides` fallback). |
| **API** | `/api/User/GetAll` and real role update endpoints — align OpenAPI when BE stabilizes. |
| **State** | Local component state + Zustand only if cross-page user cache needed — **default: avoid** new global store. |
| **Loading/error** | Keep red API banner; add “Retry” button. |
| **Realtime** | Optional: SignalR on role change — low priority. |

---

## C. Moderation Governance (lens, not duplicate queue)

| Aspect | Plan |
|--------|------|
| **Purpose** | SLA-ish view, backlog size, escalation — **deep link** to `ModerationPage` for work. |
| **UI** | Refine `AdminDashboardModerationPanel` into **summary + links**; move dense tables to collapsible “Advanced”. |
| **Hooks** | `useModerationGovernanceStats` wrapping existing submission/moderation APIs read-only. |
| **Services** | `expertModerationApi` / `submissionService` (read-only list counts). |
| **API** | Needs count-by-status endpoint ideally; interim: client aggregate with capped fetch + warning. |
| **State** | Panel-local; cache TTL 60s. |
| **Loading/error** | Shimmer + “partial data” footnote if capped. |
| **Realtime** | Reuse notification counts as proxy for “new submissions”. |

---

## D. AI Governance (extend current AI panel)

| Aspect | Plan |
|--------|------|
| **Purpose** | Visibility into AI-assisted pipelines: moderation AI, upload suggestions, semantic search health. |
| **UI** | `AdminDashboardAiMonitoringPanel` split: **(1) Quality metrics**, **(2) Safety/flags**, **(3) Embeddings/monitoring** (existing copy about 384/768). |
| **Hooks** | `useAiGovernanceMetrics` from panel-local state extraction. |
| **Services** | `qaMessageService` (flagged), `semanticSearchService` (health/circuit), `metadataSuggestService` usage if exposed. |
| **API** | Flagged conversations endpoints; semantic health; future “model registry”. |
| **State** | Panel + optional Zustand **only** if shared AI banner across admin — default no. |
| **Loading/error** | Circuit-breaker messaging parity with Explore semantic errors. |
| **Realtime** | Low priority unless admin-specific AI events exist. |

---

## E. Master Data Governance (existing module)

| Aspect | Plan |
|--------|------|
| **Purpose** | Taxonomy integrity + safe deletes. |
| **UI** | Keep `MasterDataPage` composition; add breadcrumb when admin shell arrives. |
| **Hooks** | Existing `useMasterDataEntity`, `useEntitySearch`. |
| **Services** | `masterDataService`, `referenceDataService` invalidation (`viettune:refdata-updated` already exists). |
| **API** | Current CRUD + usage check — document in plan when adding new entity kinds. |
| **State** | Local + URL page for table pagination (future). |
| **Loading/error** | Already has skeleton/error components — reuse as **primitive templates** for other admin tables. |
| **Realtime** | Emit refdata update event after successful mutation (if not already). |

---

## F. Knowledge Graph Governance (thin admin layer)

| Aspect | Plan |
|--------|------|
| **Purpose** | Integrity signals: stale graph, last rebuild, node/edge counts. |
| **UI** | Card with metrics + `Link` to researcher graph tab or public KG explore — **no** full force-graph in admin P1. |
| **Hooks** | `useKgGovernanceSummary` reading `knowledgeGraphService` overview/stats if available. |
| **Services** | `knowledgeGraphService`. |
| **API** | Read-only stats endpoints; tolerate 404 with graceful empty state. |
| **State** | Card-local. |
| **Loading/error** | Inline spinner in card; never block dashboard. |
| **Realtime** | None initially. |

---

## G. Knowledge Base Governance (existing page)

| Aspect | Plan |
|--------|------|
| **Purpose** | Editorial control, publication standards. |
| **UI** | `KnowledgeBasePanel` — add admin-specific header slot when `listBackTo="/admin"`. |
| **Hooks** | Reuse KB hooks inside feature. |
| **Services** | `knowledgeBaseApi`. |
| **API** | As per KB module. |
| **State** | Existing; preserve `openCreateOnMount` location state pattern. |
| **Loading/error** | Follow KB patterns. |
| **Realtime** | Optional noti on KB publish if BE sends events. |

---

## H. Analytics (existing panel → modular charts)

| Aspect | Plan |
|--------|------|
| **Purpose** | Coverage + growth + contributor quality. |
| **UI** | `AdminDashboardAnalyticsPanel` — ensure chart components lazy-loaded (`React.lazy` per heavy chart if recharts large). |
| **Hooks** | `useAdminAnalyticsSeries` for monthly counts. |
| **Services** | `analyticsApi`. |
| **API** | Align with OpenAPI; add caching headers consumer side. |
| **State** | Panel-local + derived memoization for expensive transforms. |
| **Loading/error** | Progressive reveal per chart. |
| **Realtime** | Not required. |

---

## I. System Operations (new; P2–P3)

| Aspect | Plan |
|--------|------|
| **Purpose** | Feature flags, maintenance mode banner, dependency status. |
| **UI** | Simple table + toggles (dev-only guard) + “Copy diagnostics” button. |
| **Hooks** | `useSystemOpsFlags` (env-based first). |
| **Services** | Optional new `adminOpsService`. |
| **API** | Future admin config endpoint; until then read-only FE flags. |
| **State** | Local + **never** persist dangerous flags without BE authz. |
| **Loading/error** | N/A minimal. |
| **Realtime** | Optional broadcast for maintenance — use existing SignalR infra if message type appears. |

---

# 6. FOLDER STRUCTURE PLAN (incremental)

**Recommended future shape (additive):**

```text
src/features/admin/
  shell/
    AdminLayout.tsx          # P1: rail + outlet for dashboard sections (start narrow)
    adminNavConfig.ts        # single source of truth for section ids, paths, icons
  dashboard/
    overview/
      AdminOverviewPage.tsx  # P2: optional route or section
    sections/                # P1–P2: thin wrappers re-exporting components/admin/*
      UsersSection.tsx
      AnalyticsSection.tsx
      AiSection.tsx
      ModerationSection.tsx
  users/
    hooks/useAdminUsersQuery.ts
  governance/
    types.ts                  # shared types: AttentionItem, HealthStatus
  master-data/                # EXISTING — keep as-is
  hooks/
    useAdminDashboardData.ts  # EXISTING — shrink over time; do not delete abruptly
```

**`src/components/admin/`**

- Keep presentational panels; **move logic out** gradually into `features/admin/**/hooks`.
- Add **`components/admin/primitives/`** only if 3+ duplicates emerge (stat tile, section header) — **do not** create prematurely.

**`src/pages/admin/`**

- Remain route entrypoints; should trend toward **5–15 lines** each: compose shell + section.

**Untouched (initially)**

- `src/features/moderation/**` (except new read-only hooks *calling into* it if needed).
- `src/features/knowledge-graph/**` (admin consumes summaries only).
- `src/features/researcher/**`

---

# 7. COMPONENT DECOMPOSITION PLAN

## 7.1. Oversized / high-responsibility

| File | Issue | Action |
|------|-------|--------|
| `AdminDashboard.tsx` (~546 LOC) | layout + stepper + 3 dialogs + guide modal + handlers | **P0:** extract `AdminGuideModal`, `AdminDashboardDialogs`, `useAdminDashboardActions` hook file colocated under `features/admin/dashboard/`. |
| `useAdminDashboardData.ts` (~22KB) | god hook | **P1:** split into `useAdminUsersAggregate`, `useAdminRecordingsSnapshot`, `useAdminAnalyticsBundle` composed in barrel hook for backward compatibility. |
| `AdminDashboardModerationPanel` | risk mixing governance + legacy tools | **P2:** split **Summary** vs **LegacyTools** folders. |
| `AdminDashboardAiMonitoringPanel` | mixed concerns | **P1:** subcomponents per concern (`AiQualityCard`, `AiSafetyCard`, `EmbeddingStatusCard`). |

## 7.2. Reusable admin primitives (only when duplicated 3×)

- `AdminSectionHeader` (icon + title + description + actions slot).
- `AdminMetricTile` (label, value, delta, state).
- `AdminAttentionList` (items with severity dot).

---

# 8. DATA FLOW & STATE PLAN

## 8.1. Zustand

- **Continue** using `useAuthStore` for identity; **avoid** new global admin store until cross-route stale cache proven.
- If admin needs shared refresh ticker: **minimal** `useAdminUiStore` { lastRefreshAt, triggerRefresh } — optional P2.

## 8.2. Server state strategy

- Prefer **hook-local fetch + AbortController** (matches `useExploreData` pattern).
- For repeated reads: introduce **lightweight cache** module `features/admin/cache/adminQueryCache.ts` with TTL per key — *simple object + timestamps*, not React Query unless team already adopts it repo-wide (**do not** add RQ in P0 without decision record).

## 8.3. Polling vs realtime

- **Polling** for analytics charts (60–120s) with visible “last updated”.
- **Realtime** only via existing `notificationHub` for user-notifiable events; admin-specific broadcasts deferred.

## 8.4. Optimistic updates

- Keep current pattern but **centralize** override writes in one module `adminLocalOverrides.ts` with documented semantics + migration path to remove for production.

## 8.5. Cache invalidation

- On successful master-data mutation: dispatch `viettune:refdata-updated` (already pattern).
- On user role change success: invalidate `users` slice + refetch table.

## 8.6. Failure handling

- Card-level failure boundaries (partial UI alive) for overview.
- Continue `uiToast` + `notifyLine` conventions.

---

# 9. PERFORMANCE & SCALABILITY

| Risk | Mitigation |
|------|------------|
| Recharts heavy bundles | `React.lazy` chart islands; avoid rendering all charts in overview simultaneously. |
| Large user table | Virtualize (`@tanstack/react-virtual` already in stack) when >200 rows **or** server pagination. |
| KG force graph | **Never** mount in admin overview; link out. |
| WebSocket load | Do not subscribe admin to high-frequency streams by default. |
| `useAdminDashboardData` refetch storms | Split hooks + `requestId` guard pattern (already used elsewhere) when parallel fetches added. |

---

# 10. DESIGN SYSTEM ALIGNMENT

- **Colors/radius/shadows:** follow `tailwind.config.js` tokens documented in `FE-CONTEXT` §15.
- **Governance feel:** slightly more **structured density** (tighter tables, clearer section headers) but **same** cream panels — avoid cold gray “enterprise” neutral dashboards.
- **Consistency hooks:** reuse `UploadMusic`-like stepper/footer language for transitional period only; converge wording to “Trung tâm vận hành & quản trị” in titles while keeping code identifiers in English.
- **Moderation / Researcher parity:** use same `Card`/`ConfirmationDialog`/`LoadingSpinner` components.

---

# 11. DEMO PRIORITY PLAN (SEP490)

## MUST HAVE (P0 + slice of P1)

1. **URL-synced admin sections** — demo-safe sharing during defense.
2. **Overview row (even 3 static cards)** — visual “control center” story.
3. **Replace hard navigation** to master-data with in-app navigation.
4. **One governance sentence** in UI copy tying AI + moderation + taxonomy (no new backend).

## SHOULD HAVE (P1)

5. **Desktop admin rail** + mobile drawer.
6. **Moderation governance summary** with deep link to Expert queue.
7. **Split `AdminDashboard.tsx` into 2–3 files** for readable demo walkthrough in code review.

## OPTIONAL (P2–P3)

8. Full `/admin/operations` page with real flags.
9. KG governance embed beyond summary card.
10. React Query adoption (only if team standardizes).

---

# 12. FINAL RECOMMENDATION

## Architecture direction

**Thin routes + feature-owned hooks + composable shell** — evolve the admin area like a **product module** inside the existing app, not a forked “admin app”.

## Governance philosophy

**Transparency over automation mystique:** every AI or moderation metric shown in admin should answer: *what*, *when*, *who*, *next action*.

## Anti-patterns to avoid

- Rewriting moderation queue inside admin.
- Introducing a parallel design system or CSS framework.
- Micro-folders per component (`AdminUserTableRowTitleText`) without duplication pressure.
- Unchecked optimistic persistence that contradicts BE in production demos without labeling.

## Long-term scalability

- Move toward **nested admin routes** (`/admin/users`, `/admin/analytics`, …) sharing one shell layout — **after** URL params prove stable.
- Prepare for **audit log** surface (FE placeholders) once BE exposes events.

---

## Verification checklist (for implementers)

- [ ] No new global state without ADR note.
- [ ] All new admin strings Vietnamese (consistent with app).
- [ ] `npm run build` passes; no new eslint restricted-import violations.
- [ ] `docs/FE-CONTEXT.md` routing table updated when new `/admin/*` routes ship.
- [ ] `docs/UI-UX-admin.md` updated when shell navigation lands.
- [ ] Demo script updated: 90-second walkthrough hits Overview → Users → Master Data → KB.

---

## Agent assignments (suggested)

| Agent / role | Workstream |
|--------------|------------|
| **Frontend owner** | P0 URL sync + navigation fix + overview skeleton. |
| **UX copy (Vi)** | Rename surfaces to governance language without confusing Expert users. |
| **Backend liaison** | Contract for summary metrics + moderation counts + AI logs (staggered). |
| **QA** | Playwright smoke: admin can open each section + master-data link + KB back link. |

---

**[OK] Plan created:** `docs/PLAN-admin-governance-center.md`

**Next steps:**

- Review the plan and adjust phases to your sprint capacity.
- Run `/create` (or equivalent implementation workflow) when ready to implement P0.
- Or edit this plan manually and keep `FE-CONTEXT` / `UI-UX-admin` in sync as deliverables land.
