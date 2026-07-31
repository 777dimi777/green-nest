"use client";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { adminApi } from "../api/admin-api";
import { adminQueryKeys } from "../queries/admin-query-keys";
const schema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  image: z.union([z.string().url(), z.literal("")]).optional(),
  parentId: z.string().optional(),
});
type Values = z.infer<typeof schema>;
export function CategoryForm({ id }: { id?: string }) {
  const router = useRouter(),
    client = useQueryClient(),
    q = useQuery({
      queryKey: adminQueryKeys.categories.all,
      queryFn: adminApi.categories.list,
    }),
    details = useQuery({
      queryKey: adminQueryKeys.categories.detail(id ?? "new"),
      queryFn: () => adminApi.categories.detail(id as string),
      enabled: !!id,
    }),
    category = details.data;
  const save = useMutation({
    mutationFn: (p: Values) =>
      id
        ? adminApi.categories.update({
            id,
            payload: {
              ...p,
              image: p.image || undefined,
              parentId: p.parentId || undefined,
            },
          })
        : adminApi.categories.create({
            ...p,
            image: p.image || undefined,
            parentId: p.parentId || undefined,
          }),
    onSuccess: async () => {
      toast.success("Kategorija je sačuvana.");
      await client.invalidateQueries({
        queryKey: adminQueryKeys.categories.all,
      });
      router.push("/admin/kategorije");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      image: category?.image ?? "",
      parentId: category?.parentId ?? "",
    },
  });
  if (q.isPending || details.isPending) return <Skeleton className="h-80" />;
  return (
    <>
      <p className="text-sm text-primary">Admin / Kategorije</p>
      <h1 className="font-serif text-4xl font-semibold">
        {id ? "Izmena kategorije" : "Nova kategorija"}
      </h1>
      {id && !category ? (
        <p className="mt-5 text-destructive">
          Kategorija nije pronađena u listi.
        </p>
      ) : (
        <form
          className="mt-8 max-w-2xl space-y-4"
          onSubmit={handleSubmit((v) => save.mutate(v))}
        >
          <div>
            <Label htmlFor="category-name">Naziv</Label>
            <Input id="category-name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="category-description">Opis</Label>
            <textarea
              id="category-description"
              className="min-h-28 w-full rounded-md border bg-background p-3"
              {...register("description")}
            />
          </div>
          <div>
            <Label htmlFor="category-image">URL slike</Label>
            <Input id="category-image" {...register("image")} />
            {errors.image && (
              <p className="text-xs text-destructive">Unesite validan URL.</p>
            )}
          </div>
          <div>
            <Label htmlFor="category-parent">Roditeljska kategorija</Label>
            <select
              id="category-parent"
              className="h-10 w-full rounded-md border bg-background px-3"
              {...register("parentId")}
            >
              <option value="">Bez roditelja</option>
              {q.data
                ?.filter((c) => c.id !== id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <Button disabled={save.isPending}>
            {save.isPending ? "Čuvanje…" : "Sačuvaj kategoriju"}
          </Button>
        </form>
      )}
    </>
  );
}
