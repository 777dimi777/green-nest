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
import { registerSchema, type RegisterValues } from "./auth-schemas";

export function RegisterForm({ disabled }: { disabled: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      setSubmitError(null);
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      toast.success("Nalog je uspešno kreiran. Sada se možete prijaviti.");
      router.push("/auth/login");
    } catch (error) {
      const apiError = normalizeApiError(error);
      const message =
        apiError.statusCode === 409
          ? "Nalog sa ovom email adresom već postoji."
          : apiError.message;
      setSubmitError(message);
      toast.error(message);
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="firstName"
          label="Ime"
          autoComplete="given-name"
          error={errors.firstName?.message}
          inputProps={register("firstName")}
        />
        <TextField
          id="lastName"
          label="Prezime"
          autoComplete="family-name"
          error={errors.lastName?.message}
          inputProps={register("lastName")}
        />
      </div>
      <TextField
        id="register-email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        inputProps={register("email")}
      />
      <PasswordField
        id="register-password"
        label="Lozinka"
        autoComplete="new-password"
        visible={showPassword}
        onToggle={() => setShowPassword((value) => !value)}
        error={errors.password?.message}
        inputProps={register("password")}
      />
      <PasswordField
        id="confirmPassword"
        label="Potvrdite lozinku"
        autoComplete="new-password"
        visible={showPassword}
        onToggle={() => setShowPassword((value) => !value)}
        error={errors.confirmPassword?.message}
        inputProps={register("confirmPassword")}
      />
      {submitError && <SubmitError message={submitError} />}
      <SubmitButton
        disabled={disabled || isSubmitting}
        loading={isSubmitting}
        loadingText="Kreiranje naloga…"
      >
        Kreiraj nalog
      </SubmitButton>
      <AuthSwitch
        prompt="Već imate nalog?"
        href="/auth/login"
        label="Prijavite se"
      />
    </form>
  );
}
