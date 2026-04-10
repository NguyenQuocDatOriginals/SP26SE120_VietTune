// [VI] Nhập (import) các phụ thuộc cho file.
import { create } from 'zustand';

// [VI] Nhập (import) các phụ thuộc cho file.
import { authService } from '@/services/authService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { getItem, setItem, removeItem } from '@/services/storageService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { User } from '@/types';

// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
interface AuthState {
// [VI] Thực thi một bước trong luồng xử lý.
  user: User | null;
// [VI] Thực thi một bước trong luồng xử lý.
  isAuthenticated: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  isLoading: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  error: string | null;
// [VI] Khai báo hàm/biểu thức hàm.
  login: (email: string, password: string) => Promise<void>;
// [VI] Khai báo hàm/biểu thức hàm.
  logout: () => void;
// [VI] Khai báo hàm/biểu thức hàm.
  setUser: (user: User | null) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  fetchCurrentUser: () => Promise<void>;
// [VI] Khai báo hàm/biểu thức hàm.
  clearError: () => void;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const useAuthStore = create<AuthState>((set) => ({
// [VI] Thực thi một bước trong luồng xử lý.
  user: authService.getStoredUser(),
// [VI] Thực thi một bước trong luồng xử lý.
  isAuthenticated: authService.isAuthenticated(),
// [VI] Thực thi một bước trong luồng xử lý.
  isLoading: false,
// [VI] Thực thi một bước trong luồng xử lý.
  error: null,

// [VI] Khai báo hàm/biểu thức hàm.
  login: async (email, password) => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ isLoading: true, error: null });
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const response = await authService.login({ email, password });
// [VI] Rẽ nhánh điều kiện (if).
      if (response.success && response.data) {
// [VI] Thực thi một bước trong luồng xử lý.
        set({
// [VI] Thực thi một bước trong luồng xử lý.
          user: response.data.user,
// [VI] Thực thi một bước trong luồng xử lý.
          isAuthenticated: true,
// [VI] Thực thi một bước trong luồng xử lý.
          isLoading: false,
// [VI] Thực thi một bước trong luồng xử lý.
          error: null,
// [VI] Thực thi một bước trong luồng xử lý.
        });
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (error) {
// [VI] Khai báo biến/hằng số.
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
// [VI] Thực thi một bước trong luồng xử lý.
      set({ isLoading: false, error: errorMessage });
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw error;
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  logout: () => {
// [VI] Thực thi một bước trong luồng xử lý.
    authService.logout();
// [VI] Thực thi một bước trong luồng xử lý.
    set({ user: null, isAuthenticated: false });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  setUser: (user) => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ user, isAuthenticated: !!user });

// [VI] Thực thi một bước trong luồng xử lý.
    // Persist user to IndexedDB so profile changes survive reloads/logouts
// [VI] Khai báo biến/hằng số.
    const persist = async () => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Rẽ nhánh điều kiện (if).
        if (user) {
// [VI] Thực thi một bước trong luồng xử lý.
          await setItem('user', JSON.stringify(user));

// [VI] Thực thi một bước trong luồng xử lý.
          // Ensure overrides store includes this user so future demo/logins retain edits
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
          try {
// [VI] Khai báo biến/hằng số.
            const oRaw = getItem('users_overrides');
// [VI] Khai báo biến/hằng số.
            const overrides = oRaw ? (JSON.parse(oRaw) as Record<string, User>) : {};
// [VI] Rẽ nhánh điều kiện (if).
            if (user.id) {
// [VI] Thực thi một bước trong luồng xử lý.
              overrides[user.id] = user;
// [VI] Thực thi một bước trong luồng xử lý.
              await setItem('users_overrides', JSON.stringify(overrides));
// [VI] Thực thi một bước trong luồng xử lý.
            }
// [VI] Thực thi một bước trong luồng xử lý.
          } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
            console.warn('Failed to update users_overrides', err);
// [VI] Thực thi một bước trong luồng xử lý.
          }

// [VI] Thực thi một bước trong luồng xử lý.
          // Do NOT load localRecordings here — it can be huge and cause OOM on login.
// [VI] Thực thi một bước trong luồng xử lý.
          // Propagation to localRecordings is done only in ProfilePage when user saves profile.

// [VI] Thực thi một bước trong luồng xử lý.
          // Attempt to process pending profile updates in background
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
          try {
// [VI] Rẽ nhánh điều kiện (if).
            if (authService.isAuthenticated()) {
// [VI] Thực thi một bước trong luồng xử lý.
              authService
// [VI] Thực thi một bước trong luồng xử lý.
                .processPendingProfileUpdates()
// [VI] Khai báo hàm/biểu thức hàm.
                .catch((e) => console.warn('processPendingProfileUpdates failed', e));
// [VI] Thực thi một bước trong luồng xử lý.
            }
// [VI] Thực thi một bước trong luồng xử lý.
          } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
            console.warn('Failed to trigger pending profile processing', err);
// [VI] Thực thi một bước trong luồng xử lý.
          }
// [VI] Thực thi một bước trong luồng xử lý.
        } else {
// [VI] Thực thi một bước trong luồng xử lý.
          await removeItem('user');
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
        console.warn('Failed to persist user', err);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
    void persist();
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  fetchCurrentUser: async () => {
// [VI] Rẽ nhánh điều kiện (if).
    if (!authService.isAuthenticated()) return;

// [VI] Thực thi một bước trong luồng xử lý.
    set({ isLoading: true });
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
    try {
// [VI] Khai báo biến/hằng số.
      const response = await authService.getCurrentUser();
// [VI] Rẽ nhánh điều kiện (if).
      if (response.success && response.data) {
// [VI] Thực thi một bước trong luồng xử lý.
        set({ user: response.data, isAuthenticated: true });
// [VI] Thực thi một bước trong luồng xử lý.
        // After fetching current user, try to process any pending profile updates
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
        try {
// [VI] Thực thi một bước trong luồng xử lý.
          authService
// [VI] Thực thi một bước trong luồng xử lý.
            .processPendingProfileUpdates()
// [VI] Khai báo hàm/biểu thức hàm.
            .catch((e) => console.warn('processPendingProfileUpdates failed', e));
// [VI] Thực thi một bước trong luồng xử lý.
        } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
          console.warn('Failed to trigger pending profile processing', err);
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    } catch (error) {
// [VI] Thực thi một bước trong luồng xử lý.
      // Do NOT clear user state on fetch failure — the token may still be valid
// [VI] Thực thi một bước trong luồng xử lý.
      // (e.g. backend temporarily unavailable, network issue). Keep the stored user
// [VI] Thực thi một bước trong luồng xử lý.
      // so the user isn't surprise-logged-out on every reload when the API is down.
// [VI] Khai báo biến/hằng số.
      const storedUser = authService.getStoredUser();
// [VI] Rẽ nhánh điều kiện (if).
      if (storedUser) {
// [VI] Thực thi một bước trong luồng xử lý.
        set({ user: storedUser, isAuthenticated: true });
// [VI] Thực thi một bước trong luồng xử lý.
      } else {
// [VI] Thực thi một bước trong luồng xử lý.
        set({ user: null, isAuthenticated: false });
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    } finally {
// [VI] Thực thi một bước trong luồng xử lý.
      set({ isLoading: false });
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  clearError: () => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ error: null });
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
}));
