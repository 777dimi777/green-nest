"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { ErrorState } from "@/components/common/error-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { buttonVariants } from "@/components/ui/button";
import { AddToCartControl } from "@/features/cart/components/add-to-cart-control";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import { useProduct } from "@/features/products/hooks/use-product";
import { ApiError, getApiErrorMessage } from "@/lib/api/api-error";
import { formatCurrency } from "@/lib/utils/currency";
import { ProductGallery } from "./product-gallery";
import { ProductReviewsSection } from "@/features/reviews/components/product-reviews-section";
import { StockStatus } from "./stock-status";

export function ProductDetailsView({ slug }: { slug: string }) {
  const productQuery = useProduct(slug);

  if (productQuery.isPending) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <LoadingSpinner label="Učitavanje proizvoda" className="size-7" />
      </div>
    );
  }

  if (productQuery.isError) {
    const notFound =
      productQuery.error instanceof ApiError &&
      productQuery.error.statusCode === 404;
    return (
      <div className="py-16">
        <ErrorState
          title={notFound ? "Proizvod nije pronađen" : "Proizvod nije dostupan"}
          description={
            notFound
              ? "Proizvod ne postoji ili više nije objavljen."
              : getApiErrorMessage(productQuery.error)
          }
          onRetry={
            notFound ? undefined : () => void productQuery.refetch()
          }
        />
        <div className="mt-5 text-center">
          <Link href="/prodavnica" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft />
            Nazad u prodavnicu
          </Link>
        </div>
      </div>
    );
  }

  const product = productQuery.data;
  const activePrice = product.discountPrice ?? product.price;
  const details = [
    ["Visina", product.height],
    ["Veličina saksije", product.potSize],
    ["Svetlost", product.light],
    ["Zalivanje", product.watering],
    ["Temperatura", product.temperature],
    ["Vlažnost", product.humidity],
    ["Težina nege", product.difficulty],
    ["Brzina rasta", product.growthRate],
    ["Poreklo", product.origin],
    ["Toksičnost", product.toxicity],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));

  return (
    <>
      <nav aria-label="Putanja" className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Početna</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/prodavnica" className="hover:text-foreground">Prodavnica</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />
        <div className="lg:py-4">
          <Link
            href={`/prodavnica?categoryId=${encodeURIComponent(product.category.id)}`}
            className="text-xs font-semibold uppercase tracking-[.16em] text-primary hover:underline"
          >
            {product.category.name}
          </Link>
          <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight sm:text-6xl">
            {product.name}
          </h1>
          <div className="mt-5 flex items-end gap-3">
            <p className="text-3xl font-semibold">{formatCurrency(activePrice)}</p>
            {product.discountPrice && (
              <p className="pb-1 text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>
          <StockStatus stock={product.stock} className="mt-4 text-sm" />
          <p className="mt-7 whitespace-pre-line text-base leading-8 text-muted-foreground">
            {product.description}
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <AddToCartControl productId={product.id} stock={product.stock} />
            <WishlistButton productId={product.id} className="mb-0" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {product.airPurifying && (
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <Check className="size-4" /> Prečišćava vazduh
              </span>
            )}
            {product.petFriendly && (
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <Check className="size-4" /> Pogodno za dom sa ljubimcima
              </span>
            )}
          </div>
          {details.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-x-5 gap-y-4 border-t pt-8">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <ProductReviewsSection productId={product.id} productSlug={product.slug} />
    </>
  );
}
