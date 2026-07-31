"use client";
import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils/cn";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "../hooks/use-wishlist";

export function WishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const wishlist = useWishlist();
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();
  const active =
    wishlist.data?.data.some((item) => item.productId === productId) ?? false;
  const pending = add.isPending || remove.isPending;
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("relative", className)}
      disabled={pending}
      aria-label={active ? "Ukloni iz liste želja" : "Dodaj u listu želja"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isAuthenticated) {
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        if (active) remove.mutate(productId);
        else add.mutate(productId);
      }}
    >
      <Heart className={cn(active && "fill-current text-primary")} />
    </Button>
  );
}
