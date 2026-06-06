import { Users, BarChart3, Shield, ChevronRight, ChevronDown, BookOpen, Bot, Activity } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { isAdminOperationsPageEnabled } from '@/config/adminOperationsConfig';
import BackButton from '@/components/common/BackButton';
import Card from '@/components/common/Card';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import {
  getRoleNameVi,
  LegacyAdminPanelId,
  ROLE_NAMES_VI,
  type AdminDashboardSectionId,
  isNonEmptyInvalidAdminDashboardSection,
  parseAdminDashboardSectionParam,
} from '@/features/admin/adminDashboardTypes';
import AdminDashboardPanels from '@/features/admin/dashboard/AdminDashboardPanels';
import AdminGovernanceStrip from '@/features/admin/governance/AdminGovernanceStrip';
import { useAdminDashboardData } from '@/features/admin/hooks/useAdminDashboardData';
import AdminDashboardRail from '@/features/admin/shell/AdminDashboardRail';
import AdminBreadcrumbs from '@/features/admin/shell/AdminBreadcrumbs';
import { buildAdminBreadcrumbItems } from '@/features/admin/shell/adminBreadcrumbUtils';
import AdminOverviewStrip from '@/features/admin/shell/AdminOverviewStrip';
import { accountDeletionService } from '@/services/accountDeletionService';
import { adminApi } from '@/services/adminApi';
import { recordingRequestService } from '@/services/recordingRequestService';
import { removeLocalRecording } from '@/services/recordingStorage';
import { getItem, setItem } from '@/services/storageService';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import type { ExpertAccountDeletionRequest } from '@/types';
import { uiToast, notifyLine } from '@/uiToast';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = useMemo(
    () => parseAdminDashboardSectionParam(searchParams.get('section')),
    [searchParams],
  );
  const [showAdminGuide, setShowAdminGuide] = useState(false);
  const [legacyPanel, setLegacyPanel] = useState<LegacyAdminPanelId | null>(null);
  const {
    load,
    recordings,
    remoteKbCount,
    aiFlaggedCount,
    setAiFlaggedCount,
    expertPerformanceRows,
    avgExpertAccuracy,
    remoteTotalRecordings,
    remoteInstrumentCount,
    remoteInstruments,
    remoteUsersLoadState,
    showUsersLoadingHint,
    setShowUsersLoadingHint,
    remoteEthnicGroupsLoadState,
    setUsersOverrides,
    usersOverrides,
    pendingExpertDeletions,
    setPendingExpertDeletions,
    deleteRecordingRequests,
    editRecordingRequests,
    usersForTable,
    allUsers,
    monthlyCountsFinal,
    monthlyTrendIsEstimated,
    analyticsContributors,
    analyticsContributorsLoadState,
    ethnicGroupsFromApi,
    lastDashboardRefreshAt,
  } = useAdminDashboardData();

  const [removeTarget, setRemoveTarget] = useState<{ id: string; title?: string } | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<{ id: string; username: string } | null>(
    null,
  );
  const [expertDeletionApproveTarget, setExpertDeletionApproveTarget] =
    useState<ExpertAccountDeletionRequest | null>(null);
  const [forwardDeleteExpertId, setForwardDeleteExpertId] = useState<{
    requestId: string;
    expertId: string;
  } | null>(null);

  useEffect(() => {
    if (isNonEmptyInvalidAdminDashboardSection(searchParams.get('section'))) {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.delete('section');
          return p;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (step !== 'moderation') setLegacyPanel(null);
  }, [step]);

  const stepIndex = useMemo(() => {
    const order: AdminDashboardSectionId[] = ['users', 'analytics', 'aiMonitoring', 'moderation'];
    return Math.max(0, order.indexOf(step));
  }, [step]);

  const adminBreadcrumbItems = useMemo(
    () => buildAdminBreadcrumbItems(location.pathname, searchParams.get('section')),
    [location.pathname, searchParams.get('section')],
  );

  const goSection = useCallback(
    (id: AdminDashboardSectionId) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set('section', id);
          return p;
        },
        { replace: true },
      );
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [setSearchParams],
  );

  const setStepByIndex = (idx: number) => {
    const order: AdminDashboardSectionId[] = ['users', 'analytics', 'aiMonitoring', 'moderation'];
    const next = order[Math.max(0, Math.min(order.length - 1, idx))];
    goSection(next);
  };

  const handleAssignRole = async (userId: string, newRole: string) => {
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const trimmedId = userId.trim();
    if (
      !uuidRe.test(trimmedId) ||
      trimmedId === '00000000-0000-0000-0000-000000000000'
    ) {
      uiToast.error(
        notifyLine(
          'Lỗi',
          'ID người dùng không hợp lệ (API chưa trả UUID đúng). Không thể cập nhật vai trò.',
        ),
      );
      return;
    }
    try {
      await adminApi.updateUserRole(userId, newRole);
      if (import.meta.env.DEV) {
        const oRaw = getItem('users_overrides');
        const o = oRaw ? (JSON.parse(oRaw) as Record<string, Record<string, unknown>>) : {};
        if (!o[userId]) o[userId] = {};
        o[userId].role = newRole;
        void setItem('users_overrides', JSON.stringify(o));
        setUsersOverrides((prev) => ({ ...prev, [userId]: { ...prev[userId], role: newRole } }));
      }
      uiToast.success(
        notifyLine(
          'Thành công',
          `Đã gán vai trò "${ROLE_NAMES_VI[newRole] ?? newRole}" cho người dùng.`,
        ),
      );
      void load({ showUserLoadingHint: true });
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim()
          ? err.message
          : 'Không thể cập nhật vai trò trên máy chủ. Vui lòng thử lại.';
      uiToast.error(notifyLine('Lỗi', message));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, false);
      setDeleteUserTarget(null);
      uiToast.success(notifyLine('Thành công', 'Đã vô hiệu hóa người dùng.'));
      void load({ showUserLoadingHint: true });
    } catch {
      uiToast.error(
        notifyLine('Lỗi', 'Không thể vô hiệu hóa tài khoản trên máy chủ. Vui lòng thử lại.'),
      );
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, true);
      uiToast.success(notifyLine('Thành công', 'Đã kích hoạt lại tài khoản người dùng.'));
      void load({ showUserLoadingHint: true });
    } catch {
      uiToast.error(
        notifyLine('Lỗi', 'Không thể kích hoạt tài khoản trên máy chủ. Vui lòng thử lại.'),
      );
    }
  };

  const handleRemoveRecording = async () => {
    const target = removeTarget;
    if (!target) return;
    const recordingTitle = target.title?.trim() || 'Bản thu';
    try {
      await removeLocalRecording(target.id);
      void recordingRequestService.addNotification({
        type: 'recording_deleted',
        title: 'Bản thu đã bị xóa',
        body: `"${recordingTitle}" đã bị xóa bởi quản trị viên.`,
        forRoles: [UserRole.CONTRIBUTOR, UserRole.EXPERT],
        recordingId: target.id,
      });
      setRemoveTarget(null);
      void load();
      uiToast.success(notifyLine('Thành công', 'Đã xóa bản ghi khỏi hệ thống.'));
    } catch {
      uiToast.error(notifyLine('Lỗi', 'Không thể xóa bản ghi.'));
    }
  };

  const expertOptions = useMemo(() => {
    const experts: { id: string; username: string; fullName?: string }[] = [];
    Object.entries(usersOverrides).forEach(([id, u]) => {
      if (u?.role === UserRole.EXPERT) {
        experts.push({ id, username: u.username ?? id, fullName: u.fullName });
      }
    });
    return experts;
  }, [usersOverrides]);

  const steps: { id: AdminDashboardSectionId; label: string; icon: React.ElementType }[] = useMemo(
    () => [
      { id: 'users', label: 'Quản lý người dùng', icon: Users },
      { id: 'analytics', label: 'Phân tích & thống kê', icon: BarChart3 },
      { id: 'aiMonitoring', label: 'Giám sát hệ thống AI', icon: Bot },
      { id: 'moderation', label: 'Kiểm duyệt nội dung', icon: Shield },
    ],
    [],
  );

  if (!user || user.role !== UserRole.ADMIN) return null;

  const guideButtonClass =
    'inline-flex items-center justify-center gap-2 h-11 px-6 py-0 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none';

  const showAdminOperationsPage = isAdminOperationsPageEnabled();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[minmax(12.5rem,15rem)_minmax(0,1fr)] lg:gap-8 xl:gap-10 lg:items-start">
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <AdminDashboardRail
              activeId={step}
              onSelect={goSection}
              showOperationsLink={showAdminOperationsPage}
            />
          </aside>
          <div className="min-w-0">
        <AdminBreadcrumbs items={adminBreadcrumbItems} className="sm:mb-1" />
        {lastDashboardRefreshAt != null ? (
          <p className="mb-4 text-xs font-medium text-neutral-500 sm:text-sm">
            Dữ liệu tổng hợp cập nhật:{' '}
            <time dateTime={new Date(lastDashboardRefreshAt).toISOString()}>
              {new Date(lastDashboardRefreshAt).toLocaleString('vi-VN')}
            </time>
            <span className="text-neutral-400"> — làm mới nền ~30s khi tab đang mở.</span>
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-900 min-w-0">
            Quản trị hệ thống
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {showAdminOperationsPage ? (
              <button
                type="button"
                onClick={() => void navigate('/admin/operations')}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 py-0 border-2 border-secondary-600/80 text-secondary-900 hover:bg-secondary-50 font-semibold rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
                title="Vận hành & quản trị AI (P3)"
              >
                <Activity className="h-5 w-5" strokeWidth={2.5} />
                <span>Vận hành &amp; AI</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                void navigate('/admin/master-data');
              }}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 py-0 border-2 border-primary-600 text-primary-700 hover:bg-primary-50 font-semibold rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
              title="Quản lý Master Data"
            >
              <BookOpen className="h-5 w-5" strokeWidth={2.5} />
              <span>Dữ liệu hệ thống</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAdminGuide(true)}
              className={guideButtonClass}
              title="Hướng dẫn Quản trị viên"
            >
              <Shield className="h-5 w-5" strokeWidth={2.5} />
              <span>Hướng dẫn</span>
            </button>
            <BackButton />
          </div>
        </div>

        <div className="hidden lg:block">
          <AdminOverviewStrip
            remoteTotalRecordings={remoteTotalRecordings ?? 0}
            allUsersCount={allUsers.length}
            aiFlaggedCount={aiFlaggedCount ?? 0}
            remoteKbCount={remoteKbCount ?? 0}
          />
        </div>

        <div className="hidden lg:block">
          <AdminGovernanceStrip />
        </div>

        {/* Wizard stepper — mobile / tablet; desktop dùng rail trái */}
        <div
          className="lg:hidden rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-4 sm:p-6 mb-6 sm:mb-8 transition-all duration-300 hover:shadow-xl bg-surface-panel"
        >
          <p className="text-sm font-semibold text-primary-800 mb-3">Điều hướng quản trị</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {steps.map(({ id, label, icon: Icon }) => {
              const isActive = step === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => goSection(id)}
                  className={`inline-flex items-center justify-center gap-2 h-11 px-5 py-0 rounded-full text-sm font-semibold border transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white border-primary-600 shadow-primary-600/30'
                      : 'border-neutral-300/80 text-neutral-800 hover:border-primary-300 cursor-pointer bg-surface-panel'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Card variant="bordered" className="!p-0 overflow-hidden">
          <AdminDashboardPanels
            step={step}
            remoteUsersLoadState={remoteUsersLoadState}
            usersForTable={usersForTable}
            showUsersLoadingHint={showUsersLoadingHint}
            setShowUsersLoadingHint={setShowUsersLoadingHint}
            load={load}
            onOpenUserGuide={() => setShowAdminGuide(true)}
            getRoleNameVi={getRoleNameVi}
            onAssignRole={handleAssignRole}
            onRequestDeleteUser={(p) => setDeleteUserTarget(p)}
            onReactivateUser={handleReactivateUser}
            remoteTotalRecordings={remoteTotalRecordings}
            recordingsLength={recordings.length}
            remoteEthnicGroupsLoadState={remoteEthnicGroupsLoadState}
            ethnicGroupCount={ethnicGroupsFromApi.length}
            allUsersCount={allUsers.length}
            remoteInstrumentCount={remoteInstrumentCount}
            remoteInstruments={remoteInstruments}
            monthlyCountsFinal={monthlyCountsFinal}
            monthlyTrendIsEstimated={monthlyTrendIsEstimated}
            analyticsContributors={analyticsContributors}
            analyticsContributorsLoadState={analyticsContributorsLoadState}
            avgExpertAccuracy={avgExpertAccuracy}
            aiFlaggedCount={aiFlaggedCount}
            remoteKbCount={remoteKbCount}
            expertPerformanceRows={expertPerformanceRows}
            onFlaggedCountChange={setAiFlaggedCount}
            currentUserId={user?.id}
            legacyPanel={legacyPanel}
            setLegacyPanel={setLegacyPanel}
            deleteRecordingRequests={deleteRecordingRequests}
            editRecordingRequests={editRecordingRequests}
            expertOptions={expertOptions}
            forwardDeleteExpertId={forwardDeleteExpertId}
            setForwardDeleteExpertId={setForwardDeleteExpertId}
            pendingExpertDeletions={pendingExpertDeletions}
            onRequestExpertDeletionApprove={setExpertDeletionApproveTarget}
            recordings={recordings}
            onRequestRemoveRecording={({ id, title }) => setRemoveTarget({ id, title })}
          />
        </Card>

        {/* Footer — ẩn trên desktop (đã có rail); giữ trên mobile/tablet */}
        <div className="lg:hidden flex flex-wrap items-center justify-between gap-4 pt-6">
          <button
            type="button"
            onClick={() => setStepByIndex(stepIndex - 1)}
            disabled={stepIndex === 0}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 py-0 rounded-full border-2 border-neutral-300/90 text-neutral-900 font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:opacity-90 disabled:text-neutral-700 disabled:border-neutral-200/80 disabled:hover:scale-100 bg-surface-panel"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={() => {
              setStepByIndex(stepIndex + 1);
              window.scrollTo({ top: 0, behavior: 'auto' });
            }}
            disabled={stepIndex >= steps.length - 1}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 py-0 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Tiếp theo
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => void handleRemoveRecording()}
        title="Xóa bản ghi"
        message={
          removeTarget
            ? `Bạn có chắc muốn xóa "${removeTarget.title?.trim() || 'Bản thu'}" khỏi hệ thống?`
            : ''
        }
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonStyle="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full shadow-xl hover:shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95"
      />

      <ConfirmationDialog
        isOpen={!!deleteUserTarget}
        onClose={() => setDeleteUserTarget(null)}
        onConfirm={() => deleteUserTarget && handleDeleteUser(deleteUserTarget.id)}
        title="Vô hiệu hóa người dùng"
        message={
          deleteUserTarget
            ? `Bạn có chắc muốn vô hiệu hóa "${deleteUserTarget.username}"?`
            : ''
        }
        description="Tài khoản sẽ chuyển sang trạng thái Inactive. Bạn có thể kích hoạt lại sau."
        confirmText="Vô hiệu hóa"
        cancelText="Hủy"
        confirmButtonStyle="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full shadow-xl hover:shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95"
      />

      {/* Guide popup — aligned with UploadPage.tsx */}
      {showAdminGuide && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-guide-title"
          style={{
            animation: 'fadeIn 0.3s ease-out',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            position: 'fixed',
          }}
          onClick={() => setShowAdminGuide(false)}
        >
          <div
            className="rounded-2xl border border-neutral-300/80 shadow-2xl backdrop-blur-sm max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 pointer-events-auto transform bg-surface-panel animate-[slideUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200/80 flex-shrink-0">
              <h2
                id="admin-guide-title"
                className="text-xl sm:text-2xl font-semibold text-neutral-900 flex items-center gap-3"
              >
                <div className="p-2 bg-secondary-100/90 rounded-lg shadow-sm">
                  <BookOpen className="h-5 w-5 text-secondary-600" strokeWidth={2.5} />
                </div>
                Hướng dẫn Quản trị viên
              </h2>
              <button
                type="button"
                onClick={() => setShowAdminGuide(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <span className="sr-only">Đóng</span>
                <ChevronDown className="w-5 h-5 -rotate-90" strokeWidth={2.5} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 min-h-0">
              <div className="flex rounded-xl border border-neutral-200/80 bg-white shadow-md overflow-hidden">
                <div className="w-1.5 sm:w-2 flex-shrink-0 bg-primary-200/90" aria-hidden />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary-100/90 shadow-sm">
                      <Users className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900">
                      Quản lý người dùng
                    </h3>
                  </div>
                  <ul className="space-y-2 text-neutral-700 font-medium leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 flex-shrink-0">•</span>
                      <span>Phân công vai trò dựa trên hồ sơ bằng cấp/thành tích.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 flex-shrink-0">•</span>
                      <span>Theo dõi điểm đóng góp qua số bản thu, tỉ lệ duyệt/từ chối.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex rounded-xl border border-neutral-200/80 bg-white shadow-md overflow-hidden">
                <div className="w-1.5 sm:w-2 flex-shrink-0 bg-sky-200/90" aria-hidden />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-sky-100/90 shadow-sm">
                      <BarChart3 className="h-5 w-5 text-sky-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900">
                      Phân tích & thống kê
                    </h3>
                  </div>
                  <ul className="space-y-2 text-neutral-700 font-medium leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 flex-shrink-0">•</span>
                      <span>Nhận diện vùng khuyết dữ liệu theo dân tộc/vùng miền.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 flex-shrink-0">•</span>
                      <span>Theo dõi xu hướng gửi bài theo tháng.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 flex-shrink-0">•</span>
                      <span>Liệt kê người đóng góp tích cực nhất.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex rounded-xl border border-neutral-200/80 bg-white shadow-md overflow-hidden">
                <div className="w-1.5 sm:w-2 flex-shrink-0 bg-amber-200/90" aria-hidden />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-amber-100/90 shadow-sm">
                      <Bot className="h-5 w-5 text-amber-700" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900">
                      Giám sát hệ thống AI
                    </h3>
                  </div>
                  <ul className="space-y-2 text-neutral-700 font-medium leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-700 flex-shrink-0">•</span>
                      <span>Theo dõi accuracy metrics (khi backend sẵn sàng).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-700 flex-shrink-0">•</span>
                      <span>Rà soát phản hồi bị cắm cờ và xử lý cảnh báo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-700 flex-shrink-0">•</span>
                      <span>Quản lý cập nhật cơ sở tri thức để huấn luyện lại.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex rounded-xl border border-neutral-200/80 bg-white shadow-md overflow-hidden">
                <div className="w-1.5 sm:w-2 flex-shrink-0 bg-emerald-200/90" aria-hidden />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-100/90 shadow-sm">
                      <Shield className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900">
                      Kiểm duyệt nội dung
                    </h3>
                  </div>
                  <ul className="space-y-2 text-neutral-700 font-medium leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 flex-shrink-0">•</span>
                      <span>Giải quyết tranh chấp bản quyền.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 flex-shrink-0">•</span>
                      <span>Xóa nội dung vi phạm, không phù hợp.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 flex-shrink-0">•</span>
                      <span>
                        Quản lý thời hạn hạn chế công bố cho bản ghi nhạy cảm (khi backend sẵn
                        sàng).
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!expertDeletionApproveTarget}
        onClose={() => setExpertDeletionApproveTarget(null)}
        onConfirm={async () => {
          if (!expertDeletionApproveTarget) return;
          try {
            await accountDeletionService.approveExpertAccountDeletion(
              expertDeletionApproveTarget.expertId,
              user?.id,
              user?.role,
            );
            await recordingRequestService.addNotification({
              type: 'expert_account_deletion_approved',
              title: 'Đã duyệt xóa tài khoản Chuyên gia',
              body: `Tài khoản ${expertDeletionApproveTarget.expertFullName ?? expertDeletionApproveTarget.expertUsername} đã được xóa khỏi hệ thống.`,
              forRoles: [UserRole.EXPERT],
            });
            setExpertDeletionApproveTarget(null);
            setPendingExpertDeletions(accountDeletionService.getPendingExpertDeletionRequests());
            uiToast.success(
              notifyLine('Thành công', 'Đã duyệt xóa tài khoản Chuyên gia khỏi hệ thống.'),
            );
            void load();
          } catch (e) {
            uiToast.error(notifyLine('Lỗi', 'Không thể duyệt xóa tài khoản.'));
          }
        }}
        title="Duyệt xóa tài khoản Chuyên gia"
        message={
          expertDeletionApproveTarget
            ? `Bạn có chắc chắn duyệt xóa tài khoản "${expertDeletionApproveTarget.expertFullName ?? expertDeletionApproveTarget.expertUsername}" khỏi hệ thống?`
            : ''
        }
        description="Chuyên gia này sẽ bị xóa khỏi hệ thống. Nếu đang đăng nhập bằng tài khoản đó, họ sẽ bị đăng xuất. Hành động không thể hoàn tác."
        confirmText="Duyệt xóa"
        cancelText="Hủy"
        confirmButtonStyle="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full shadow-xl hover:shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95"
      />
    </div>
  );
}
