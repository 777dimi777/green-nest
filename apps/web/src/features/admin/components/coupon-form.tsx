"use client";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { CouponRequest } from "@/types/admin";
import { adminApi } from "../api/admin-api";
import { adminQueryKeys } from "../queries/admin-query-keys";

const positive = (max?: number) =>
  z
    .string()
    .refine(
      (value) =>
        value !== "" && Number(value) > 0 && (!max || Number(value) <= max),
      "Unesite validnu pozitivnu vrednost.",
    );
const optionalPositive = z
  .string()
  .refine(
    (value) => value === "" || Number(value) > 0,
    "Vrednost mora biti pozitivna.",
  );
const schema = z
  .object({
    code: z.string().min(1).max(50),
    description: z.string().max(500),
    discountType: z.enum(["percentage", "fixed"]),
    percentage: z.string(),
    fixedAmount: z.string(),
    minimumOrder: z.string().refine((v) => v === "" || Number(v) >= 0),
    usageLimit: optionalPositive,
    startsAt: z.string(),
    expiresAt: z.string(),
    active: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const selected =
      v.discountType === "percentage"
        ? positive(100).safeParse(v.percentage)
        : positive().safeParse(v.fixedAmount);
    if (!selected.success)
      ctx.addIssue({
        code: "custom",
        path: [v.discountType === "percentage" ? "percentage" : "fixedAmount"],
        message: "Unesite validan popust.",
      });
    if (
      v.startsAt &&
      v.expiresAt &&
      new Date(v.expiresAt) <= new Date(v.startsAt)
    )
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Datum isteka mora biti posle početka.",
      });
  });
type Values = z.infer<typeof schema>;

export function CouponForm({ id }: { id?: string }) {
  const router = useRouter(),
    client = useQueryClient(),
    query = useQuery({
      queryKey: adminQueryKeys.coupons.detail(id ?? "new"),
      queryFn: () => adminApi.coupons.detail(id as string),
      enabled: !!id,
    }),
    coupon = query.data;
  const save = useMutation({
    mutationFn: (values: Values) => {
      const payload: CouponRequest = {
        code: values.code.toUpperCase(),
        description: values.description || undefined,
        active: values.active,
        percentage:
          values.discountType === "percentage"
            ? Number(values.percentage)
            : undefined,
        fixedAmount:
          values.discountType === "fixed"
            ? Number(values.fixedAmount)
            : undefined,
        minimumOrder: values.minimumOrder
          ? Number(values.minimumOrder)
          : undefined,
        usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
        startsAt: values.startsAt
          ? new Date(values.startsAt).toISOString()
          : undefined,
        expiresAt: values.expiresAt
          ? new Date(values.expiresAt).toISOString()
          : undefined,
      };
      return id
        ? adminApi.coupons.update({ id, payload })
        : adminApi.coupons.create(payload);
    },
    onSuccess: async () => {
      toast.success("Kupon je sačuvan.");
      await client.invalidateQueries({ queryKey: adminQueryKeys.coupons.all });
      router.push("/admin/kuponi");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      code: coupon?.code ?? "",
      description: coupon?.description ?? "",
      discountType: coupon?.fixedAmount ? "fixed" : "percentage",
      percentage: coupon?.percentage ? String(coupon.percentage) : "",
      fixedAmount: coupon?.fixedAmount ? String(coupon.fixedAmount) : "",
      minimumOrder: coupon?.minimumOrder ? String(coupon.minimumOrder) : "",
      usageLimit: coupon?.usageLimit ? String(coupon.usageLimit) : "",
      startsAt: toLocal(coupon?.startsAt),
      expiresAt: toLocal(coupon?.expiresAt),
      active: coupon?.active ?? true,
    },
  });
  const type = useWatch({ control, name: "discountType" });
  if (query.isPending) return <Skeleton className="h-96" />;
  return (
    <>
      <p className="text-sm text-primary">Admin / Kuponi</p>
      <h1 className="font-serif text-4xl font-semibold">
        {id ? "Izmena kupona" : "Novi kupon"}
      </h1>
      <form
        className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2"
        onSubmit={handleSubmit((values) => save.mutate(values))}
      >
        <Field
          name="code"
          label="Kod"
          register={register}
          error={errors.code?.message}
        />
        <div>
          <Label htmlFor="discountType">Tip popusta</Label>
          <select
            id="discountType"
            className="h-10 w-full rounded-md border bg-background px-3"
            {...register("discountType")}
          >
            <option value="percentage">Procenat</option>
            <option value="fixed">Fiksni iznos</option>
          </select>
        </div>
        {type === "percentage" ? (
          <Field
            name="percentage"
            label="Procenat (1–100)"
            type="number"
            register={register}
            error={errors.percentage?.message}
          />
        ) : (
          <Field
            name="fixedAmount"
            label="Fiksni popust"
            type="number"
            register={register}
            error={errors.fixedAmount?.message}
          />
        )}
        <Field
          name="minimumOrder"
          label="Minimalna porudžbina"
          type="number"
          register={register}
        />
        <Field
          name="usageLimit"
          label="Limit korišćenja"
          type="number"
          register={register}
          error={errors.usageLimit?.message}
        />
        <Field
          name="startsAt"
          label="Početak"
          type="datetime-local"
          register={register}
        />
        <Field
          name="expiresAt"
          label="Ističe"
          type="datetime-local"
          register={register}
          error={errors.expiresAt?.message}
        />
        <div className="sm:col-span-2">
          <Label htmlFor="coupon-description">Opis</Label>
          <textarea
            id="coupon-description"
            className="min-h-24 w-full rounded-md border bg-background p-3"
            {...register("description")}
          />
        </div>
        <label className="flex gap-2">
          <input type="checkbox" {...register("active")} />
          Aktivan
        </label>
        <Button className="sm:col-span-2" disabled={save.isPending}>
          {save.isPending ? "Čuvanje…" : "Sačuvaj kupon"}
        </Button>
      </form>
    </>
  );
}
function Field({
  name,
  label,
  type = "text",
  register,
  error,
}: {
  name: keyof Values;
  label: string;
  type?: string;
  register: ReturnType<typeof useForm<Values>>["register"];
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={`coupon-${name}`}>{label}</Label>
      <Input id={`coupon-${name}`} type={type} {...register(name)} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
function toLocal(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}
