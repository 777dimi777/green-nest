"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { user, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && user) {
      router.replace(user.role === "ADMIN" ? "/admin" : "/nalog");
    }
  }, [isInitializing, router, user]);

  return mode === "login" ? (
    <LoginForm disabled={isInitializing} />
  ) : (
    <RegisterForm disabled={isInitializing} />
  );
}
