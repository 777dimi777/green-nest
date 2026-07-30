"use client";

import Link from "next/link";
import { ArrowRight, Sprout } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { buttonVariants } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useProducts } from "../hooks/use-products";
import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "./product-grid-skeleton";

export function HomeProductsPreview() {
  const products = useProducts({ featured: true, limit: 4 });

  if (products.isPending) return <ProductGridSkeleton count={4} />;
  if (products.isError) {
    return (
      <ErrorState
        title="Izdvojeni proizvodi trenutno nisu dostupni"
        description={getApiErrorMessage(products.error)}
        onRetry={() => void products.refetch()}
      />
    );
  }
  if (products.data.data.length === 0) {
    return (
      <EmptyState
        icon={Sprout}
        title="Izdvojeni proizvodi stižu uskoro"
        description="Trenutno nema proizvoda označenih kao izdvojeni."
        action={
          <Link href="/prodavnica" className={buttonVariants({ variant: "outline" })}>
            Pogledaj celu ponudu <ArrowRight />
          </Link>
        }
      />
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.data.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
