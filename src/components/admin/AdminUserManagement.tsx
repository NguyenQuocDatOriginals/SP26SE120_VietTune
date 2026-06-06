import { BookOpen, FileWarning, RefreshCcw, Search, User as UserIcon, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { RoleSelectDropdown } from '@/components/admin/AdminDashboardDropdowns';
import Pagination from '@/components/common/Pagination';
import { PAGE_SIZE_DEFAULT } from '@/config/pagination';
import {
  getStatusNameVi,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  type AggregatedUser,
  type UserAccountStatus,
} from '@/features/admin/adminDashboardTypes';
import {
  filterAdminUsers,
  paginateAdminUsers,
} from '@/features/admin/adminUserFilter';
import { UserRole } from '@/types';
import { notifyLine, uiToast } from '@/uiToast';

export type AdminUserManagementProps = {
  remoteUsersLoadState: 'idle' | 'loading' | 'ok' | 'error';
  usersForTable: AggregatedUser[];
  showUsersLoadingHint: boolean;
  setShowUsersLoadingHint: (v: boolean) => void;
  load: (opts?: { showUserLoadingHint?: boolean }) => Promise<void>;
  onOpenGuide: () => void;
  getRoleNameVi: (role: string) => string;
  onAssignRole: (userId: string, newRole: string) => void | Promise<void>;
  onRequestDeleteUser: (payload: { id: string; username: string }) => void;
  onReactivateUser: (userId: string) => void | Promise<void>;
};

export default function AdminUserManagement({
  remoteUsersLoadState,
  usersForTable,
  showUsersLoadingHint,
  setShowUsersLoadingHint,
  load,
  onOpenGuide,
  getRoleNameVi,
  onAssignRole,
  onRequestDeleteUser,
  onReactivateUser,
}: AdminUserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccountStatus>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const filteredUsers = useMemo(
    () =>
      filterAdminUsers(usersForTable, {
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
      }),
    [usersForTable, searchTerm, roleFilter, statusFilter],
  );

  const { items: pagedUsers, totalPages, safePage } = useMemo(
    () => paginateAdminUsers(filteredUsers, page, PAGE_SIZE_DEFAULT),
    [filteredUsers, page],
  );

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-3">
        <div className="p-2 bg-primary-100/90 rounded-lg shadow-sm">
          <Users className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
        </div>
        Quản lý người dùng
      </h2>
      <p className="text-neutral-700 font-medium leading-relaxed mb-6">
        Phân công vai trò (dựa trên bằng cấp/thành tích) và theo dõi chất lượng đóng góp (số bản thu,
        đã duyệt, từ chối).
      </p>

      {remoteUsersLoadState === 'error' && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50/90 border border-red-300/80 rounded-2xl shadow-sm backdrop-blur-sm">
          <FileWarning className="h-5 w-5 text-red-600 flex-shrink-0" strokeWidth={2.5} />
          <p className="text-red-800 font-medium">
            Không thể lấy danh sách người dùng từ API{' '}
            <span className="font-semibold">/api/Admin/users</span>. Vui lòng kiểm tra backend.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-4 sm:p-6 lg:p-8 mb-6 transition-all duration-300 hover:shadow-xl bg-surface-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-neutral-700">Gợi ý quy trình</div>
            <div className="text-neutral-600 font-medium text-sm leading-relaxed">
              Ưu tiên gán vai trò <span className="text-neutral-900 font-semibold">Chuyên gia</span>{' '}
              cho người dùng có hồ sơ học thuật phù hợp; theo dõi tỉ lệ duyệt/từ chối để đánh giá chất
              lượng đóng góp.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              title="Mở hướng dẫn"
            >
              <BookOpen className="h-4 w-4" strokeWidth={2.5} />
              Xem hướng dẫn
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  setShowUsersLoadingHint(true);
                  await load({ showUserLoadingHint: true });
                  uiToast.success(notifyLine('Đã làm mới', 'Dữ liệu quản trị đã được cập nhật.'));
                } finally {
                  setShowUsersLoadingHint(false);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200/80 text-neutral-800 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-surface-panel"
              title="Làm mới dữ liệu"
            >
              <RefreshCcw className="h-4 w-4" strokeWidth={2.5} />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            strokeWidth={2.5}
            aria-hidden
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email…"
            className="w-full rounded-full border border-neutral-300/80 bg-surface-panel py-2.5 pl-10 pr-4 text-sm font-medium text-neutral-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            aria-label="Tìm kiếm người dùng"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="min-w-[160px] rounded-full border border-neutral-300/80 bg-surface-panel px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm focus:border-primary-500 focus:outline-none"
          aria-label="Lọc theo vai trò"
        >
          <option value="all">Tất cả vai trò</option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | UserAccountStatus)}
          className="min-w-[160px] rounded-full border border-neutral-300/80 bg-surface-panel px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm focus:border-primary-500 focus:outline-none"
          aria-label="Lọc theo trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-sm font-medium text-neutral-600 sm:ml-auto">
          {filteredUsers.length} người dùng
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-3 px-4 font-semibold text-neutral-800">Người dùng</th>
              <th className="py-3 px-4 font-semibold text-neutral-800">Vai trò</th>
              <th className="py-3 px-4 font-semibold text-neutral-800">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-neutral-800">Điểm đóng góp</th>
              <th className="py-3 px-4 font-semibold text-neutral-800">Đã duyệt</th>
              <th className="py-3 px-4 font-semibold text-neutral-800">Từ chối</th>
              <th className="py-3 px-4 font-semibold text-neutral-800">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-neutral-400" />
                    <div className="min-w-0">
                      <div className="font-medium text-neutral-900 truncate">
                        {u.fullName ?? u.username}
                      </div>
                      <div className="text-neutral-500 text-sm font-medium break-all">
                        {u.email ?? u.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-neutral-700">{getRoleNameVi(u.role)}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {getStatusNameVi(u.status)}
                  </span>
                </td>
                <td className="py-3 px-4 text-neutral-700">{u.contributionCount}</td>
                <td className="py-3 px-4 text-green-600 font-medium">{u.approvedCount}</td>
                <td className="py-3 px-4 text-red-600 font-medium">{u.rejectedCount}</td>
                <td className="py-3 px-4">
                  {u.role !== UserRole.ADMIN && (
                    <div className="flex flex-wrap items-center gap-2">
                      <RoleSelectDropdown
                        value={u.role}
                        onChange={(v) => void onAssignRole(u.id, v)}
                        disabled={u.status === 'Inactive'}
                      />
                      {u.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={() =>
                            onRequestDeleteUser({ id: u.id, username: u.username })
                          }
                          className="inline-flex min-h-[44px] items-center rounded-full border border-red-300/80 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-50 cursor-pointer"
                        >
                          Vô hiệu hóa
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void onReactivateUser(u.id)}
                          className="inline-flex min-h-[44px] items-center rounded-full border border-green-300/80 px-4 py-2 text-sm font-medium text-green-800 shadow-sm transition-all hover:bg-green-50 cursor-pointer"
                        >
                          Kích hoạt
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUsersLoadingHint && remoteUsersLoadState !== 'ok' && (
        <div className="mt-4 text-sm text-neutral-600 font-medium">
          Đang tải danh sách người dùng từ API…
        </div>
      )}

      {remoteUsersLoadState === 'ok' && filteredUsers.length === 0 && (
        <div className="mt-4 rounded-2xl border border-neutral-200/80 shadow-sm p-6 text-center bg-surface-panel">
          <p className="text-neutral-700 font-semibold">Không có người dùng để hiển thị.</p>
          <p className="text-neutral-600 font-medium text-sm mt-1">
            (Danh sách lấy từ <span className="font-semibold">/api/Admin/users</span>
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? ' — thử đổi bộ lọc hoặc từ khóa tìm kiếm.'
              : '.'}
            )
          </p>
        </div>
      )}

      {filteredUsers.length > PAGE_SIZE_DEFAULT && (
        <div className="mt-6">
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
