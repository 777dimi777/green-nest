"use client";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAddToCart } from "../hooks/use-cart";

export function AddToCartControl({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const add = useAddToCart();
  const change = (next: number) =>
    setQuantity(Math.max(1, Math.min(stock, next)));
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <div
        className="flex h-12 items-center rounded-lg border"
        aria-label="Količina"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Smanji količinu"
          disabled={quantity <= 1 || add.isPending}
          onClick={() => change(quantity - 1)}
        >
          <Minus />
        </Button>
        <output className="w-10 text-center font-semibold" aria-live="polite">
          {quantity}
        </output>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Povećaj količinu"
          disabled={quantity >= stock || add.isPending}
          onClick={() => change(quantity + 1)}
        >
          <Plus />
        </Button>
      </div>
      <Button
        size="lg"
        disabled={stock <= 0 || add.isPending}
        onClick={() => {
          if (!isAuthenticated) {
            router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
            return;
          }
          add.mutate({ productId, quantity });
        }}
      >
        <ShoppingBag />
        {add.isPending
          ? "Dodavanje…"
          : stock > 0
            ? "Dodaj u korpu"
            : "Trenutno nedostupno"}
      </Button>
    </div>
  );
}
