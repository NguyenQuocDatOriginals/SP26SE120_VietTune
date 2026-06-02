import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();
const putMock = vi.fn();

vi.mock('@/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/api')>();
  return {
    ...mod,
    apiFetchLoose: {
      GET: vi.fn(),
      POST: (...args: unknown[]) => postMock(...args),
      PUT: (...args: unknown[]) => putMock(...args),
      DELETE: vi.fn(),
      PATCH: vi.fn(),
    },
  };
});

vi.mock('@/services/storageService', () => ({
  getItem: vi.fn(() => null),
  setItem: vi.fn(() => Promise.resolve()),
  removeItem: vi.fn(() => Promise.resolve()),
  sessionSetItem: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/services/serviceLogger', () => ({
  logServiceError: vi.fn(),
  logServiceWarn: vi.fn(),
}));

function okEnvelope<T>(data: T, status = 200) {
  return {
    data,
    error: undefined,
    response: new Response(JSON.stringify(data), { status }),
  };
}

function errorEnvelope(status: number, body: unknown) {
  return {
    data: undefined,
    error: body,
    response: new Response(JSON.stringify(body), { status }),
  };
}

function getFormDataFromPutCall(index = 0): FormData {
  const init = putMock.mock.calls[index]?.[1] as { body?: FormData } | undefined;
  if (!init?.body || !(init.body instanceof FormData)) {
    throw new Error('Expected FormData body on PUT call');
  }
  return init.body;
}

describe('authService', () => {
  beforeEach(() => {
    postMock.mockReset();
    putMock.mockReset();
    vi.resetModules();
  });

  describe('login error mapping', () => {
    it('maps 401 to generic credential message', async () => {
      postMock.mockResolvedValueOnce(
        errorEnvelope(401, { message: 'Email hoặc mật khẩu không chính xác.' }),
      );

      const { authService } = await import('@/services/authService');

      await expect(
        authService.login({ email: 'user@example.com', password: 'wrong' }),
      ).rejects.toMatchObject({
        response: {
          status: 401,
          data: { message: 'Sai tài khoản hoặc mật khẩu' },
        },
      });
    });

    it('preserves 400 message when email is not confirmed', async () => {
      const beMessage = 'Vui lòng xác nhận email trước khi đăng nhập.';
      postMock.mockResolvedValueOnce(errorEnvelope(400, { message: beMessage }));

      const { authService } = await import('@/services/authService');

      await expect(
        authService.login({ email: 'user@example.com', password: 'secret' }),
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: { message: beMessage },
        },
      });
    });

    it('uses generic message for 400 without a body message', async () => {
      postMock.mockResolvedValueOnce(errorEnvelope(400, {}));

      const { authService } = await import('@/services/authService');

      await expect(
        authService.login({ email: 'user@example.com', password: 'secret' }),
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: { message: 'Sai tài khoản hoặc mật khẩu' },
        },
      });
    });
  });

  describe('resendConfirmationEmail', () => {
    it('sends PUT with multipart field email (lowercase)', async () => {
      putMock.mockResolvedValueOnce(okEnvelope({ isSuccess: true }));

      const { authService } = await import('@/services/authService');
      await authService.resendConfirmationEmail('  user@example.com  ');

      expect(putMock).toHaveBeenCalledWith('/api/Auth/resend-confirmation-email', {
        body: expect.any(FormData),
      });
      expect(getFormDataFromPutCall().get('email')).toBe('user@example.com');
    });

    it('rejects empty email without calling API', async () => {
      const { authService } = await import('@/services/authService');

      await expect(authService.resendConfirmationEmail('   ')).rejects.toMatchObject({
        response: { data: { message: 'Email không được để trống.' } },
      });
      expect(putMock).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('sends PUT with FormData Email, OTP, NewPassword (PascalCase)', async () => {
      putMock.mockResolvedValueOnce(okEnvelope('Mật khẩu đã được reset thành công.'));

      const { authService } = await import('@/services/authService');
      await authService.resetPassword('user@example.com', '123456', 'NewPass1');

      expect(putMock).toHaveBeenCalledWith('/api/Auth/reset-password', {
        body: expect.any(FormData),
      });
      const form = getFormDataFromPutCall();
      expect(form.get('Email')).toBe('user@example.com');
      expect(form.get('OTP')).toBe('123456');
      expect(form.get('NewPassword')).toBe('NewPass1');
    });
  });

  describe('forgotPassword', () => {
    it('sends PUT with FormData field Email (PascalCase)', async () => {
      putMock.mockResolvedValueOnce(okEnvelope('OK'));

      const { authService } = await import('@/services/authService');
      await authService.forgotPassword('user@example.com');

      expect(putMock).toHaveBeenCalledWith('/api/Auth/forgot-password', {
        body: expect.any(FormData),
      });
      expect(getFormDataFromPutCall().get('Email')).toBe('user@example.com');
    });
  });
});
