// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import { extractArray, extractObject } from '@/utils/apiHelpers';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type AdminUserRow = {
// [VI] Thực thi một bước trong luồng xử lý.
  id?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  userId?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  username?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  email?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  fullName?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  role?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  isActive?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  status?: string;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const adminApi = {
// [VI] Thực thi một bước trong luồng xử lý.
  async getUsers(): Promise<AdminUserRow[]> {
// [VI] Thực thi một bước trong luồng xử lý.
    // Per paths.txt: prefer User API for listing users.
// [VI] Thực thi một bước trong luồng xử lý.
    // Fallback to Admin users endpoint when needed.
// [VI] Khai báo biến/hằng số.
    const normalize = (res: unknown): AdminUserRow[] => {
// [VI] Khai báo biến/hằng số.
      const rawArr = extractArray<unknown>(res);
// [VI] Trả về kết quả từ hàm.
      return rawArr
// [VI] Khai báo hàm/biểu thức hàm.
        .map((it) => {
// [VI] Thực thi một bước trong luồng xử lý.
          // Support minimal mocks: ["a@gmail.com","b@gmail.com"]
// [VI] Rẽ nhánh điều kiện (if).
          if (typeof it === 'string') {
// [VI] Trả về kết quả từ hàm.
            return { id: it, email: it, username: it } satisfies AdminUserRow;
// [VI] Thực thi một bước trong luồng xử lý.
          }
// [VI] Rẽ nhánh điều kiện (if).
          if (it && typeof it === 'object') return it as AdminUserRow;
// [VI] Trả về kết quả từ hàm.
          return null;
// [VI] Thực thi một bước trong luồng xử lý.
        })
// [VI] Khai báo hàm/biểu thức hàm.
        .filter((x): x is AdminUserRow => !!x);
// [VI] Thực thi một bước trong luồng xử lý.
    };

// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const res = await api.get<unknown>('/User/GetAll');
// [VI] Khai báo biến/hằng số.
      const list = normalize(res);
// [VI] Rẽ nhánh điều kiện (if).
      if (list.length > 0) return list;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Thực thi một bước trong luồng xử lý.
      // ignore and fallback
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Khai báo biến/hằng số.
    const fallback = await api.get<unknown>('/Admin/users');
// [VI] Trả về kết quả từ hàm.
    return normalize(fallback);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async getUserById(id: string): Promise<AdminUserRow | null> {
// [VI] Khai báo biến/hằng số.
    const res = await api.get<unknown>(`/Admin/users/${encodeURIComponent(id)}`);
// [VI] Khai báo biến/hằng số.
    const obj = extractObject(res);
// [VI] Trả về kết quả từ hàm.
    return obj ? (obj as AdminUserRow) : null;
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async updateUserRole(id: string, role: string): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
    await api.put(`/Admin/users/${encodeURIComponent(id)}/role`, { role });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  async updateUserStatus(id: string, isActive: boolean): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
    // Some backends use { isActive }, some use { status }. Keep a simple payload.
// [VI] Thực thi một bước trong luồng xử lý.
    await api.put(`/Admin/users/${encodeURIComponent(id)}/status`, { isActive });
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
