"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Address, AddressRequest } from "@/types/address";
import { useCreateAddress, useUpdateAddress } from "../hooks/use-addresses";

const schema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().min(6).max(30),
  country: z.string().min(2).max(60),
  city: z.string().min(2).max(80),
  postalCode: z.string().min(3).max(15),
  street: z.string().min(2).max(120),
  streetNumber: z.string().min(1).max(20),
  apartment: z.string().max(30).optional(),
  isDefault: z.boolean(),
});
type Values = z.infer<typeof schema>;
const fields = [
  ["firstName", "Ime"],
  ["lastName", "Prezime"],
  ["phone", "Telefon"],
  ["country", "Država"],
  ["city", "Grad"],
  ["postalCode", "Poštanski broj"],
  ["street", "Ulica"],
  ["streetNumber", "Broj"],
  ["apartment", "Stan / ulaz (opciono)"],
] as const;

export function AddressForm({
  address,
  onDone,
}: {
  address?: Address;
  onDone?: () => void;
}) {
  const create = useCreateAddress(),
    update = useUpdateAddress();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: address?.firstName ?? "",
      lastName: address?.lastName ?? "",
      phone: address?.phone ?? "",
      country: address?.country ?? "Srbija",
      city: address?.city ?? "",
      postalCode: address?.postalCode ?? "",
      street: address?.street ?? "",
      streetNumber: address?.streetNumber ?? "",
      apartment: address?.apartment ?? "",
      isDefault: address?.isDefault ?? false,
    },
  });
  const pending = create.isPending || update.isPending;
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={handleSubmit((payload) => {
        const options = { onSuccess: onDone };
        if (address)
          update.mutate(
            { id: address.id, payload: payload as AddressRequest },
            options,
          );
        else create.mutate(payload as AddressRequest, options);
      })}
    >
      {fields.map(([name, label]) => (
        <div key={name} className={name === "street" ? "sm:col-span-2" : ""}>
          <Label htmlFor={`address-${name}`}>{label}</Label>
          <Input id={`address-${name}`} {...register(name)} />
          {errors[name] && (
            <p className="text-xs text-destructive">{errors[name]?.message}</p>
          )}
        </div>
      ))}
      <label className="flex items-center gap-2 sm:col-span-2">
        <input type="checkbox" {...register("isDefault")} />
        Podrazumevana adresa
      </label>
      <Button className="sm:col-span-2" disabled={pending}>
        {pending ? "Čuvanje…" : address ? "Sačuvaj izmene" : "Dodaj adresu"}
      </Button>
    </form>
  );
}
