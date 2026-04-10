// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from './api';

// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceError, logServiceWarn } from '@/services/serviceLogger';
// [VI] Nhập (import) các phụ thuộc cho file.
import { getItem, setItem, removeItem, sessionSetItem } from '@/services/storageService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { User, LoginForm, RegisterForm, ApiResponse, UserRole } from '@/types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { uiToast } from '@/uiToast';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const authService = {
// [VI] Thực thi một bước trong luồng xử lý.
  // Login
// [VI] Khai báo hàm/biểu thức hàm.
  login: async (credentials: LoginForm) => {
// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
    interface LoginResponse {
// [VI] Thực thi một bước trong luồng xử lý.
      token: string;
// [VI] Thực thi một bước trong luồng xử lý.
      userId?: string | number;
// [VI] Thực thi một bước trong luồng xử lý.
      id?: string | number;
// [VI] Thực thi một bước trong luồng xử lý.
      role: string;
// [VI] Thực thi một bước trong luồng xử lý.
      fullName: string;
// [VI] Thực thi một bước trong luồng xử lý.
      phoneNumber: string;
// [VI] Thực thi một bước trong luồng xử lý.
      isActive: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const response = await api.post<LoginResponse | { data: LoginResponse }>(
// [VI] Thực thi một bước trong luồng xử lý.
        '/auth/login',
// [VI] Thực thi một bước trong luồng xử lý.
        credentials,
// [VI] Thực thi một bước trong luồng xử lý.
      );

// [VI] Thực thi một bước trong luồng xử lý.
      // Handle both { token, ... } and { data: { token, ... } } structures
// [VI] Khai báo biến/hằng số.
      const authData: LoginResponse =
// [VI] Thực thi một bước trong luồng xử lý.
        response &&
// [VI] Thực thi một bước trong luồng xử lý.
        typeof response === 'object' &&
// [VI] Thực thi một bước trong luồng xử lý.
        'token' in response &&
// [VI] Thực thi một bước trong luồng xử lý.
        (response as LoginResponse).token
// [VI] Thực thi một bước trong luồng xử lý.
          ? (response as LoginResponse)
// [VI] Thực thi một bước trong luồng xử lý.
          : (response as { data: LoginResponse }).data;

// [VI] Rẽ nhánh điều kiện (if).
      if (authData && authData.token) {
// [VI] Thực thi một bước trong luồng xử lý.
        await setItem('access_token', authData.token);

// [VI] Thực thi một bước trong luồng xử lý.
        // Use userId or id, ensuring it's a string
// [VI] Khai báo biến/hằng số.
        const userId = (authData.userId || authData.id || '').toString();

// [VI] Khai báo biến/hằng số.
        const user: User = {
// [VI] Thực thi một bước trong luồng xử lý.
          id: userId,
// [VI] Thực thi một bước trong luồng xử lý.
          username: credentials.email,
// [VI] Thực thi một bước trong luồng xử lý.
          email: credentials.email,
// [VI] Thực thi một bước trong luồng xử lý.
          fullName: authData.fullName,
// [VI] Thực thi một bước trong luồng xử lý.
          role: authData.role as UserRole,
// [VI] Thực thi một bước trong luồng xử lý.
          phoneNumber: authData.phoneNumber,
// [VI] Thực thi một bước trong luồng xử lý.
          isActive: authData.isActive,
// [VI] Thực thi một bước trong luồng xử lý.
          isEmailConfirmed: true,
// [VI] Thực thi một bước trong luồng xử lý.
          createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
          updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
        };
// [VI] Thực thi một bước trong luồng xử lý.
        await setItem('user', JSON.stringify(user));
// [VI] Trả về kết quả từ hàm.
        return {
// [VI] Thực thi một bước trong luồng xử lý.
          success: true,
// [VI] Thực thi một bước trong luồng xử lý.
          data: {
// [VI] Thực thi một bước trong luồng xử lý.
            user: user,
// [VI] Thực thi một bước trong luồng xử lý.
            token: authData.token,
// [VI] Thực thi một bước trong luồng xử lý.
          },
// [VI] Thực thi một bước trong luồng xử lý.
          // message: "Login successful",
// [VI] Thực thi một bước trong luồng xử lý.
        };
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw new Error('Invalid response from server');
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (error) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Login error', error);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw error;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Register
// [VI] Khai báo hàm/biểu thức hàm.
  register: async (data: RegisterForm) => {
// [VI] Khai báo biến/hằng số.
    const response = await api.post<ApiResponse<unknown>>('/auth/register', data);
// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      success: true,
// [VI] Thực thi một bước trong luồng xử lý.
      data: response.data,
// [VI] Thực thi một bước trong luồng xử lý.
      message: 'Registration successful',
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Register Researcher
// [VI] Khai báo hàm/biểu thức hàm.
  registerResearcher: async (data: import('@/types').RegisterResearcherForm) => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const response = await api.post<ApiResponse<unknown>>('/auth/register-researcher', data);
// [VI] Trả về kết quả từ hàm.
      return response;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (error: unknown) {
// [VI] Khai báo biến/hằng số.
      const axiosLike = error as {
// [VI] Thực thi một bước trong luồng xử lý.
        response?: { data?: { message?: string } };
// [VI] Thực thi một bước trong luồng xử lý.
        message?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      };
// [VI] Khai báo biến/hằng số.
      const errorMessage =
// [VI] Thực thi một bước trong luồng xử lý.
        axiosLike.response?.data?.message || axiosLike.message || 'Đăng ký nhà nghiên cứu thất bại';
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Register researcher error', errorMessage);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw error;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Verify OTP / Confirm Account (POST - keeping for compatibility if needed, but adding confirmEmail)
// [VI] Khai báo hàm/biểu thức hàm.
  verifyOtp: async (email: string, otp: string) => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const response = await api.post<ApiResponse<unknown>>('/auth/verify-otp', {
// [VI] Thực thi một bước trong luồng xử lý.
        email,
// [VI] Thực thi một bước trong luồng xử lý.
        otp,
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Trả về kết quả từ hàm.
      return response;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (error) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Verify OTP error', error);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw error;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Confirm Email (GET)
// [VI] Khai báo hàm/biểu thức hàm.
  confirmEmail: async (token: string) => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const response = await api.get<ApiResponse<unknown>>(`/auth/confirm-email`, {
// [VI] Thực thi một bước trong luồng xử lý.
        params: { token },
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Trả về kết quả từ hàm.
      return response;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (error) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Confirm email error', error);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw error;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Logout: only clear storage. Navigation to /login is handled by the caller
// [VI] Thực thi một bước trong luồng xử lý.
  // so we avoid a full page reload and a brief blank screen flash.
// [VI] Khai báo hàm/biểu thức hàm.
  logout: async () => {
// [VI] Thực thi một bước trong luồng xử lý.
    await removeItem('access_token');
// [VI] Thực thi một bước trong luồng xử lý.
    await removeItem('user');
// [VI] Thực thi một bước trong luồng xử lý.
    await sessionSetItem('fromLogout', '1');
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Get current user
// [VI] Khai báo hàm/biểu thức hàm.
  getCurrentUser: async () => {
// [VI] Trả về kết quả từ hàm.
    return api.get<ApiResponse<User>>('/auth/me');
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Update profile
// [VI] Khai báo hàm/biểu thức hàm.
  updateProfile: async (data: Partial<User>) => {
// [VI] Trả về kết quả từ hàm.
    return api.put<ApiResponse<User>>('/auth/profile', data);
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Queue a pending profile update for retry when server becomes available
// [VI] Khai báo hàm/biểu thức hàm.
  queuePendingProfileUpdate: async (userId: string | undefined, data: Partial<User>) => {
// [VI] Rẽ nhánh điều kiện (if).
    if (!userId) return;
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const raw = getItem('pending_profile_updates');
// [VI] Khai báo biến/hằng số.
      const pending = raw ? (JSON.parse(raw) as Record<string, Partial<User>>) : {};
// [VI] Thực thi một bước trong luồng xử lý.
      pending[userId] = data;
// [VI] Thực thi một bước trong luồng xử lý.
      await setItem('pending_profile_updates', JSON.stringify(pending));
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn('Failed to queue pending profile update', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Try to process pending profile updates (called on login/fetchCurrentUser)
// [VI] Khai báo hàm/biểu thức hàm.
  processPendingProfileUpdates: async () => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const raw = getItem('pending_profile_updates');
// [VI] Khai báo biến/hằng số.
      const pending = raw ? (JSON.parse(raw) as Record<string, Partial<User>>) : {};
// [VI] Khai báo biến/hằng số.
      const ids = Object.keys(pending);
// [VI] Rẽ nhánh điều kiện (if).
      if (ids.length === 0) return;

// [VI] Vòng lặp (for).
      for (const id of ids) {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
        try {
// [VI] Khai báo biến/hằng số.
          const data = pending[id];
// [VI] Khai báo biến/hằng số.
          const res = await api.put<ApiResponse<User>>('/auth/profile', data);
// [VI] Rẽ nhánh điều kiện (if).
          if (res && res.data) {
// [VI] Thực thi một bước trong luồng xử lý.
            // Update local stored user and overrides
// [VI] Khai báo biến/hằng số.
            const serverUser = res.data as User;
// [VI] Thực thi một bước trong luồng xử lý.
            await setItem('user', JSON.stringify(serverUser));
// [VI] Khai báo biến/hằng số.
            const oRaw = getItem('users_overrides');
// [VI] Khai báo biến/hằng số.
            const overrides = oRaw ? (JSON.parse(oRaw) as Record<string, User>) : {};
// [VI] Thực thi một bước trong luồng xử lý.
            overrides[serverUser.id] = serverUser;
// [VI] Thực thi một bước trong luồng xử lý.
            await setItem('users_overrides', JSON.stringify(overrides));

// [VI] Thực thi một bước trong luồng xử lý.
            // Do NOT load localRecordings here — it can be huge and cause OOM.
// [VI] Thực thi một bước trong luồng xử lý.
            // Propagation to localRecordings is done only in ProfilePage when user saves profile.

// [VI] Thực thi một bước trong luồng xử lý.
            // Remove from pending
// [VI] Thực thi một bước trong luồng xử lý.
            delete pending[id];

// [VI] Thực thi một bước trong luồng xử lý.
            // Notify user that profile has been synced
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
            try {
// [VI] Thực thi một bước trong luồng xử lý.
              uiToast.success('auth.profile.sync_success');
// [VI] Thực thi một bước trong luồng xử lý.
            } catch {
// [VI] Thực thi một bước trong luồng xử lý.
              /* noop */
// [VI] Thực thi một bước trong luồng xử lý.
            }
// [VI] Thực thi một bước trong luồng xử lý.
          }
// [VI] Thực thi một bước trong luồng xử lý.
        } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
          // keep pending if failed
// [VI] Thực thi một bước trong luồng xử lý.
          logServiceWarn(`Failed to process pending profile update for ${id}`, err);
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Thực thi một bước trong luồng xử lý.
      // Save remaining pending back
// [VI] Thực thi một bước trong luồng xử lý.
      await setItem('pending_profile_updates', JSON.stringify(pending));
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn('Failed to process pending profile updates', err);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Change password
// [VI] Khai báo hàm/biểu thức hàm.
  changePassword: async (oldPassword: string, newPassword: string) => {
// [VI] Trả về kết quả từ hàm.
    return api.post<ApiResponse<void>>('/auth/change-password', {
// [VI] Thực thi một bước trong luồng xử lý.
      oldPassword,
// [VI] Thực thi một bước trong luồng xử lý.
      newPassword,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Get stored user — safe JSON parse to avoid app crash on corrupt storage
// [VI] Khai báo hàm/biểu thức hàm.
  getStoredUser: (): User | null => {
// [VI] Khai báo biến/hằng số.
    const userStr = getItem('user');
// [VI] Rẽ nhánh điều kiện (if).
    if (!userStr) return null;
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Trả về kết quả từ hàm.
      return JSON.parse(userStr) as User;
// [VI] Thực thi một bước trong luồng xử lý.
    } catch {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn('[authService] Corrupt user data in storage, clearing.');
// [VI] Thực thi một bước trong luồng xử lý.
      void removeItem('user');
// [VI] Trả về kết quả từ hàm.
      return null;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Check if authenticated
// [VI] Khai báo hàm/biểu thức hàm.
  isAuthenticated: (): boolean => {
// [VI] Trả về kết quả từ hàm.
    return !!getItem('access_token');
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Thực thi một bước trong luồng xử lý.
  // Demo login helper — available in DEV only to prevent misuse in production
// [VI] Khai báo hàm/biểu thức hàm.
  loginDemo: async (demoKey: string) => {
// [VI] Rẽ nhánh điều kiện (if).
    if (!import.meta.env.DEV) {
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw new Error('loginDemo is not available in production.');
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
    // demoKey: 'contributor', 'expert_a', 'expert_b', 'expert_c'
// [VI] Khai báo biến/hằng số.
    const mapping: Record<string, Partial<User>> = {
// [VI] Thực thi một bước trong luồng xử lý.
      contributor: {
// [VI] Thực thi một bước trong luồng xử lý.
        id: 'contrib_demo',
// [VI] Thực thi một bước trong luồng xử lý.
        username: 'contributor_demo',
// [VI] Thực thi một bước trong luồng xử lý.
        email: 'contrib@example.com',
// [VI] Thực thi một bước trong luồng xử lý.
        fullName: 'Người đóng góp (Demo)',
// [VI] Thực thi một bước trong luồng xử lý.
        role: UserRole.CONTRIBUTOR,
// [VI] Thực thi một bước trong luồng xử lý.
        avatar: undefined,
// [VI] Thực thi một bước trong luồng xử lý.
        isEmailConfirmed: true,
// [VI] Thực thi một bước trong luồng xử lý.
        isActive: true,
// [VI] Thực thi một bước trong luồng xử lý.
        createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
        updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      expert_a: {
// [VI] Thực thi một bước trong luồng xử lý.
        id: 'expert_a',
// [VI] Thực thi một bước trong luồng xử lý.
        username: 'expertA',
// [VI] Thực thi một bước trong luồng xử lý.
        email: 'expertA@example.com',
// [VI] Thực thi một bước trong luồng xử lý.
        fullName: 'Expert A (Demo)',
// [VI] Thực thi một bước trong luồng xử lý.
        role: UserRole.EXPERT,
// [VI] Thực thi một bước trong luồng xử lý.
        isEmailConfirmed: true,
// [VI] Thực thi một bước trong luồng xử lý.
        isActive: true,
// [VI] Thực thi một bước trong luồng xử lý.
        createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
        updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      expert_b: {
// [VI] Thực thi một bước trong luồng xử lý.
        id: 'expert_b',
// [VI] Thực thi một bước trong luồng xử lý.
        username: 'expertB',
// [VI] Thực thi một bước trong luồng xử lý.
        email: 'expertB@example.com',
// [VI] Thực thi một bước trong luồng xử lý.
        fullName: 'Expert B (Demo)',
// [VI] Thực thi một bước trong luồng xử lý.
        role: UserRole.EXPERT,
// [VI] Thực thi một bước trong luồng xử lý.
        isEmailConfirmed: true,
// [VI] Thực thi một bước trong luồng xử lý.
        isActive: true,
// [VI] Thực thi một bước trong luồng xử lý.
        createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
        updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      expert_c: {
// [VI] Thực thi một bước trong luồng xử lý.
        id: 'expert_c',
// [VI] Thực thi một bước trong luồng xử lý.
        username: 'expertC',
// [VI] Thực thi một bước trong luồng xử lý.
        email: 'expertC@example.com',
// [VI] Thực thi một bước trong luồng xử lý.
        fullName: 'Expert C (Demo)',
// [VI] Thực thi một bước trong luồng xử lý.
        role: UserRole.EXPERT,
// [VI] Thực thi một bước trong luồng xử lý.
        isEmailConfirmed: true,
// [VI] Thực thi một bước trong luồng xử lý.
        isActive: true,
// [VI] Thực thi một bước trong luồng xử lý.
        createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
        updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      admin: {
// [VI] Thực thi một bước trong luồng xử lý.
        id: 'admin_demo',
// [VI] Thực thi một bước trong luồng xử lý.
        username: 'admin_demo',
// [VI] Thực thi một bước trong luồng xử lý.
        email: 'admin@example.com',
// [VI] Thực thi một bước trong luồng xử lý.
        fullName: 'Administrator (Demo)',
// [VI] Thực thi một bước trong luồng xử lý.
        role: UserRole.ADMIN,
// [VI] Thực thi một bước trong luồng xử lý.
        isEmailConfirmed: true,
// [VI] Thực thi một bước trong luồng xử lý.
        isActive: true,
// [VI] Thực thi một bước trong luồng xử lý.
        createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
        updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      researcher: {
// [VI] Thực thi một bước trong luồng xử lý.
        id: 'researcher_demo',
// [VI] Thực thi một bước trong luồng xử lý.
        username: 'researcher_demo',
// [VI] Thực thi một bước trong luồng xử lý.
        email: 'researcher@example.com',
// [VI] Thực thi một bước trong luồng xử lý.
        fullName: 'Nhà nghiên cứu (Demo)',
// [VI] Thực thi một bước trong luồng xử lý.
        role: UserRole.RESEARCHER,
// [VI] Thực thi một bước trong luồng xử lý.
        isEmailConfirmed: true,
// [VI] Thực thi một bước trong luồng xử lý.
        isActive: true,
// [VI] Thực thi một bước trong luồng xử lý.
        createdAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
        updatedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
    };

// [VI] Khai báo biến/hằng số.
    let demoUser = mapping[demoKey];
// [VI] Rẽ nhánh điều kiện (if).
    if (!demoUser) throw new Error('Unknown demo user');

// [VI] Thực thi một bước trong luồng xử lý.
    // Merge overrides if user was edited locally previously
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const oRaw = getItem('users_overrides');
// [VI] Khai báo biến/hằng số.
      const overrides = oRaw ? (JSON.parse(oRaw) as Record<string, Partial<User>>) : {};
// [VI] Rẽ nhánh điều kiện (if).
      if (demoUser.id && overrides[demoUser.id]) {
// [VI] Thực thi một bước trong luồng xử lý.
        demoUser = {
// [VI] Thực thi một bước trong luồng xử lý.
          ...demoUser,
// [VI] Thực thi một bước trong luồng xử lý.
          ...(overrides[demoUser.id] as Partial<User>),
// [VI] Thực thi một bước trong luồng xử lý.
        };
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      // ignore parse errors
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Khai báo biến/hằng số.
    const token = `demo-token-${demoUser.id}`;
// [VI] Thực thi một bước trong luồng xử lý.
    await setItem('access_token', token);
// [VI] Thực thi một bước trong luồng xử lý.
    await setItem('user', JSON.stringify(demoUser));

// [VI] Thực thi một bước trong luồng xử lý.
    // Also ensure overrides store includes this demo user so future logins keep it
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const oRaw2 = getItem('users_overrides');
// [VI] Khai báo biến/hằng số.
      const overrides2 = oRaw2 ? (JSON.parse(oRaw2) as Record<string, User>) : {};
// [VI] Rẽ nhánh điều kiện (if).
      if (demoUser.id) {
// [VI] Thực thi một bước trong luồng xử lý.
        overrides2[demoUser.id] = demoUser as User;
// [VI] Thực thi một bước trong luồng xử lý.
        await setItem('users_overrides', JSON.stringify(overrides2));
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
      // ignore
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      success: true,
// [VI] Thực thi một bước trong luồng xử lý.
      data: {
// [VI] Thực thi một bước trong luồng xử lý.
        user: demoUser,
// [VI] Thực thi một bước trong luồng xử lý.
        token,
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      // message: "Demo login successful",
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
