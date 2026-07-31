"use client";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/features/products/components/product-image";
import { formatCurrency } from "@/lib/utils/currency";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "../hooks/use-cart";

export function CartPage() {
  const cart = useCart(),
    update = useUpdateCartItem(),
    remove = useRemoveCartItem(),
    clear = useClearCart();
  if (cart.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  if (cart.isError)
    return (
      <ErrorState
        title="Korpa nije dostupna"
        description={getApiErrorMessage(cart.error)}
        onRetry={() => void cart.refetch()}
      />
    );
  if (!cart.data.items.length)
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Korpa je prazna"
        description="Dodajte biljke iz naše prodavnice."
        action={
          <Link href="/prodavnica" className={buttonVariants()}>
            Idi u prodavnicu
          </Link>
        }
      />
    );
  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl font-semibold">Vaša korpa</h1>
          <p className="mt-2 text-muted-foreground">
            {cart.data.summary.totalItems} proizvoda
          </p>
        </div>
        <Button
          variant="ghost"
          disabled={clear.isPending}
          onClick={() => clear.mutate()}
        >
          <Trash2 />
          Isprazni korpu
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {cart.data.items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-xl border p-4 sm:grid-cols-[120px_1fr_auto]"
            >
              <Link
                href={`/prodavnica/${item.product.slug}`}
                className="relative block aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <ProductImage
                  src={item.product.images[0]?.url}
                  alt={item.product.name}
                />
              </Link>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-primary">
                  {item.product.category.name}
                </p>
                <Link
                  href={`/prodavnica/${item.product.slug}`}
                  className="mt-1 block truncate font-serif text-2xl font-semibold"
                >
                  {item.product.name}
                </Link>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatCurrency(item.unitPrice)} po komadu
                </p>
                {(!item.available || item.exceedsStock) && (
                  <p className="mt-2 text-sm text-destructive">
                    Proverite dostupnost ove stavke.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <strong>{formatCurrency(item.lineTotal)}</strong>
                <div
                  className="flex items-center rounded-md border"
                  aria-label={`Količina za ${item.product.name}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Smanji količinu"
                    disabled={item.quantity <= 1 || update.isPending}
                    onClick={() =>
                      update.mutate({
                        productId: item.productId,
                        quantity: item.quantity - 1,
                      })
                    }
                  >
                    <Minus />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Povećaj količinu"
                    disabled={
                      item.quantity >= item.product.stock || update.isPending
                    }
                    onClick={() =>
                      update.mutate({
                        productId: item.productId,
                        quantity: item.quantity + 1,
                      })
                    }
                  >
                    <Plus />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(item.productId)}
                >
                  <Trash2 />
                  Ukloni
                </Button>
              </div>
            </article>
          ))}
        </div>
        <aside className="h-fit rounded-xl border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl font-semibold">Pregled korpe</h2>
          <dl className="mt-6 space-y-3">
            <div className="flex justify-between">
              <dt>Broj stavki</dt>
              <dd>{cart.data.summary.uniqueItems}</dd>
            </div>
            <div className="flex justify-between border-t pt-4 text-lg font-semibold">
              <dt>Međuzbir</dt>
              <dd>{formatCurrency(cart.data.summary.subtotal)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className={`${buttonVariants()} mt-6 w-full`}>
            Nastavi na kupovinu
          </Link>
        </aside>
      </div>
    </>
  );
}
