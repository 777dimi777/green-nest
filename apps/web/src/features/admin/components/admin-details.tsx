"use client";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/features/products/components/product-image";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/date";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { OrderStatus } from "@/types/order";
import { adminApi } from "../api/admin-api";
import { adminQueryKeys } from "../queries/admin-query-keys";
function useAction<T>(key: readonly unknown[], fn: (v: T) => Promise<unknown>) {
  const c = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      toast.success("Izmena je sačuvana.");
      await c.invalidateQueries({ queryKey: key });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
};
export function AdminOrderDetails({ id }: { id: string }) {
  const key = adminQueryKeys.orders.detail(id),
    q = useQuery({ queryKey: key, queryFn: () => adminApi.orders.detail(id) }),
    status = useAction(key, adminApi.orders.status),
    cancel = useAction(key, adminApi.orders.cancel);
  if (q.isPending) return <Skeleton className="h-96" />;
  if (q.isError)
    return (
      <ErrorState
        title="Porudžbina nije dostupna"
        description={getApiErrorMessage(q.error)}
      />
    );
  const o = q.data,
    next = nextStatus[o.status];
  return (
    <>
      <Crumb label="Porudžbine" href="/admin/porudzbine" />
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">{o.orderNumber}</h1>
          <p className="text-muted-foreground">{formatDateTime(o.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {next && (
            <Button
              disabled={status.isPending}
              onClick={() => status.mutate({ id, status: next })}
            >
              Postavi: {next}
            </Button>
          )}
          {(o.status === "PENDING" || o.status === "CONFIRMED") && (
            <Button
              variant="destructive"
              disabled={cancel.isPending}
              onClick={() => {
                if (confirm("Otkazati porudžbinu?")) cancel.mutate(id);
              }}
            >
              Otkaži
            </Button>
          )}
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {o.items.map((i) => (
            <article
              key={i.id}
              className="grid grid-cols-[72px_1fr_auto] gap-4 rounded-xl border p-4"
            >
              <div className="relative aspect-square overflow-hidden rounded bg-muted">
                <ProductImage
                  src={i.product.images[0]?.url}
                  alt={i.product.name}
                />
              </div>
              <div>
                <strong>{i.product.name}</strong>
                <p>
                  {i.quantity} × {formatCurrency(i.price)}
                </p>
              </div>
              <strong>{formatCurrency(Number(i.price) * i.quantity)}</strong>
            </article>
          ))}
        </div>
        <aside className="rounded-xl border p-5">
          <h2 className="font-serif text-2xl">Sažetak</h2>
          <Row l="Kupac" v={`${o.user.firstName} ${o.user.lastName}`} />
          <Row l="Email" v={o.user.email} />
          <Row l="Status" v={o.status} />
          <Row l="Plaćanje" v={o.paymentStatus} />
          <Row l="Međuzbir" v={formatCurrency(o.subtotal)} />
          <Row l="Popust" v={formatCurrency(o.discount)} />
          <Row l="Dostava" v={formatCurrency(o.shippingPrice)} />
          <Row l="Ukupno" v={formatCurrency(o.totalPrice)} />
          <h3 className="mt-5 font-semibold">Adresa</h3>
          <p className="text-sm text-muted-foreground">
            {o.shippingAddress.firstName} {o.shippingAddress.lastName}
            <br />
            {o.shippingAddress.street} {o.shippingAddress.streetNumber}
            <br />
            {o.shippingAddress.postalCode} {o.shippingAddress.city},{" "}
            {o.shippingAddress.country}
          </p>
        </aside>
      </div>
    </>
  );
}
export function AdminPaymentDetails({ id }: { id: string }) {
  const key = adminQueryKeys.payments.detail(id),
    q = useQuery({
      queryKey: key,
      queryFn: () => adminApi.payments.detail(id),
    }),
    change = useAction(key, adminApi.payments.status);
  if (q.isPending) return <Skeleton className="h-80" />;
  if (q.isError)
    return (
      <ErrorState
        title="Plaćanje nije dostupno"
        description={getApiErrorMessage(q.error)}
      />
    );
  const p = q.data,
    allowed =
      p.method === "CASH_ON_DELIVERY" && p.status === "PENDING"
        ? "COMPLETED"
        : p.status === "COMPLETED"
          ? "REFUNDED"
          : null;
  return (
    <>
      <Crumb label="Plaćanja" href="/admin/placanja" />
      <h1 className="font-serif text-4xl font-semibold">Detalji plaćanja</h1>
      <div className="mt-8 max-w-3xl rounded-xl border p-6">
        <Row l="ID" v={p.id} />
        <Row l="Porudžbina" v={p.order.orderNumber} />
        <Row
          l="Korisnik"
          v={`${p.user.firstName} ${p.user.lastName} · ${p.user.email}`}
        />
        <Row l="Iznos" v={formatCurrency(p.amount)} />
        <Row l="Metoda" v={p.method} />
        <Row l="Status" v={p.status} />
        <Row l="Provider" v={p.provider} />
        <Row l="Referenca" v={p.providerTransactionId ?? "—"} />
        <Row l="Kreirano" v={formatDateTime(p.createdAt)} />
        {p.failureReason && <Row l="Razlog greške" v={p.failureReason} />}
        <Link
          className="mt-4 inline-block text-primary underline"
          href={`/admin/porudzbine/${p.order.id}`}
        >
          Otvori porudžbinu
        </Link>
        {allowed && (
          <Button
            className="mt-5 ml-4"
            disabled={change.isPending}
            onClick={() => change.mutate({ id, status: allowed })}
          >
            {allowed === "COMPLETED" ? "Označi završeno" : "Refundiraj"}
          </Button>
        )}
      </div>
    </>
  );
}
export function AdminUserDetails({ id }: { id: string }) {
  const key = adminQueryKeys.users.detail(id),
    q = useQuery({ queryKey: key, queryFn: () => adminApi.users.detail(id) }),
    role = useAction(key, adminApi.users.role),
    remove = useAction(adminQueryKeys.users.all, adminApi.users.remove);
  if (q.isPending) return <Skeleton className="h-80" />;
  if (q.isError)
    return (
      <ErrorState
        title="Korisnik nije dostupan"
        description={getApiErrorMessage(q.error)}
      />
    );
  const u = q.data;
  return (
    <>
      <Crumb label="Korisnici" href="/admin/korisnici" />
      <h1 className="font-serif text-4xl font-semibold">
        {u.firstName} {u.lastName}
      </h1>
      <div className="mt-8 max-w-3xl rounded-xl border p-6">
        <Row l="Email" v={u.email} />
        <Row l="Telefon" v={u.phone ?? "—"} />
        <Row l="Registrovan" v={formatDateTime(u.createdAt)} />
        <Row l="Porudžbine" v={String(u.statistics.orders)} />
        <Row l="Recenzije" v={String(u.statistics.reviews)} />
        <Row l="Wishlist" v={String(u.statistics.wishlistItems)} />
        <Row l="Ukupno potrošeno" v={formatCurrency(u.statistics.totalSpent)} />
        <div className="mt-5 flex gap-3">
          <select
            className="rounded border bg-background px-3"
            value={u.role}
            onChange={(e) =>
              role.mutate({ id, role: e.target.value as "CUSTOMER" | "ADMIN" })
            }
          >
            <option>CUSTOMER</option>
            <option>ADMIN</option>
          </select>
          <Button
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => {
              if (confirm("Trajno obrisati korisnika?")) remove.mutate(id);
            }}
          >
            Obriši korisnika
          </Button>
        </div>
      </div>
    </>
  );
}
function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="grid gap-1 border-b py-3 sm:grid-cols-[150px_1fr]">
      <span className="text-muted-foreground">{l}</span>
      <strong className="break-words">{v}</strong>
    </div>
  );
}
function Crumb({ label, href }: { label: string; href: string }) {
  return (
    <p className="mb-5 text-sm text-muted-foreground">
      <Link href={href} className="hover:text-foreground">
        {label}
      </Link>{" "}
      / Detalji
    </p>
  );
}
