import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { authStorage } from "@/lib/auth/auth-storage";
import type { AuthTokens } from "@/types/auth";
import { API_ENDPOINTS } from "./endpoints";
import { normalizeApiError } from "./api-error";

interface AuthRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;
  if (config.data !== undefined && !isFormData) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) throw new Error("Refresh token nije dostupan.");

  const response = await apiClient.post<AuthTokens>(
    API_ENDPOINTS.auth.refresh,
    undefined,
    {
      headers: { Authorization: `Bearer ${refreshToken}` },
      skipAuthRefresh: true,
    } as AuthRequestConfig,
  );
  authStorage.setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data.accessToken;
}

function expireSession() {
  authStorage.clearTokens();
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("green-nest-auth-expired"));
  const isAuthPage = window.location.pathname.startsWith("/auth/");
  if (!isAuthPage) {
    const destination = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/auth/login?redirect=${encodeURIComponent(destination)}`);
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AuthRequestConfig | undefined;
    const isUnauthorized = error.response?.status === 401;
    if (
      isUnauthorized &&
      config &&
      !config._retry &&
      !config.skipAuthRefresh
    ) {
      config._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        config.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient.request(config);
      } catch (refreshError) {
        expireSession();
        return Promise.reject(normalizeApiError(refreshError));
      }
    }
    return Promise.reject(normalizeApiError(error));
  },
);
