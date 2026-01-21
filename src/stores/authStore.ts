import { create } from "zustand";
import { User } from "@/types";
import { authService } from "@/services/authService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (usernameOrEmail, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ usernameOrEmail, password });
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });

    // Persist user to localStorage so profile changes survive reloads/logouts
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));

        // Ensure overrides store includes this user so future demo/logins retain edits
        try {
          const oRaw = localStorage.getItem("users_overrides");
          const overrides = oRaw
            ? (JSON.parse(oRaw) as Record<string, User>)
            : {};
          if (user.id) {
            overrides[user.id] = user;
            localStorage.setItem("users_overrides", JSON.stringify(overrides));
          }
        } catch (err) {
          // ignore
          console.warn("Failed to update users_overrides", err);
        }

        // Propagate username/email/fullName changes to localRecordings uploader info
        try {
          const raw = localStorage.getItem("localRecordings");
          if (raw) {
            const all = JSON.parse(raw) as any[];
            const updated = all.map((r) => {
              if (r.uploader?.id === user.id) {
                return {
                  ...r,
                  uploader: {
                    ...r.uploader,
                    username: user.username,
                    email: user.email ?? r.uploader?.email,
                    fullName: user.fullName ?? r.uploader?.fullName,
                  },
                };
              }
              return r;
            });
            localStorage.setItem("localRecordings", JSON.stringify(updated));
          }
        } catch (err) {
          console.warn("Failed to propagate user to localRecordings", err);
        }

        // Attempt to process pending profile updates in background
        try {
          if (authService.isAuthenticated()) {
            authService
              .processPendingProfileUpdates()
              .catch((e) =>
                console.warn("processPendingProfileUpdates failed", e),
              );
          }
        } catch (err) {
          console.warn("Failed to trigger pending profile processing", err);
        }
      } else {
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.warn("Failed to persist user", err);
    }
  },

  fetchCurrentUser: async () => {
    if (!authService.isAuthenticated()) return;

    set({ isLoading: true });
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        set({ user: response.data, isAuthenticated: true });
        // After fetching current user, try to process any pending profile updates
        try {
          authService
            .processPendingProfileUpdates()
            .catch((e) =>
              console.warn("processPendingProfileUpdates failed", e),
            );
        } catch (err) {
          console.warn("Failed to trigger pending profile processing", err);
        }
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
