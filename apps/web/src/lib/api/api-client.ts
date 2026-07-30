import axios from "axios";
import { env } from "@/lib/env";
import { authStorage } from "@/lib/auth/auth-storage";
import { normalizeApiError } from "./api-error";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data !== undefined && !(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);
