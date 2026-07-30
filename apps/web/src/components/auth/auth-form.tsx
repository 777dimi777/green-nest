"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const schema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email("Unesite validnu email adresu."),
    password: z.string().min(8, "Lozinka mora imati najmanje 8 karaktera."),
    confirmPassword: z.string(),
  }).superRefine((data, context) => {
    if (!isRegister) return;
    if (!data.firstName.trim()) {
      context.addIssue({ code: "custom", message: "Unesite ime.", path: ["firstName"] });
    }
    if (!data.lastName.trim()) {
      context.addIssue({ code: "custom", message: "Unesite prezime.", path: ["lastName"] });
    }
    if (data.confirmPassword.length < 8) {
      context.addIssue({ code: "custom", message: "Ponovite lozinku.", path: ["confirmPassword"] });
    } else if (data.password !== data.confirmPassword) {
      context.addIssue({ code: "custom", message: "Lozinke se ne poklapaju.", path: ["confirmPassword"] });
    }
  });
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });
  const field = (id: keyof FormValues, label: string, type = "text", autoComplete?: string) => <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} autoComplete={autoComplete} aria-invalid={Boolean(errors[id])} aria-describedby={`${id}-error`} {...register(id)} />{errors[id] && <p id={`${id}-error`} className="text-sm text-destructive">{errors[id]?.message}</p>}</div>;
  return <form className="space-y-5" onSubmit={handleSubmit(() => toast.info("Povezivanje autentikacije dolazi u sledećem koraku."))}>{isRegister && <div className="grid gap-5 sm:grid-cols-2">{field("firstName", "Ime", "text", "given-name")}{field("lastName", "Prezime", "text", "family-name")}</div>}{field("email", "Email", "email", "email")}{field("password", "Lozinka", "password", isRegister ? "new-password" : "current-password")}{isRegister && field("confirmPassword", "Potvrdite lozinku", "password", "new-password")}<Button className="w-full" size="lg" type="submit">{isRegister ? "Kreiraj nalog" : "Prijavi se"}</Button><p className="text-center text-sm text-muted-foreground">{isRegister ? "Već imate nalog?" : "Nemate nalog?"} <Link className="font-semibold text-primary underline-offset-4 hover:underline" href={isRegister ? "/auth/login" : "/auth/register"}>{isRegister ? "Prijavite se" : "Registrujte se"}</Link></p></form>;
}
