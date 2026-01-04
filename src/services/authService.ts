import { api } from "./api";
import { User, LoginForm, RegisterForm, ApiResponse } from "@/types";

export const authService = {
  // Login
  login: async (credentials: LoginForm) => {
    try {
      const response = await api.post<any>("/auth/login", credentials);
      const authData = response.data;
      if (authData && authData.token) {
        localStorage.setItem("access_token", authData.token);
        const user = {
          id: authData.id,
          username: authData.username,
          email: authData.email,
          fullName: authData.fullName,
          role: authData.role,
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
          message: "Login successful",
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
    const response = await api.post<ApiResponse<any>>("/auth/register", data);
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
};
