import { apiFetch, apiOk, asApiEnvelope, openApiQueryRecord, unwrapServiceResponse } from '@/api';
import type {
  ApiAdminAssignReviewerRequest,
  ApiAdminAuditLogsQuery,
  ApiAdminSubmissionsListQuery,
  ApiAdminUpdateRoleRequest,
  ApiAdminUpdateStatusRequest,
  ApiAdminUserAdminDto,
  ApiAdminUserDetailAdminDto,
  ApiAdminUsersListQuery,
  ApiAdminUsersPagedList,
  ApiCreateExpertUserDTO,
} from '@/api';
import { resolveUserAccountStatus } from '@/features/admin/adminDashboardTypes';
import { extractSubmissionRows } from '@/services/submissionApiMapper';
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
    const normalize = (res: AdminUserListResponse): AdminUserRow[] => {
      const rawArr = extractArray<AdminUserListItem>(res);
      return rawArr
        .map((it) => {
          let row: AdminUserRow | null = null;
          if (typeof it === 'string') {
            row = { id: it, email: it, username: it, status: 'Active' };
            return row;
          }
          if (it && typeof it === 'object') {
            const dto = it as ApiAdminUserAdminDto;
            const status = resolveUserAccountStatus({
              status: dto.status ?? (it as AdminUserRow).status,
              isActive: (it as AdminUserRow).isActive,
            });
            const raw = it as AdminUserRow & { userId?: string; UserId?: string };
            row = {
              ...(it as AdminUserRow),
              id:
                dto.id ??
                raw.id ??
                raw.userId ??
                raw.UserId ??
                (it as AdminUserRow).id,
              email: dto.email ?? (it as AdminUserRow).email,
              fullName: dto.fullName ?? (it as AdminUserRow).fullName,
              role: dto.role ?? (it as AdminUserRow).role,
              status,
            };
            return row;
          }
          return row;
        })
        .filter((x): x is AdminUserRow => x !== null);
    };

    try {
      const params: ApiAdminUsersListQuery = { page: 1, pageSize: 1000 };
      const primary = await apiOk(
        apiFetch.GET('/api/Admin/users', {
          params: { query: params },
        }),
      );
      const unwrapped = unwrapServiceResponse<ApiAdminUsersPagedList>(primary as unknown);
      const list = normalize((unwrapped ?? primary) as AdminUserListResponse);
      if (list.length > 0) return list;
    } catch {
      // fallback below
    }

    const fallback = await apiOk(
      asApiEnvelope<AdminUserListResponse>(apiFetch.GET('/api/User/GetAll')),
    );
    return normalize(fallback);
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
    const payload: ApiAdminUpdateStatusRequest = {
      status: isActive ? 'Active' : 'Inactive',
    };
    await apiOk(
      apiFetch.PUT('/api/Admin/users/{id}/status', {
        params: { path: { id } },
        body: payload,
      }),
    );
  },

  async getSubmissions(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    reviewer?: string;
  }): Promise<Record<string, unknown>[]> {
    const query: ApiAdminSubmissionsListQuery = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 200,
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.reviewer ? { reviewer: params.reviewer } : {}),
    };
    const res = await apiOk(
      apiFetch.GET('/api/Admin/submissions', {
        params: { query: openApiQueryRecord(query) },
      }),
    );
    return extractSubmissionRows(res);
  },

  async assignSubmissionReviewer(submissionId: string, reviewerId: string): Promise<void> {
    const body: ApiAdminAssignReviewerRequest = { reviewerId };
    await apiOk(
      apiFetch.POST('/api/Admin/submissions/{id}/assign', {
        params: { path: { id: submissionId } },
        body,
      }),
    );
  },

  async createExpert(payload: CreateExpertPayload): Promise<CreateExpertResult> {
    try {
      const body: ApiCreateExpertUserDTO = {
        email: payload.email.trim(),
        password: payload.password,
        fullName: payload.fullName.trim(),
      };
      await apiOk(
        apiFetch.POST('/api/User/create-expert', { body }),
      );
      return { message: 'Tạo tài khoản Expert thành công.' };
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
    const auditQuery: ApiAdminAuditLogsQuery = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      ...(params?.from ? { from: params.from } : {}),
      ...(params?.to ? { to: params.to } : {}),
    };
    const raw = await apiOk(
      apiFetch.GET('/api/Admin/audit-logs', {
        params: { query: openApiQueryRecord(auditQuery) },
      }),
    );
    const obj = (extractObject(raw) ?? raw) as Record<string, unknown>;
    const itemsRaw =
      extractArray<Record<string, unknown>>(obj.items) ??
      extractArray<Record<string, unknown>>(obj.Items) ??
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
      page: Number(obj.page ?? obj.Page ?? 1),
      pageSize: Number(obj.pageSize ?? obj.PageSize ?? 20),
      total: Number(obj.total ?? obj.Total ?? items.length),
    };
  },

  async getSystemHealth(): Promise<AdminSystemHealth> {
    const raw = await apiOk(apiFetch.GET('/api/Admin/system-health'));
    const obj = (extractObject(raw) ?? raw) as Record<string, unknown>;
    const servicesRaw = obj.services ?? obj.Services;
    const services =
      servicesRaw && typeof servicesRaw === 'object' && !Array.isArray(servicesRaw)
        ? (servicesRaw as Record<string, string>)
        : undefined;

    return {
      status: String(obj.status ?? obj.Status ?? 'Unknown'),
      uptime: String(obj.uptime ?? obj.Uptime ?? '—'),
      dbConnections: Number(obj.dbConnections ?? obj.DbConnections ?? 0),
      queueLength: Number(obj.queueLength ?? obj.QueueLength ?? 0),
      services,
    };
  },
};
