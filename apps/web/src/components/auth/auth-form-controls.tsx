import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldProps {
  id: string;
  label: string;
  autoComplete: string;
  error?: string;
  inputProps: UseFormRegisterReturn;
}

export function TextField({
  id,
  label,
  autoComplete,
  error,
  inputProps,
  type = "text",
}: FieldProps & { type?: "text" | "email" }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-error`}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  autoComplete,
  visible,
  onToggle,
  error,
  inputProps,
}: FieldProps & { visible: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-error`}
          className="pr-11"
          {...inputProps}
        />
        <button
          type="button"
          aria-label={visible ? "Sakrij lozinku" : "Prikaži lozinku"}
          onClick={onToggle}
          className="absolute right-1 top-1 grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      {message}
    </p>
  );
}

export function SubmitButton({
  children,
  disabled,
  loading,
  loadingText,
}: {
  children: React.ReactNode;
  disabled: boolean;
  loading: boolean;
  loadingText: string;
}) {
  return (
    <Button className="w-full" size="lg" type="submit" disabled={disabled}>
      {loading && <LoaderCircle className="animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  );
}

export function AuthSwitch({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link
        className="font-semibold text-primary underline-offset-4 hover:underline"
        href={href}
      >
        {label}
      </Link>
    </p>
  );
}
