import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import BackButton from '@/components/common/BackButton';
import Input from '@/components/common/Input';
import logo from '@/components/image/viettune_logo_img';
import { authService } from '@/services/authService';
import { uiToast, notifyLine } from '@/uiToast';
import { validatePassword } from '@/utils/validation';

type ForgotStep = 'email' | 'reset';

type ForgotForm = {
  email: string;
};

type ResetForm = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) return data.message;
  }
  return fallback;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotStep>('email');
  const [savedEmail, setSavedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  const emailForm = useForm<ForgotForm>();
  const resetForm = useForm<ResetForm>();
  const watchedEmail = emailForm.watch('email');
  const newPassword = resetForm.watch('newPassword');

  const onEmailSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSavedEmail(data.email.trim());
      setStep('reset');
      uiToast.success(
        notifyLine(
          'Đã gửi',
          'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã OTP đặt lại mật khẩu.',
        ),
      );
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(
        error,
        'Không thể gửi yêu cầu. Vui lòng thử lại.',
      );
      uiToast.error(notifyLine('Lỗi', errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetForm) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(savedEmail, data.otp.trim(), data.newPassword);
      uiToast.success(
        notifyLine('Thành công', 'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập ngay.'),
      );
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(
        error,
        'Mã OTP không hợp lệ hoặc đã hết hạn.',
      );
      uiToast.error(notifyLine('Lỗi', errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!savedEmail) {
      setStep('email');
      return;
    }
    setIsResendingCode(true);
    try {
      await authService.forgotPassword(savedEmail);
      uiToast.success(
        notifyLine('Đã gửi', 'Mã OTP mới đã được gửi. Vui lòng kiểm tra email.'),
      );
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(
        error,
        'Không thể gửi lại mã. Vui lòng thử lại.',
      );
      uiToast.error(notifyLine('Lỗi', errorMessage));
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleBackToEmailStep = () => {
    setStep('email');
    emailForm.setValue('email', savedEmail);
    resetForm.reset();
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <BackButton />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="VietTune Logo"
            className="w-20 h-20 object-contain mb-4 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
            loading="eager"
            // @ts-expect-error -- fetchpriority is valid HTML but React 18 types use fetchPriority
            fetchpriority="high"
            decoding="async"
            width={80}
            height={80}
          />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Quên mật khẩu</h1>
          {step === 'email' ? (
            <p className="text-neutral-600 font-medium">
              Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu.
            </p>
          ) : (
            <>
              <p className="text-neutral-600 font-medium">
                Nhập mã OTP và mật khẩu mới cho tài khoản
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Mã OTP đã gửi tới:{' '}
                <span className="font-semibold text-neutral-700">{savedEmail}</span>
              </p>
            </>
          )}
        </div>

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="Nhập địa chỉ email"
                className="rounded-xl border-neutral-300 py-3.5 focus:border-primary-500 shadow-none ring-0 focus:ring-2 focus:ring-primary-500/20"
                {...emailForm.register('email', {
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Địa chỉ email không hợp lệ',
                  },
                })}
                error={emailForm.formState.errors.email?.message}
              />
            </div>

            <p className="text-center text-xs leading-relaxed text-neutral-500 px-2">
              Nếu bạn chưa xác nhận email, vui lòng{' '}
              <Link
                to="/confirm-account"
                state={watchedEmail?.trim() ? { email: watchedEmail.trim() } : undefined}
                className="font-semibold text-primary-600 hover:underline"
              >
                xác nhận tài khoản
              </Link>{' '}
              trước.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary-600 text-white text-lg font-bold rounded-full hover:bg-primary-700 transition-all shadow-md active:scale-[0.98] disabled:bg-neutral-400"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-sm font-semibold text-primary-600 hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Mã OTP"
                placeholder="Nhập mã OTP (6 chữ số)"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                className="rounded-xl border-neutral-300 py-3.5 text-center text-lg tracking-widest focus:border-primary-500 shadow-none ring-0 focus:ring-2 focus:ring-primary-500/20"
                {...resetForm.register('otp', {
                  required: 'Mã OTP là bắt buộc',
                  validate: (v) =>
                    /^\d{6}$/.test(String(v ?? '').trim()) ||
                    'Mã OTP phải gồm đúng 6 chữ số',
                })}
                error={resetForm.formState.errors.otp?.message}
              />

              <Input
                label="Mật khẩu mới"
                type="password"
                autoComplete="new-password"
                placeholder="Ít nhất 8 ký tự, chữ hoa, chữ thường và số"
                className="rounded-xl border-neutral-300 py-3.5 focus:border-primary-500 shadow-none ring-0 focus:ring-2 focus:ring-primary-500/20"
                {...resetForm.register('newPassword', {
                  required: 'Mật khẩu mới là bắt buộc',
                  validate: (v) => {
                    const value = v || '';
                    if (value.length < 8) {
                      return 'Mật khẩu mới phải ít nhất 8 ký tự';
                    }
                    const result = validatePassword(value);
                    return result.valid || result.errors[0];
                  },
                })}
                error={resetForm.formState.errors.newPassword?.message}
              />

              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                className="rounded-xl border-neutral-300 py-3.5 focus:border-primary-500 shadow-none ring-0 focus:ring-2 focus:ring-primary-500/20"
                {...resetForm.register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: (value) =>
                    value === newPassword || 'Mật khẩu không khớp',
                })}
                error={resetForm.formState.errors.confirmPassword?.message}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary-600 text-white text-lg font-bold rounded-full hover:bg-primary-700 transition-all shadow-md active:scale-[0.98] disabled:bg-neutral-400"
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>

            <div className="flex flex-col items-center gap-2 text-center pt-1">
              <button
                type="button"
                disabled={isResendingCode}
                onClick={() => void handleResendCode()}
                className="text-sm font-semibold text-primary-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResendingCode ? 'Đang gửi lại mã...' : 'Gửi lại mã OTP'}
              </button>
              <button
                type="button"
                onClick={handleBackToEmailStep}
                className="text-sm font-medium text-neutral-600 hover:text-primary-600 hover:underline"
              >
                Đổi email khác
              </button>
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="text-sm font-semibold text-primary-600 hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
