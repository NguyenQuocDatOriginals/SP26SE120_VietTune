// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Phase 2 expert moderation: real queue + assign + approve/reject APIs
// [VI] Thực thi một bước trong luồng xử lý.
 * (see docs/PLAN-expert-workflow.md, docs/PLAN-expert-role-apis.md).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const EXPERT_API_PHASE2 =
// [VI] Thực thi một bước trong luồng xử lý.
  String(import.meta.env.VITE_EXPERT_API_PHASE2 || '').toLowerCase() === 'true';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ExpertQueueSource = 'by-status' | 'admin';

// [VI] Thực thi một bước trong luồng xử lý.
/** `by-status`: GET /Submission/get-by-status. `admin`: GET /Admin/submissions (needs role). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const EXPERT_QUEUE_SOURCE: ExpertQueueSource =
// [VI] Thực thi một bước trong luồng xử lý.
  String(import.meta.env.VITE_EXPERT_QUEUE_SOURCE || 'by-status').toLowerCase() === 'admin'
// [VI] Thực thi một bước trong luồng xử lý.
    ? 'admin'
// [VI] Thực thi một bước trong luồng xử lý.
    : 'by-status';

// [VI] Thực thi một bước trong luồng xử lý.
/** Dev helper: force mock queue instead of calling backend queue APIs. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const EXPERT_QUEUE_USE_MOCK =
// [VI] Thực thi một bước trong luồng xử lý.
  String(import.meta.env.VITE_EXPERT_QUEUE_USE_MOCK || '').toLowerCase() === 'true';
