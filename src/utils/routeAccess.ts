// [VI] Nhập (import) các phụ thuộc cho file.
import { User, UserRole } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type GuardDecisionReason = 'unauthenticated' | 'unauthorized' | 'inactive';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type GuardDecision =
// [VI] Thực thi một bước trong luồng xử lý.
  | { status: 'allow' }
// [VI] Thực thi một bước trong luồng xử lý.
  | { status: 'defer' }
// [VI] Thực thi một bước trong luồng xử lý.
  | {
// [VI] Thực thi một bước trong luồng xử lý.
      status: 'redirect';
// [VI] Thực thi một bước trong luồng xử lý.
      redirectTo: string;
// [VI] Thực thi một bước trong luồng xử lý.
      reason: GuardDecisionReason;
// [VI] Thực thi một bước trong luồng xử lý.
    };

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface RouteGuardPolicy {
// [VI] Thực thi một bước trong luồng xử lý.
  allowedRoles: UserRole[];
// [VI] Thực thi một bước trong luồng xử lý.
  unauthorizedRedirectTo: string;
// [VI] Thực thi một bước trong luồng xử lý.
  inactiveRedirectTo: string;
// [VI] Thực thi một bước trong luồng xử lý.
  requireActive?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const ADMIN_ROUTE_POLICY: RouteGuardPolicy = {
// [VI] Thực thi một bước trong luồng xử lý.
  allowedRoles: [UserRole.ADMIN],
// [VI] Thực thi một bước trong luồng xử lý.
  unauthorizedRedirectTo: '/403',
// [VI] Thực thi một bước trong luồng xử lý.
  inactiveRedirectTo: '/',
// [VI] Thực thi một bước trong luồng xử lý.
  requireActive: true,
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const RESEARCHER_ROUTE_POLICY: RouteGuardPolicy = {
// [VI] Thực thi một bước trong luồng xử lý.
  allowedRoles: [UserRole.RESEARCHER, UserRole.ADMIN],
// [VI] Thực thi một bước trong luồng xử lý.
  unauthorizedRedirectTo: '/403',
// [VI] Thực thi một bước trong luồng xử lý.
  inactiveRedirectTo: '/',
// [VI] Thực thi một bước trong luồng xử lý.
  requireActive: true,
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function buildLoginRedirectPath(pathname: string): string {
// [VI] Trả về kết quả từ hàm.
  return `/login?redirect=${encodeURIComponent(pathname)}`;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function isSafeInternalPath(path: string): boolean {
// [VI] Trả về kết quả từ hàm.
  return path.startsWith('/') && !path.startsWith('//');
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function resolveSafeRedirectTarget(
// [VI] Thực thi một bước trong luồng xử lý.
  currentPathname: string,
// [VI] Thực thi một bước trong luồng xử lý.
  candidateTarget: string,
// [VI] Thực thi một bước trong luồng xử lý.
): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (!isSafeInternalPath(candidateTarget)) return '/';
// [VI] Rẽ nhánh điều kiện (if).
  if (candidateTarget === currentPathname) return '/';
// [VI] Trả về kết quả từ hàm.
  return candidateTarget;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function evaluateGuardAccess(
// [VI] Thực thi một bước trong luồng xử lý.
  user: User | null,
// [VI] Thực thi một bước trong luồng xử lý.
  pathname: string,
// [VI] Thực thi một bước trong luồng xử lý.
  policy: RouteGuardPolicy,
// [VI] Thực thi một bước trong luồng xử lý.
  options?: { isAuthLoading?: boolean },
// [VI] Thực thi một bước trong luồng xử lý.
): GuardDecision {
// [VI] Rẽ nhánh điều kiện (if).
  if (options?.isAuthLoading) {
// [VI] Trả về kết quả từ hàm.
    return { status: 'defer' };
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Rẽ nhánh điều kiện (if).
  if (!user) {
// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      status: 'redirect',
// [VI] Thực thi một bước trong luồng xử lý.
      redirectTo: buildLoginRedirectPath(pathname),
// [VI] Thực thi một bước trong luồng xử lý.
      reason: 'unauthenticated',
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Rẽ nhánh điều kiện (if).
  if (policy.requireActive !== false && !user.isActive) {
// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      status: 'redirect',
// [VI] Thực thi một bước trong luồng xử lý.
      redirectTo: resolveSafeRedirectTarget(pathname, policy.inactiveRedirectTo),
// [VI] Thực thi một bước trong luồng xử lý.
      reason: 'inactive',
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Rẽ nhánh điều kiện (if).
  if (!policy.allowedRoles.includes(user.role)) {
// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      status: 'redirect',
// [VI] Thực thi một bước trong luồng xử lý.
      redirectTo: resolveSafeRedirectTarget(pathname, policy.unauthorizedRedirectTo),
// [VI] Thực thi một bước trong luồng xử lý.
      reason: 'unauthorized',
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Trả về kết quả từ hàm.
  return { status: 'allow' };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function isResearcherPendingApproval(user: User | null): boolean {
// [VI] Trả về kết quả từ hàm.
  return Boolean(user?.role === UserRole.RESEARCHER && !user?.isActive);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function getDefaultPostLoginPath(user: User): string {
// [VI] Rẽ nhánh theo nhiều trường hợp (switch).
  switch (user.role) {
// [VI] Một nhánh trong switch (case/default).
    case UserRole.ADMIN:
// [VI] Trả về kết quả từ hàm.
      return '/admin';
// [VI] Một nhánh trong switch (case/default).
    case UserRole.RESEARCHER:
// [VI] Trả về kết quả từ hàm.
      return '/researcher';
// [VI] Một nhánh trong switch (case/default).
    case UserRole.EXPERT:
// [VI] Trả về kết quả từ hàm.
      return '/moderation';
// [VI] Một nhánh trong switch (case/default).
    default:
// [VI] Trả về kết quả từ hàm.
      return '/';
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Trả về true nếu prefix của path được phép truy cập với role hiện tại.
// [VI] Thực thi một bước trong luồng xử lý.
 * Tránh trường hợp còn sót `?redirect=/moderation` khiến CONTRIBUTOR bị chuyển hướng vào trang không phù hợp.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Khai báo hàm/biểu thức hàm.
function isRedirectAllowedForRole(path: string, role: UserRole): boolean {
// [VI] Khai báo biến/hằng số.
  const p = path.toLowerCase();
// [VI] Thực thi một bước trong luồng xử lý.
  // Route chỉ dành cho Admin
// [VI] Rẽ nhánh điều kiện (if).
  if (p.startsWith('/admin')) return role === UserRole.ADMIN;
// [VI] Thực thi một bước trong luồng xử lý.
  // Route chỉ dành cho Expert
// [VI] Rẽ nhánh điều kiện (if).
  if (p.startsWith('/moderation') || p.startsWith('/approved-recordings')) {
// [VI] Trả về kết quả từ hàm.
    return role === UserRole.EXPERT || role === UserRole.ADMIN;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
  // Route chỉ dành cho Researcher
// [VI] Rẽ nhánh điều kiện (if).
  if (p.startsWith('/researcher')) {
// [VI] Trả về kết quả từ hàm.
    return role === UserRole.RESEARCHER || role === UserRole.ADMIN;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
  // Các path nội bộ khác đều cho phép (public + contributor)
// [VI] Trả về kết quả từ hàm.
  return true;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function resolvePostLoginPath(user: User, requestedRedirect: string | null): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (
// [VI] Thực thi một bước trong luồng xử lý.
    requestedRedirect &&
// [VI] Thực thi một bước trong luồng xử lý.
    isSafeInternalPath(requestedRedirect) &&
// [VI] Thực thi một bước trong luồng xử lý.
    isRedirectAllowedForRole(requestedRedirect, user.role)
// [VI] Thực thi một bước trong luồng xử lý.
  ) {
// [VI] Trả về kết quả từ hàm.
    return requestedRedirect;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Trả về kết quả từ hàm.
  return getDefaultPostLoginPath(user);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function logGuardDecision(
// [VI] Thực thi một bước trong luồng xử lý.
  guardName: 'AdminGuard' | 'ResearcherGuard',
// [VI] Thực thi một bước trong luồng xử lý.
  pathname: string,
// [VI] Thực thi một bước trong luồng xử lý.
  decision: GuardDecision,
// [VI] Thực thi một bước trong luồng xử lý.
): void {
// [VI] Rẽ nhánh điều kiện (if).
  if (!import.meta.env.DEV) return;
// [VI] Khai báo biến/hằng số.
  const detail =
// [VI] Thực thi một bước trong luồng xử lý.
    decision.status === 'redirect'
// [VI] Thực thi một bước trong luồng xử lý.
      ? { reason: decision.reason, redirectTo: decision.redirectTo }
// [VI] Thực thi một bước trong luồng xử lý.
      : {};
// [VI] Thực thi một bước trong luồng xử lý.
  console.debug(`[route-guard] ${guardName}`, {
// [VI] Thực thi một bước trong luồng xử lý.
    pathname,
// [VI] Thực thi một bước trong luồng xử lý.
    status: decision.status,
// [VI] Thực thi một bước trong luồng xử lý.
    ...detail,
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}
