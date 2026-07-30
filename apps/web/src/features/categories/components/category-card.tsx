import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProductImage } from "@/features/products/components/product-image";
import type { Category } from "@/types/category";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Card className="group overflow-hidden">
      <Link
        href={`/prodavnica?categoryId=${encodeURIComponent(category.id)}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <ProductImage
            src={category.image}
            alt={category.name}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-semibold">
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {category.description}
                </p>
              )}
            </div>
            <ArrowRight className="mt-2 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </div>
          <p className="mt-5 text-xs font-medium uppercase tracking-[.12em] text-muted-foreground">
            {category._count.products}{" "}
            {category._count.products === 1 ? "proizvod" : "proizvoda"}
          </p>
        </div>
      </Link>
    </Card>
  );
}
