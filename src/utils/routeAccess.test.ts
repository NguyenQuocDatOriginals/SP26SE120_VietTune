// [VI] Nhập (import) các phụ thuộc cho file.
import { describe, expect, it } from 'vitest';

// [VI] Nhập (import) các phụ thuộc cho file.
import {
// [VI] Thực thi một bước trong luồng xử lý.
  ADMIN_ROUTE_POLICY,
// [VI] Thực thi một bước trong luồng xử lý.
  RESEARCHER_ROUTE_POLICY,
// [VI] Thực thi một bước trong luồng xử lý.
  evaluateGuardAccess,
// [VI] Thực thi một bước trong luồng xử lý.
  getDefaultPostLoginPath,
// [VI] Thực thi một bước trong luồng xử lý.
  resolvePostLoginPath,
// [VI] Thực thi một bước trong luồng xử lý.
} from './routeAccess';

// [VI] Nhập (import) các phụ thuộc cho file.
import { UserRole, type User } from '@/types';


// [VI] Khai báo hàm/biểu thức hàm.
function makeUser(role: UserRole, isActive = true): User {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    id: 'u1',
// [VI] Thực thi một bước trong luồng xử lý.
    username: 'tester',
// [VI] Thực thi một bước trong luồng xử lý.
    email: 'tester@example.com',
// [VI] Thực thi một bước trong luồng xử lý.
    fullName: 'Tester',
// [VI] Thực thi một bước trong luồng xử lý.
    role,
// [VI] Thực thi một bước trong luồng xử lý.
    isActive,
// [VI] Thực thi một bước trong luồng xử lý.
    createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
    updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
describe('routeAccess', () => {
// [VI] Khai báo hàm/biểu thức hàm.
  it('redirects unauthenticated users to login', () => {
// [VI] Khai báo biến/hằng số.
    const d = evaluateGuardAccess(null, '/admin', ADMIN_ROUTE_POLICY);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(d.status).toBe('redirect');
// [VI] Rẽ nhánh điều kiện (if).
    if (d.status === 'redirect') {
// [VI] Thực thi một bước trong luồng xử lý.
      expect(d.reason).toBe('unauthenticated');
// [VI] Thực thi một bước trong luồng xử lý.
      expect(d.redirectTo).toContain('/login?redirect=');
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('blocks unauthorized role', () => {
// [VI] Khai báo biến/hằng số.
    const d = evaluateGuardAccess(makeUser(UserRole.CONTRIBUTOR), '/admin', ADMIN_ROUTE_POLICY);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(d.status).toBe('redirect');
// [VI] Rẽ nhánh điều kiện (if).
    if (d.status === 'redirect') {
// [VI] Thực thi một bước trong luồng xử lý.
      expect(d.reason).toBe('unauthorized');
// [VI] Thực thi một bước trong luồng xử lý.
      expect(d.redirectTo).toBe('/403');
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('allows researcher route for researcher', () => {
// [VI] Khai báo biến/hằng số.
    const d = evaluateGuardAccess(
// [VI] Thực thi một bước trong luồng xử lý.
      makeUser(UserRole.RESEARCHER),
// [VI] Thực thi một bước trong luồng xử lý.
      '/researcher',
// [VI] Thực thi một bước trong luồng xử lý.
      RESEARCHER_ROUTE_POLICY,
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Thực thi một bước trong luồng xử lý.
    expect(d).toEqual({ status: 'allow' });
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('resolves post-login redirect safely by role', () => {
// [VI] Khai báo biến/hằng số.
    const contributor = makeUser(UserRole.CONTRIBUTOR);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(resolvePostLoginPath(contributor, '/moderation')).toBe('/');
// [VI] Thực thi một bước trong luồng xử lý.
    expect(resolvePostLoginPath(contributor, '/explore')).toBe('/explore');
// [VI] Thực thi một bước trong luồng xử lý.
    expect(getDefaultPostLoginPath(makeUser(UserRole.ADMIN))).toBe('/admin');
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
});
