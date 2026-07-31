"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddresses } from "@/features/addresses/hooks/use-addresses";
import { useCart } from "@/features/cart/hooks/use-cart";
import {
  useCreateOrder,
  useCreatePayment,
} from "@/features/orders/hooks/use-orders";
import { formatCurrency } from "@/lib/utils/currency";
import { getApiErrorMessage } from "@/lib/api/api-error";
export function CheckoutPage() {
  const router = useRouter(),
    addresses = useAddresses(),
    cart = useCart(),
    create = useCreateOrder(),
    pay = useCreatePayment();
  const [selected, setSelected] = useState(""),
    [coupon, setCoupon] = useState("");
  if (addresses.isPending || cart.isPending)
    return <Skeleton className="h-96" />;
  if (addresses.isError || cart.isError) {
    const e = addresses.error ?? cart.error;
    return (
      <ErrorState
        title="Checkout nije dostupan"
        description={getApiErrorMessage(e)}
        onRetry={() => {
          void addresses.refetch();
          void cart.refetch();
        }}
      />
    );
  }
  if (!cart.data.items.length)
    return (
      <div className="text-center">
        <h1 className="font-serif text-4xl">Korpa je prazna</h1>
        <Link href="/prodavnica" className={`${buttonVariants()} mt-5`}>
          Prodavnica
        </Link>
      </div>
    );
  const addressId =
    selected ||
    addresses.data.find((a) => a.isDefault)?.id ||
    addresses.data[0]?.id ||
    "";
  async function submit() {
    const order = await create.mutateAsync({
      confirm: true,
      addressId,
      couponCode: coupon.trim().toUpperCase() || undefined,
    });
    try {
      await pay.mutateAsync({ orderId: order.id, method: "CASH_ON_DELIVERY" });
    } finally {
      router.push(`/porudzbine/${order.id}`);
    }
  }
  return (
    <>
      <h1 className="font-serif text-5xl font-semibold">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Step number="1" title="Adresa za dostavu">
            {addresses.data.length === 0 ? (
              <p>
                Nemate adresu.{" "}
                <Link className="text-primary underline" href="/adrese">
                  Dodajte adresu
                </Link>
                .
              </p>
            ) : (
              <div className="grid gap-3">
                {addresses.data.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer gap-3 rounded-lg border p-4"
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === a.id}
                      onChange={() => setSelected(a.id)}
                    />
                    <span>
                      <strong>
                        {a.firstName} {a.lastName}
                      </strong>
                      <br />
                      {a.street} {a.streetNumber}, {a.city}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Step>
          <Step number="2" title="Pregled korpe">
            {cart.data.items.map((i) => (
              <div key={i.id} className="flex justify-between border-b py-2">
                <span>
                  {i.product.name} × {i.quantity}
                </span>
                <strong>{formatCurrency(i.lineTotal)}</strong>
              </div>
            ))}
          </Step>
          <Step number="3" title="Kupon">
            <Label htmlFor="coupon">Kod kupona</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                maxLength={50}
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setCoupon("")}
              >
                Ukloni
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Kupon će backend proveriti pri potvrdi porudžbine.
            </p>
          </Step>
          <Step number="4" title="Način plaćanja">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <strong>Plaćanje pouzećem</strong>
              <p className="mt-1 text-sm text-muted-foreground">
                Porudžbinu plaćate kuriru prilikom preuzimanja.
              </p>
            </div>
          </Step>
        </div>
        <aside className="h-fit rounded-xl border p-6 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl font-semibold">Potvrda</h2>
          <div className="mt-5 flex justify-between">
            <span>Međuzbir</span>
            <strong>{formatCurrency(cart.data.summary.subtotal)}</strong>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Popust i finalni total potvrđuje backend.
          </p>
          <Button
            className="mt-6 w-full"
            disabled={!addressId || create.isPending || pay.isPending}
            onClick={() => void submit()}
          >
            {create.isPending || pay.isPending ? "Obrada…" : "Naruči pouzećem"}
          </Button>
        </aside>
      </div>
    </>
  );
}
function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border p-5">
      <h2 className="mb-5 font-serif text-2xl font-semibold">
        <span className="mr-2 text-primary">{number}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
