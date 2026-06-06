import type { AggregatedUser, UserAccountStatus } from '@/features/admin/adminDashboardTypes';
import { normalizeSearchText, tokenizeSearchText } from '@/utils/searchText';

export type AdminUserFilterParams = {
  search: string;
  role: 'all' | string;
  status: 'all' | UserAccountStatus;
};

function userSearchHaystack(user: AggregatedUser): string {
  return normalizeSearchText([user.username, user.email ?? '', user.fullName ?? ''].join(' '));
}

function matchesSearch(user: AggregatedUser, search: string): boolean {
  const tokens = tokenizeSearchText(search);
  if (tokens.length === 0) return true;
  const hay = userSearchHaystack(user);
  return tokens.every((token) => hay.includes(token));
}

export function filterAdminUsers(
  users: AggregatedUser[],
  params: AdminUserFilterParams,
): AggregatedUser[] {
  return users.filter((user) => {
    if (params.role !== 'all' && user.role !== params.role) return false;
    if (params.status !== 'all' && user.status !== params.status) return false;
    if (!matchesSearch(user, params.search)) return false;
    return true;
  });
}

export function paginateAdminUsers<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; totalPages: number; safePage: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    safePage,
  };
}
