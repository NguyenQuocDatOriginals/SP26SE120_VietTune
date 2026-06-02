import { UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import BackButton from '@/components/common/BackButton';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AdminBreadcrumbs from '@/features/admin/shell/AdminBreadcrumbs';
import { buildAdminBreadcrumbItems } from '@/features/admin/shell/adminBreadcrumbUtils';
import { adminApi } from '@/services/adminApi';
import { getItem, setItem } from '@/services/storageService';
import { useAuthStore } from '@/stores/authStore';
import { UserRole, type User } from '@/types';
import { uiToast, notifyLine } from '@/uiToast';
import { validatePassword } from '@/utils/validation';

export default function CreateExpertPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expertForm, setExpertForm] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [expertFormErrors, setExpertFormErrors] = useState<{
    username?: string;
    email?: string;
    fullName?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  /** One-time on-screen only (not persisted) so admin can copy the initial password. */
  const [expertPasswordRevealOnce, setExpertPasswordRevealOnce] = useState<{
    username: string;
    email: string;
    password: string;
  } | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAdmin) {
      navigate('/403', { replace: true });
    }
  }, [isAdmin, isAuthLoading, navigate]);

  const adminBreadcrumbItems = useMemo(
    () => buildAdminBreadcrumbItems(location.pathname, null),
    [location.pathname],
  );

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const validateExpertForm = (): boolean => {
    const errors: {
      username?: string;
      email?: string;
      fullName?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    if (!expertForm.username.trim()) {
      errors.username = 'Tên người dùng là bắt buộc';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(expertForm.username.trim())) {
      errors.username = 'Tên người dùng 3-20 ký tự, chỉ chữ, số và dấu gạch dưới';
    }
    if (!expertForm.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(expertForm.email.trim())) {
      errors.email = 'Địa chỉ email không hợp lệ';
    }
    if (!expertForm.fullName.trim()) {
      errors.fullName = 'Họ và tên là bắt buộc';
    }
    if (!expertForm.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else {
      const pw = validatePassword(expertForm.password);
      if (!pw.valid) errors.password = pw.errors[0];
    }
    if (!expertForm.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (expertForm.confirmPassword !== expertForm.password) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }
    setExpertFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const writeDevOverride = (username: string) => {
    if (!import.meta.env.DEV) return;
    const newExpertId = `expert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newExpert: User = {
      id: newExpertId,
      username,
      email: expertForm.email.trim(),
      fullName: expertForm.fullName.trim(),
      role: UserRole.EXPERT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const oRaw = getItem('users_overrides');
    const overrides = oRaw ? (JSON.parse(oRaw) as Record<string, User>) : {};
    overrides[newExpertId] = newExpert;
    void setItem('users_overrides', JSON.stringify(overrides));
  };

  const handleCreateExpert = async () => {
    if (!validateExpertForm()) return;

    setIsSubmitting(true);
    try {
      const username = expertForm.username.trim();
      const result = await adminApi.createExpert({
        email: expertForm.email.trim(),
        password: expertForm.password,
        fullName: expertForm.fullName.trim(),
      });

      writeDevOverride(username);

      setExpertPasswordRevealOnce({
        username,
        email: expertForm.email.trim(),
        password: expertForm.password,
      });

      setExpertForm({
        username: '',
        email: '',
        fullName: '',
        password: '',
        confirmPassword: '',
      });
      setExpertFormErrors({});

      uiToast.success(
        notifyLine(
          'Thành công',
          result.message ?? `Đã tạo tài khoản Chuyên gia "${username}" trên máy chủ.`,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo tài khoản Chuyên gia.';
      uiToast.error(notifyLine('Lỗi', message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <AdminBreadcrumbs items={adminBreadcrumbItems} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-900 min-w-0">
            Cấp tài khoản Chuyên gia
          </h1>
          <BackButton />
        </div>

        {expertPasswordRevealOnce && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
          >
            <p className="mb-2 font-semibold">
              Mật khẩu khởi tạo (chỉ hiển thị trên màn hình này, không lưu trình duyệt)
            </p>
            <p className="mb-1">
              <span className="text-neutral-600">Người dùng:</span>{' '}
              <span className="font-medium">{expertPasswordRevealOnce.username}</span>
            </p>
            <p className="mb-1">
              <span className="text-neutral-600">Email đăng nhập:</span>{' '}
              <span className="font-medium">{expertPasswordRevealOnce.email}</span>
            </p>
            <p className="mb-3 break-all font-mono text-base">{expertPasswordRevealOnce.password}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpertPasswordRevealOnce(null)}
              >
                Ẩn
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => void navigate('/admin?section=users')}
              >
                Về quản lý người dùng
              </Button>
            </div>
          </div>
        )}

        <Card variant="bordered" className="p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-3">
            <div className="p-2 bg-primary-100/90 rounded-lg shadow-sm">
              <UserPlus className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
            </div>
            Tạo tài khoản mới
          </h2>
          <p className="text-neutral-700 font-medium leading-relaxed mb-6">
            Tạo tài khoản Chuyên gia mới trên máy chủ để họ có thể đăng nhập và kiểm duyệt bản thu âm
            nhạc truyền thống. Đăng nhập bằng <strong>email</strong> và mật khẩu bên dưới.
          </p>
          <div className="max-w-2xl">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tên hiển thị (tham chiếu nội bộ)"
                  value={expertForm.username}
                  onChange={(e) => {
                    setExpertForm({ ...expertForm, username: e.target.value });
                    if (expertFormErrors.username) {
                      setExpertFormErrors({ ...expertFormErrors, username: undefined });
                    }
                  }}
                  error={expertFormErrors.username}
                  required
                  placeholder="Nhập tên người dùng"
                />
                <Input
                  label="Email"
                  type="email"
                  value={expertForm.email}
                  onChange={(e) => {
                    setExpertForm({ ...expertForm, email: e.target.value });
                    if (expertFormErrors.email) {
                      setExpertFormErrors({ ...expertFormErrors, email: undefined });
                    }
                  }}
                  error={expertFormErrors.email}
                  required
                  placeholder="Nhập địa chỉ email"
                />
              </div>
              <Input
                label="Họ và tên"
                value={expertForm.fullName}
                onChange={(e) => {
                  setExpertForm({ ...expertForm, fullName: e.target.value });
                  if (expertFormErrors.fullName) {
                    setExpertFormErrors({ ...expertFormErrors, fullName: undefined });
                  }
                }}
                error={expertFormErrors.fullName}
                required
                placeholder="Nhập họ và tên"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Mật khẩu"
                  type="password"
                  value={expertForm.password}
                  onChange={(e) => {
                    setExpertForm({ ...expertForm, password: e.target.value });
                    if (expertFormErrors.password) {
                      setExpertFormErrors({ ...expertFormErrors, password: undefined });
                    }
                  }}
                  error={expertFormErrors.password}
                  required
                  placeholder="Tối thiểu 6 ký tự, chữ hoa, chữ thường, chữ số"
                />
                <Input
                  label="Xác nhận mật khẩu"
                  type="password"
                  value={expertForm.confirmPassword}
                  onChange={(e) => {
                    setExpertForm({ ...expertForm, confirmPassword: e.target.value });
                    if (expertFormErrors.confirmPassword) {
                      setExpertFormErrors({ ...expertFormErrors, confirmPassword: undefined });
                    }
                  }}
                  error={expertFormErrors.confirmPassword}
                  required
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => void handleCreateExpert()}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <UserPlus className="h-5 w-5" strokeWidth={2.5} />
                  {isSubmitting ? 'Đang tạo…' : 'Tạo tài khoản Chuyên gia'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={() => {
                    setExpertForm({
                      username: '',
                      email: '',
                      fullName: '',
                      password: '',
                      confirmPassword: '',
                    });
                    setExpertFormErrors({});
                  }}
                >
                  Đặt lại
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
