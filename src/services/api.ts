import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config/constants";
import { getItem, removeItem } from "@/services/storageService";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Track whether a 401 redirect is in progress to avoid loops
let isRedirectingToLogin = false;

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !isRedirectingToLogin) {
      // Only auto-logout if the user has no stored token (genuine auth failure)
      // or if the failing URL is an auth endpoint (login, refresh, etc.)
      const url = error.config?.url ?? "";
      const isAuthEndpoint = url.includes("/auth/") || url.includes("/Auth/");

      // If it's an auth endpoint failure (e.g. login with bad creds), just throw
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // For data endpoints: only redirect if we have NO stored token at all
      // (i.e., the user is genuinely not logged in, not just a stale token)
      const hasToken = !!getItem("access_token");
      if (!hasToken) {
        isRedirectingToLogin = true;
        await removeItem("access_token");
        await removeItem("user");
        const path =
          typeof window !== "undefined" ? window.location.pathname : "";
        const redirect =
          path && path !== "/login"
            ? `?redirect=${encodeURIComponent(path)}`
            : "";
        window.location.href = `/login${redirect}`;
      }
      // If we DO have a token but got 401, the token may be expired or the
      // endpoint may not support the current user's role — just throw the error
      // and let the component display an error message instead of force-logging out.
    }
    return Promise.reject(error);
  },
);

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;
