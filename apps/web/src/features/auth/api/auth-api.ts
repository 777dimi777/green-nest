import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AuthResponse,
  AuthTokens,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";
import type { User } from "@/types/user";

export const authApi = {
  async login(payload: LoginRequest) {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      payload,
      { skipAuthRefresh: true },
    );
    return response.data;
  },
  async register(payload: RegisterRequest) {
    const response = await apiClient.post<User>(
      API_ENDPOINTS.auth.register,
      payload,
      { skipAuthRefresh: true },
    );
    return response.data;
  },
  async getCurrentUser() {
    const response = await apiClient.get<CurrentUserResponse>(
      API_ENDPOINTS.users.current,
    );
    return response.data;
  },
  async refresh(refreshToken: string) {
    const response = await apiClient.post<AuthTokens>(
      API_ENDPOINTS.auth.refresh,
      undefined,
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
        skipAuthRefresh: true,
      },
    );
    return response.data;
  },
  async logout() {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.logout,
    );
    return response.data;
  },
};
