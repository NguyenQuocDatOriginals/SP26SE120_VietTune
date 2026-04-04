import { api } from '@/services/api';
import { extractArray, extractObject } from '@/utils/apiHelpers';

export type AdminUserRow = {
  id?: string;
  userId?: string;
  username?: string;
  email?: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
  status?: string;
};

export const adminApi = {
  async getUsers(): Promise<AdminUserRow[]> {
    // Per paths.txt: prefer User API for listing users.
    // Fallback to Admin users endpoint when needed.
    const normalize = (res: unknown): AdminUserRow[] => {
      const rawArr = extractArray<unknown>(res);
      return rawArr
        .map((it) => {
          // Support minimal mocks: ["a@gmail.com","b@gmail.com"]
          if (typeof it === 'string') {
            return { id: it, email: it, username: it } satisfies AdminUserRow;
          }
          if (it && typeof it === 'object') return it as AdminUserRow;
          return null;
        })
        .filter((x): x is AdminUserRow => !!x);
    };

    try {
      const res = await api.get<unknown>('/User/GetAll');
      const list = normalize(res);
      if (list.length > 0) return list;
    } catch {
      // ignore and fallback
    }

    const fallback = await api.get<unknown>('/Admin/users');
    return normalize(fallback);
  },

  async getUserById(id: string): Promise<AdminUserRow | null> {
    const res = await api.get<unknown>(`/Admin/users/${encodeURIComponent(id)}`);
    const obj = extractObject(res);
    return obj ? (obj as AdminUserRow) : null;
  },

  async updateUserRole(id: string, role: string): Promise<void> {
    await api.put(`/Admin/users/${encodeURIComponent(id)}/role`, { role });
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<void> {
    // Some backends use { isActive }, some use { status }. Keep a simple payload.
    await api.put(`/Admin/users/${encodeURIComponent(id)}/status`, { isActive });
  },
};
