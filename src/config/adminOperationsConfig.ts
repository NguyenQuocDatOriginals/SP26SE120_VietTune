/**
 * P3 — System operations & AI governance shell (`/admin/operations`).
 * Bật bằng env để tránh scope creep / UI lạ khi BE chưa sẵn sàng.
 */
export function isAdminOperationsPageEnabled(): boolean {
  const raw = import.meta.env.VITE_ADMIN_OPERATIONS_PAGE;
  return raw === 'true' || raw === '1';
}
