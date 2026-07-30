"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cartQueryKeys } from "@/features/cart/queries/cart-query-keys";
import { wishlistQueryKeys } from "@/features/wishlist/queries/wishlist-query-keys";
import { reviewQueryKeys } from "@/features/reviews/queries/review-query-keys";
import { addressQueryKeys } from "@/features/addresses/queries/address-query-keys";
import { orderQueryKeys } from "@/features/orders/queries/order-query-keys";
import { notificationQueryKeys } from "@/features/notifications/queries/notification-query-keys";
import { authStorage } from "@/lib/auth/auth-storage";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import type { User } from "@/types/user";
import { authApi } from "../api/auth-api";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginRequest) => Promise<User>;
  register: (payload: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    async function initialize() {
      if (!authStorage.getAccessToken()) {
        if (active) setIsInitializing(false);
        return;
      }
      try {
        const currentUser = await authApi.getCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        authStorage.clearTokens();
        if (active) setUser(null);
      } finally {
        if (active) setIsInitializing(false);
      }
    }
    void initialize();
    const handleExpired = () => {
      setUser(null);
      setIsInitializing(false);
    };
    window.addEventListener("green-nest-auth-expired", handleExpired);
    return () => {
      active = false;
      window.removeEventListener("green-nest-auth-expired", handleExpired);
    };
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authApi.login(payload);
    authStorage.setTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(
    (payload: RegisterRequest) => authApi.register(payload),
    [],
  );

  const logout = useCallback(async () => {
    try {
      if (authStorage.getAccessToken()) await authApi.logout();
    } finally {
      authStorage.clearTokens();
      setUser(null);
      queryClient.removeQueries({ queryKey: cartQueryKeys.all });
      queryClient.removeQueries({ queryKey: wishlistQueryKeys.all });
      queryClient.removeQueries({ queryKey: reviewQueryKeys.all });
      queryClient.removeQueries({ queryKey: addressQueryKeys.all });
      queryClient.removeQueries({ queryKey: orderQueryKeys.all });
      queryClient.removeQueries({ queryKey: notificationQueryKeys.all });
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      login,
      register,
      logout,
    }),
    [isInitializing, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
