import { apiFetch, apiOk, asApiEnvelope, unwrapServiceResponse } from '@/api';
import type {
  ApiAdminUpdateRoleRequest,
  ApiAdminUpdateStatusRequest,
  ApiAdminUserAdminDto,
  ApiAdminUserDetailAdminDto,
  ApiAdminUsersListQuery,
  ApiAdminUsersPagedList,
  ApiBaseResponse,
} from '@/api';
import { legacyGet, legacyPost } from '@/api/legacyHttp';
import { extractArray, extractObject } from '@/utils/apiHelpers';
import { getErrorMessage } from '@/utils/httpError';

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

export type CreateExpertPayload = {
  email: string;
  password: string;
  fullName: string;
};

export type CreateExpertResult = {
  userId?: string;
  message?: string;
};

export type AdminAuditLogRow = {
  id?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  oldValuesJson?: string;
  newValuesJson?: string;
  createdAt?: string;
};

export type AdminAuditLogsPaged = {
  items: AdminAuditLogRow[];
  page: number;
  pageSize: number;
  total: number;
};

export type AdminSystemHealth = {
  status?: string;
  uptime?: string;
  dbConnections?: number;
  queueLength?: number;
  services?: Record<string, string>;
};

type AdminUserListItem = AdminUserRow | string;
type AdminUserListResponse =
  | AdminUserListItem[]
  | ApiAdminUsersPagedList
  | {
      data?: AdminUserListItem[];
      Data?: AdminUserListItem[];
      items?: AdminUserListItem[];
      Items?: AdminUserListItem[];
      users?: AdminUserListItem[];
      Users?: AdminUserListItem[];
      results?: AdminUserListItem[];
      result?: AdminUserListItem[];
      value?: AdminUserListItem[];
    };

export const adminApi = {
  async getUsers(): Promise<AdminUserRow[]> {
    // Per paths.txt: prefer User API for listing users.
    // Fallback to Admin users endpoint when needed.
    const normalize = (res: AdminUserListResponse): AdminUserRow[] => {
      const rawArr = extractArray<AdminUserListItem>(res);
      return rawArr
        .map((it) => {
          let row: AdminUserRow | null = null;
          // Support minimal mocks: ["a@gmail.com","b@gmail.com"]
          if (typeof it === 'string') {
            row = { id: it, email: it, username: it };
            return row;
          }
          if (it && typeof it === 'object') {
            const dto = it as ApiAdminUserAdminDto;
            row = {
              ...(it as AdminUserRow),
              id: dto.id ?? (it as AdminUserRow).id,
              email: dto.email ?? (it as AdminUserRow).email,
              fullName: dto.fullName ?? (it as AdminUserRow).fullName,
              role: dto.role ?? (it as AdminUserRow).role,
              status: dto.status ?? (it as AdminUserRow).status,
            };
            return row;
          }
          return row;
        })
        .filter((x): x is AdminUserRow => x !== null);
    };

    try {
      const res = await apiOk(
        asApiEnvelope<AdminUserListResponse>(apiFetch.GET('/api/User/GetAll')),
      );
      const list = normalize(res);
      if (list.length > 0) return list;
    } catch {
      // ignore and fallback
    }

    const params: ApiAdminUsersListQuery = {};
    const fallback = await apiOk(
      apiFetch.GET('/api/Admin/users', {
        params: { query: params },
      }),
    );
    const unwrapped = unwrapServiceResponse<ApiAdminUsersPagedList>(fallback as unknown);
    return normalize((unwrapped ?? fallback) as AdminUserListResponse);
  },

  async getUserById(id: string): Promise<AdminUserRow | null> {
    const res = await apiOk(
      apiFetch.GET('/api/Admin/users/{id}', {
        params: { path: { id } },
      }),
    );
    const unwrapped = unwrapServiceResponse<ApiAdminUserDetailAdminDto>(res as unknown);
    const obj = extractObject(unwrapped ?? res);
    return obj ? (obj as AdminUserRow) : null;
  },

  async updateUserRole(id: string, role: string): Promise<void> {
    const payload: ApiAdminUpdateRoleRequest = { role };
    await apiOk(
      apiFetch.PUT('/api/Admin/users/{id}/role', {
        params: { path: { id } },
        body: payload,
      }),
    );
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<void> {
    const payload: ApiAdminUpdateStatusRequest & { isActive: boolean } = {
      status: isActive ? 'Active' : 'Inactive',
      isActive,
    };
    await apiOk(
      apiFetch.PUT('/api/Admin/users/{id}/status', {
        params: { path: { id } },
        body: payload,
      }),
    );
  },

  async createExpert(payload: CreateExpertPayload): Promise<CreateExpertResult> {
    try {
      // POST /api/Admin/create-expert — not yet in OpenAPI; use legacy POST until api:sync
      const res = await legacyPost<ApiBaseResponse | Record<string, unknown>>(
        '/Admin/create-expert',
        {
          email: payload.email.trim(),
          password: payload.password,
          fullName: payload.fullName.trim(),
        },
      );
      const obj = extractObject(res) ?? (res as Record<string, unknown>);
      return {
        message:
          typeof obj?.message === 'string'
            ? obj.message
            : typeof (res as { Message?: string })?.Message === 'string'
              ? (res as { Message: string }).Message
              : 'Tạo tài khoản Expert thành công.',
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Không thể tạo tài khoản Chuyên gia.'));
    }
  },

  async getAuditLogs(params?: {
    page?: number;
    pageSize?: number;
    from?: string;
    to?: string;
  }): Promise<AdminAuditLogsPaged> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;

    const raw = await legacyGet<Record<string, unknown>>('/Admin/audit-logs', { params: query });
    const obj = extractObject(raw) ?? raw;
    const itemsRaw =
      extractArray<Record<string, unknown>>(obj?.items) ??
      extractArray<Record<string, unknown>>(obj?.Items) ??
      [];
    const items: AdminAuditLogRow[] = itemsRaw.map((row) => ({
      id: String(row.id ?? row.Id ?? ''),
      userId: String(row.userId ?? row.UserId ?? ''),
      entityType: String(row.entityType ?? row.EntityType ?? ''),
      entityId: String(row.entityId ?? row.EntityId ?? ''),
      action: String(row.action ?? row.Action ?? ''),
      oldValuesJson: String(row.oldValuesJson ?? row.OldValuesJson ?? ''),
      newValuesJson: String(row.newValuesJson ?? row.NewValuesJson ?? ''),
      createdAt: String(row.createdAt ?? row.CreatedAt ?? ''),
    }));

    return {
      items,
      page: Number(obj?.page ?? obj?.Page ?? 1),
      pageSize: Number(obj?.pageSize ?? obj?.PageSize ?? 20),
      total: Number(obj?.total ?? obj?.Total ?? items.length),
    };
  },

  async getSystemHealth(): Promise<AdminSystemHealth> {
    const raw = await legacyGet<Record<string, unknown>>('/Admin/system-health');
    const obj = extractObject(raw) ?? raw;
    const servicesRaw = obj?.services ?? obj?.Services;
    const services =
      servicesRaw && typeof servicesRaw === 'object' && !Array.isArray(servicesRaw)
        ? (servicesRaw as Record<string, string>)
        : undefined;

    return {
      status: String(obj?.status ?? obj?.Status ?? 'Unknown'),
      uptime: String(obj?.uptime ?? obj?.Uptime ?? '—'),
      dbConnections: Number(obj?.dbConnections ?? obj?.DbConnections ?? 0),
      queueLength: Number(obj?.queueLength ?? obj?.QueueLength ?? 0),
      services,
    };
  },
};
