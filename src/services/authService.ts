import { api } from "./api";
import { User, LoginForm, RegisterForm, ApiResponse, UserRole } from "@/types";
import toast from "react-hot-toast";

export const authService = {
  // Login
  login: async (credentials: LoginForm) => {
    interface LoginResponse {
      token: string;
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
      avatarUrl?: string;
    }
    try {
      const response = await api.post<LoginResponse | { data: LoginResponse }>(
        "/auth/login",
        credentials,
      );
      const authData = (response as LoginResponse).token
        ? (response as LoginResponse)
        : (response as { data: LoginResponse }).data;
      if (authData && authData.token) {
        localStorage.setItem("access_token", authData.token);
        const user = {
          id: authData.id,
          username: authData.username,
          email: authData.email,
          fullName: authData.fullName,
          role: authData.role as UserRole,
          avatar: authData.avatarUrl,
          createdAt: "",
          updatedAt: "",
        };
        localStorage.setItem("user", JSON.stringify(user));
        return {
          success: true,
          data: {
            user: user,
            token: authData.token,
          },
          // message: "Login successful",
        };
      }
      throw new Error("Invalid response from server");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register
  register: async (data: RegisterForm) => {
    const response = await api.post<ApiResponse<unknown>>(
      "/auth/register",
      data,
    );
    return {
      success: true,
      data: response.data,
      message: "Registration successful",
    };
  },

  // Logout
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // Get current user
  getCurrentUser: async () => {
    return api.get<ApiResponse<User>>("/auth/me");
  },

  // Update profile
  updateProfile: async (data: Partial<User>) => {
    return api.put<ApiResponse<User>>("/auth/profile", data);
  },

  // Queue a pending profile update for retry when server becomes available
  queuePendingProfileUpdate: (
    userId: string | undefined,
    data: Partial<User>,
  ) => {
    if (!userId) return;
    try {
      const raw = localStorage.getItem("pending_profile_updates");
      const pending = raw
        ? (JSON.parse(raw) as Record<string, Partial<User>>)
        : {};
      pending[userId] = data;
      localStorage.setItem("pending_profile_updates", JSON.stringify(pending));
    } catch (err) {
      console.warn("Failed to queue pending profile update", err);
    }
  },

  // Try to process pending profile updates (called on login/fetchCurrentUser)
  processPendingProfileUpdates: async () => {
    try {
      const raw = localStorage.getItem("pending_profile_updates");
      const pending = raw
        ? (JSON.parse(raw) as Record<string, Partial<User>>)
        : {};
      const ids = Object.keys(pending);
      if (ids.length === 0) return;

      for (const id of ids) {
        try {
          const data = pending[id];
          const res = await api.put<ApiResponse<User>>("/auth/profile", data);
          if (res && res.data) {
            // Update local stored user and overrides
            const serverUser = res.data as User;
            localStorage.setItem("user", JSON.stringify(serverUser));
            const oRaw = localStorage.getItem("users_overrides");
            const overrides = oRaw
              ? (JSON.parse(oRaw) as Record<string, User>)
              : {};
            overrides[serverUser.id] = serverUser;
            localStorage.setItem("users_overrides", JSON.stringify(overrides));

            // Also propagate to localRecordings uploader info
            try {
              const rawLR = localStorage.getItem("localRecordings");
              if (rawLR) {
                const allLR = JSON.parse(rawLR) as any[];
                const updatedLR = allLR.map((r) => {
                  if (r.uploader?.id === serverUser.id) {
                    return {
                      ...r,
                      uploader: {
                        ...r.uploader,
                        username: serverUser.username,
                        email: serverUser.email ?? r.uploader?.email,
                        fullName: serverUser.fullName ?? r.uploader?.fullName,
                      },
                    };
                  }
                  return r;
                });
                localStorage.setItem(
                  "localRecordings",
                  JSON.stringify(updatedLR),
                );
              }
            } catch (err) {
              console.warn(
                "Failed to propagate serverUser to localRecordings",
                err,
              );
            }

            // Remove from pending
            delete pending[id];

            // Notify user that profile has been synced
            try {
              toast.success("Cập nhật hồ sơ đã được đồng bộ với server.");
            } catch (err) {
              /* noop */
            }
          }
        } catch (err) {
          // keep pending if failed
          console.warn("Failed to process pending profile update for", id, err);
        }
      }

      // Save remaining pending back
      localStorage.setItem("pending_profile_updates", JSON.stringify(pending));
    } catch (err) {
      console.warn("Failed to process pending profile updates", err);
    }
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    return api.post<ApiResponse<void>>("/auth/change-password", {
      oldPassword,
      newPassword,
    });
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("access_token");
  },

  // Demo login helper (for local demo/testing only)
  loginDemo: async (demoKey: string) => {
    // demoKey: 'contributor', 'expert_a', 'expert_b', 'expert_c'
    const mapping: Record<string, Partial<User>> = {
      contributor: {
        id: "contrib_demo",
        username: "contributor_demo",
        email: "contrib@example.com",
        fullName: "Người đóng góp (Demo)",
        role: UserRole.CONTRIBUTOR,
        avatar: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      expert_a: {
        id: "expert_a",
        username: "expertA",
        email: "expertA@example.com",
        fullName: "Expert A (Demo)",
        role: UserRole.EXPERT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      expert_b: {
        id: "expert_b",
        username: "expertB",
        email: "expertB@example.com",
        fullName: "Expert B (Demo)",
        role: UserRole.EXPERT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      expert_c: {
        id: "expert_c",
        username: "expertC",
        email: "expertC@example.com",
        fullName: "Expert C (Demo)",
        role: UserRole.EXPERT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    let demoUser = mapping[demoKey];
    if (!demoUser) throw new Error("Unknown demo user");

    // Merge overrides if user was edited locally previously
    try {
      const oRaw = localStorage.getItem("users_overrides");
      const overrides = oRaw
        ? (JSON.parse(oRaw) as Record<string, Partial<User>>)
        : {};
      if (demoUser.id && overrides[demoUser.id]) {
        demoUser = {
          ...demoUser,
          ...(overrides[demoUser.id] as Partial<User>),
        };
      }
    } catch (err) {
      // ignore parse errors
    }

    const token = `demo-token-${demoUser.id}`;
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(demoUser));

    // Also ensure overrides store includes this demo user so future logins keep it
    try {
      const oRaw2 = localStorage.getItem("users_overrides");
      const overrides2 = oRaw2
        ? (JSON.parse(oRaw2) as Record<string, User>)
        : {};
      if (demoUser.id) {
        overrides2[demoUser.id] = demoUser as User;
        localStorage.setItem("users_overrides", JSON.stringify(overrides2));
      }
    } catch (err) {
      // ignore
    }

    return {
      success: true,
      data: {
        user: demoUser,
        token,
      },
      // message: "Demo login successful",
    };
  },
};
