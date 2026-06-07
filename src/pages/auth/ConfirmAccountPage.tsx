import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import AuthHeader from '@/components/auth/AuthHeader';
import Input from '@/components/common/Input';
import backgroundImage from '@/components/image/background.png';
import logo from '@/components/image/viettune_logo_img';
import { authService } from '@/services/authService';
import { ConfirmAccountForm } from '@/types';
import { uiToast, notifyLine } from '@/uiToast';

const RESEND_COOLDOWN_SEC = 60;

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) return data.message;
  }
  return fallback;
}

export default function ConfirmAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN_SEC);
  const [otpInlineError, setOtpInlineError] = useState('');
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [resendTargetEmail, setResendTargetEmail] = useState('');
  const backgroundAttachment = useMemo(() => {
    if (typeof navigator === 'undefined') return 'fixed';

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);

    return isIOS ? 'scroll' : 'fixed';
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ConfirmAccountForm>();
  const otpValue = watch('otp');
  const pendingEmail =
    location.state &&
    typeof location.state === 'object' &&
    'email' in location.state &&
    typeof (location.state as { email?: unknown }).email === 'string'
      ? (location.state as { email: string }).email
      : '';

  const displayEmail = pendingEmail || resendTargetEmail;

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (!otpInlineError) return;
    setOtpInlineError('');
  }, [otpValue, otpInlineError]);

  const onSubmit = async (data: ConfirmAccountForm) => {
    setIsLoading(true);
    setOtpInlineError('');
    try {
      const result = await authService.confirmEmail(data.otp.trim());

      const msg =
        result &&
        typeof result === 'object' &&
        'message' in result &&
        typeof (result as { message?: unknown }).message === 'string'
          ? (result as { message: string }).message
          : 'Xác thực tài khoản thành công.';
      uiToast.success(notifyLine('Thành công', msg));
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(
        error,
        'Xác thực thất bại. Vui lòng kiểm tra lại mã OTP.',
      );
      uiToast.error(notifyLine('Lỗi', errorMessage));
      setOtpInlineError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const email = (pendingEmail || fallbackEmail).trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      uiToast.error(notifyLine('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ.'));
      return;
    }

    setIsResending(true);
    try {
      const result = await authService.resendConfirmationEmail(email);
      const msg =
        result &&
        typeof result === 'object' &&
        'message' in result &&
        typeof (result as { message?: unknown }).message === 'string'
          ? (result as { message: string }).message
          : 'Mã OTP đã được gửi lại. Vui lòng kiểm tra email.';
      uiToast.success(notifyLine('Đã gửi', msg));
      if (!pendingEmail) {
        setResendTargetEmail(email);
      }
      setResendCountdown(RESEND_COOLDOWN_SEC);
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(
        error,
        'Không thể gửi lại mã OTP. Vui lòng thử lại.',
      );
      uiToast.error(notifyLine('Lỗi', errorMessage));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream-100">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment,
        }}
      />

      <div className="relative z-10">
        <AuthHeader />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4 pb-10 pt-6 sm:pb-12 sm:pt-8 lg:max-w-lg lg:pt-10">
        <div className="space-y-7 rounded-2xl border border-neutral-200/80 bg-surface-panel p-5 shadow-lg sm:space-y-8 sm:p-8">
          <div className="mb-7 flex flex-col items-center text-center sm:mb-8">
            <img
              src={logo}
              alt="VietTune Logo"
              className="mb-4 h-20 w-20 cursor-pointer rounded-2xl object-contain transition-opacity hover:opacity-80"
              onClick={() => navigate('/')}
              loading="eager"
              // @ts-expect-error -- fetchpriority is valid HTML but React 18 types use fetchPriority
              fetchpriority="high"
              decoding="async"
              width={80}
              height={80}
            />
            <h1 className="mb-2 text-2xl font-bold text-neutral-900">Xác thực tài khoản</h1>
            <p className="font-medium text-neutral-600">
              Nhập mã OTP gồm 6 chữ số đã gửi đến email của bạn để kích hoạt tài khoản.
            </p>
            {displayEmail ? (
              <p className="mt-3 text-sm text-neutral-500">
                Mã OTP đã gửi tới:{' '}
                <span className="font-semibold text-neutral-700">{displayEmail}</span>
              </p>
            ) : null}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Mã OTP"
                placeholder="Nhập mã OTP (6 chữ số)"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                className="rounded-xl border-neutral-300 py-3.5 text-center text-2xl tracking-[0.45em] font-semibold focus:border-primary-500 shadow-none ring-0 focus:ring-2 focus:ring-primary-500/20"
                {...register('otp', {
                  required: 'Mã OTP là bắt buộc',
                  validate: (v) =>
                    /^\d{6}$/.test(String(v ?? '').trim()) ||
                    'Mã OTP phải gồm đúng 6 chữ số',
                })}
                error={errors.otp?.message || otpInlineError}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-primary-600 py-3.5 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary-700 active:scale-[0.98] disabled:bg-neutral-400"
            >
              {isLoading ? 'Đang xác thực...' : 'Kích hoạt tài khoản'}
            </button>

            <div className="space-y-3 text-center">
              {resendCountdown > 0 ? (
                <p className="text-sm font-medium text-neutral-500">
                  Gửi lại mã sau {Math.floor(resendCountdown / 60)}:
                  {String(resendCountdown % 60).padStart(2, '0')}
                </p>
              ) : (
                <>
                  {!pendingEmail ? (
                    <Input
                      label="Địa chỉ email"
                      type="email"
                      autoComplete="email"
                      placeholder="Nhập email đã đăng ký"
                      value={fallbackEmail}
                      onChange={(e) => setFallbackEmail(e.target.value)}
                      className="rounded-xl border-neutral-300 py-3.5 text-left text-base tracking-normal focus:border-primary-500 shadow-none ring-0 focus:ring-2 focus:ring-primary-500/20"
                    />
                  ) : null}
                  <button
                    type="button"
                    disabled={isResending}
                    onClick={() => void handleResendOtp()}
                    className="text-sm font-semibold text-primary-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResending ? 'Đang gửi lại mã...' : 'Gửi lại mã OTP'}
                  </button>
                </>
              )}
            </div>

            <div className="pt-1 text-center sm:pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm font-semibold text-neutral-600 transition-colors hover:text-primary-600 hover:underline"
              >
                Trở về trang chủ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
