import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Unesite validnu email adresu."),
  password: z.string().min(8, "Lozinka mora imati najmanje 8 karaktera."),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Unesite ime."),
    lastName: z.string().trim().min(1, "Unesite prezime."),
    email: z.email("Unesite validnu email adresu."),
    password: z.string().min(8, "Lozinka mora imati najmanje 8 karaktera."),
    confirmPassword: z.string().min(8, "Ponovite lozinku."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Lozinke se ne poklapaju.",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
