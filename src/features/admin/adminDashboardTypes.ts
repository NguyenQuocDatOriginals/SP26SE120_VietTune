import { UserRole } from '@/types';

/** Dashboard stepper sections (URL query `?section=` on `/admin`). */
export const ADMIN_DASHBOARD_SECTION_IDS = ['users', 'analytics'] as const;
export type AdminDashboardSectionId = (typeof ADMIN_DASHBOARD_SECTION_IDS)[number];

export function parseAdminDashboardSectionParam(raw: string | null): AdminDashboardSectionId {
  const t = raw?.trim() ?? '';
  return ADMIN_DASHBOARD_SECTION_IDS.includes(t as AdminDashboardSectionId)
    ? (t as AdminDashboardSectionId)
    : 'users';
}

/** True when `raw` is non-empty but not a valid dashboard section (caller may strip from URL). */
export function isNonEmptyInvalidAdminDashboardSection(raw: string | null): boolean {
  const t = raw?.trim() ?? '';
  if (!t) return false;
  return !ADMIN_DASHBOARD_SECTION_IDS.includes(t as AdminDashboardSectionId);
}

export type StepId = 'users' | 'analytics' | 'master-data';

export function asObject(input: unknown): Record<string, unknown> | null {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : null;
}

export type UserAccountStatus = 'Active' | 'Inactive';

export interface AggregatedUser {
  id: string;
  username: string;
  email: string | undefined;
  fullName: string | undefined;
  role: string;
  status: UserAccountStatus;
  contributionCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export const STATUS_OPTIONS: { value: UserAccountStatus; label: string }[] = [
  { value: 'Active', label: 'Đang hoạt động' },
  { value: 'Inactive', label: 'Đã vô hiệu hóa' },
];

export function getStatusNameVi(status: UserAccountStatus | string): string {
  const normalized = status.trim();
  if (normalized.toLowerCase() === 'inactive') return 'Đã vô hiệu hóa';
  if (normalized.toLowerCase() === 'active') return 'Đang hoạt động';
  return STATUS_OPTIONS.find((o) => o.value === normalized)?.label ?? normalized;
}

export function resolveUserAccountStatus(
  raw: { status?: unknown; isActive?: unknown; Status?: unknown; IsActive?: unknown },
): UserAccountStatus {
  const statusStr =
    typeof raw.status === 'string'
      ? raw.status
      : typeof raw.Status === 'string'
        ? raw.Status
        : undefined;
  if (statusStr) {
    return statusStr.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
  }
  const isActive =
    typeof raw.isActive === 'boolean'
      ? raw.isActive
      : typeof raw.IsActive === 'boolean'
        ? raw.IsActive
        : undefined;
  if (typeof isActive === 'boolean') return isActive ? 'Active' : 'Inactive';
  return 'Active';
}

export const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: UserRole.CONTRIBUTOR, label: 'Người đóng góp' },
  { value: UserRole.EXPERT, label: 'Chuyên gia' },
  { value: UserRole.RESEARCHER, label: 'Nhà nghiên cứu' },
];

export const ROLE_NAMES_VI: Record<string, string> = {
  [UserRole.ADMIN]: 'Quản trị viên',
  ADMIN: 'Quản trị viên',
  [UserRole.RESEARCHER]: 'Nhà nghiên cứu',
  [UserRole.CONTRIBUTOR]: 'Người đóng góp',
  [UserRole.EXPERT]: 'Chuyên gia',
};

export function getRoleNameVi(role: string): string {
  const normalized = role.trim();
  const lowerRoleAlias: Record<string, string> = {
    admin: 'Quản trị viên',
    administrator: 'Quản trị viên',
    researcher: 'Nhà nghiên cứu',
    contributor: 'Người đóng góp',
    expert: 'Chuyên gia',
  };

  return (
    ROLE_NAMES_VI[normalized] ??
    ROLE_NAMES_VI[normalized.toUpperCase()] ??
    lowerRoleAlias[normalized.toLowerCase()] ??
    normalized
  );
}

export const DELETE_ACTION = '__DELETE__' as const;

export const DEMO_USERS: AggregatedUser[] = [
  {
    id: 'contrib_demo',
    username: 'contributor_demo',
    email: undefined,
    fullName: undefined,
    role: UserRole.CONTRIBUTOR,
    status: 'Active',
    contributionCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  },
  {
    id: 'expert_a',
    username: 'expertA',
    email: undefined,
    fullName: undefined,
    role: UserRole.EXPERT,
    status: 'Active',
    contributionCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  },
  {
    id: 'expert_b',
    username: 'expertB',
    email: undefined,
    fullName: undefined,
    role: UserRole.EXPERT,
    status: 'Active',
    contributionCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  },
  {
    id: 'expert_c',
    username: 'expertC',
    email: undefined,
    fullName: undefined,
    role: UserRole.EXPERT,
    status: 'Active',
    contributionCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  },
  {
    id: 'admin_demo',
    username: 'admin_demo',
    email: undefined,
    fullName: undefined,
    role: UserRole.ADMIN,
    status: 'Active',
    contributionCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  },
];
