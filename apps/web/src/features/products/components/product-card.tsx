import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import type { ProductListItem } from "@/types/product";
import { ProductImage } from "./product-image";
import { StockStatus } from "./stock-status";

export function ProductCard({ product }: { product: ProductListItem }) {
  const primaryImage =
    product.images.find((image) => image.isPrimary) ?? product.images[0];
  const activePrice = product.discountPrice ?? product.price;

  return (
    <Card className="group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-30px_rgba(24,54,39,.5)]">
      <Link
        href={`/prodavnica/${product.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Pogledaj proizvod ${product.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <ProductImage
            src={primaryImage?.url}
            alt={primaryImage?.alt || product.name}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
              {product.category.name}
            </p>
            <StockStatus stock={product.stock} />
          </div>
          <h2 className="mt-3 line-clamp-2 font-serif text-2xl font-semibold leading-tight">
            {product.name}
          </h2>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              {product.discountPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </p>
              )}
              <p className="text-lg font-semibold">
                {formatCurrency(activePrice)}
              </p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
