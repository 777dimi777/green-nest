"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { normalizeApiError } from "@/lib/api/api-error";
import {
  AuthSwitch,
  PasswordField,
  SubmitButton,
  SubmitError,
  TextField,
} from "./auth-form-controls";
import { loginSchema, type LoginValues } from "./auth-schemas";

export function LoginForm({ disabled }: { disabled: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitError(null);
    try {
      const user = await login(values);
      toast.success(`Dobro došli, ${user.firstName}.`);
      const requested = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      const safeDestination =
        requested?.startsWith("/") && !requested.startsWith("//")
          ? requested
          : "/";
      router.replace(user.role === "ADMIN" ? "/admin" : safeDestination);
    } catch (error) {
      const message = normalizeApiError(error).message;
      setSubmitError(message);
      toast.error(message);
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        inputProps={register("email")}
      />
      <PasswordField
        id="password"
        label="Lozinka"
        autoComplete="current-password"
        visible={showPassword}
        onToggle={() => setShowPassword((value) => !value)}
        error={errors.password?.message}
        inputProps={register("password")}
      />
      {submitError && <SubmitError message={submitError} />}
      <SubmitButton
        disabled={disabled || isSubmitting}
        loading={isSubmitting}
        loadingText="Prijavljivanje…"
      >
        Prijavi se
      </SubmitButton>
      <AuthSwitch
        prompt="Nemate nalog?"
        href="/auth/register"
        label="Registrujte se"
      />
    </form>
  );
}
