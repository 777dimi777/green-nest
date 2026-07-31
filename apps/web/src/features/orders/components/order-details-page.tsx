"use client";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/features/products/components/product-image";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useCancelOrder, useOrder } from "../hooks/use-orders";
import { Status } from "./orders-page";
export function OrderDetailsPage({ id }: { id: string }) {
  const q = useOrder(id),
    cancel = useCancelOrder();
  if (q.isPending) return <Skeleton className="h-96" />;
  if (q.isError)
    return (
      <ErrorState
        title="Porudžbina nije dostupna"
        description={getApiErrorMessage(q.error)}
        onRetry={() => void q.refetch()}
      />
    );
  const o = q.data;
  return (
    <>
      <Link href="/porudzbine" className={buttonVariants({ variant: "ghost" })}>
        ← Sve porudžbine
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">{o.orderNumber}</h1>
          <p className="text-muted-foreground">{formatDate(o.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Status value={o.status} />
          <Status value={o.paymentStatus} />
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {o.items.map((i) => (
            <article
              key={i.id}
              className="grid grid-cols-[80px_1fr_auto] gap-4 rounded-xl border p-4"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <ProductImage
                  src={i.product.images[0]?.url}
                  alt={i.product.name}
                />
              </div>
              <div>
                <Link
                  href={`/prodavnica/${i.product.slug}`}
                  className="font-semibold"
                >
                  {i.product.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {i.quantity} × {formatCurrency(i.price)}
                </p>
              </div>
              <strong>{formatCurrency(Number(i.price) * i.quantity)}</strong>
            </article>
          ))}
        </div>
        <aside className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl font-semibold">Detalji</h2>
          <dl className="mt-5 space-y-2">
            <Row l="Međuzbir" v={formatCurrency(o.subtotal)} />
            <Row l="Dostava" v={formatCurrency(o.shippingPrice)} />
            <Row l="Popust" v={`− ${formatCurrency(o.discount)}`} />
            <Row l="Ukupno" v={formatCurrency(o.totalPrice)} />
          </dl>
          <h3 className="mt-6 font-semibold">Adresa dostave</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {o.shippingAddress.firstName} {o.shippingAddress.lastName}
            <br />
            {o.shippingAddress.street} {o.shippingAddress.streetNumber}
            <br />
            {o.shippingAddress.postalCode} {o.shippingAddress.city}
            <br />
            {o.shippingAddress.country}
            <br />
            {o.shippingAddress.phone}
          </p>
          {o.status === "PENDING" && (
            <Button
              variant="destructive"
              className="mt-6 w-full"
              disabled={cancel.isPending}
              onClick={() => {
                if (window.confirm("Otkazati porudžbinu?")) cancel.mutate(o.id);
              }}
            >
              {cancel.isPending ? "Otkazivanje…" : "Otkaži porudžbinu"}
            </Button>
          )}
        </aside>
      </div>
    </>
  );
}
function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex justify-between border-b py-2">
      <dt>{l}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
