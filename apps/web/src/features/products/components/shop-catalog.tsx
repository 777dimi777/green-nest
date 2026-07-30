"use client";

import { Sprout } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { ProductsQuery } from "@/types/product";
import { useProducts } from "../hooks/use-products";
import { CatalogPagination } from "./catalog-pagination";
import { MobileProductFilters } from "./mobile-product-filters";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ProductSearch } from "./product-search";
import { ProductSort } from "./product-sort";

const sortFields = ["createdAt", "name", "price", "stock"] as const;
const sortOrders = ["asc", "desc"] as const;

export function ShopCatalog() {
  const searchParams = useSearchParams();
  const paramString = searchParams.toString();
  const parsed = parseCatalogParams(new URLSearchParams(paramString));
  const products = useProducts(parsed.query);
  const categories = useCategories();
  const categoryItems = categories.data ?? [];

  return (
    <>
      <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ProductSearch
          key={parsed.search}
          initialValue={parsed.search}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MobileProductFilters
            categories={categoryItems}
            categoryId={parsed.categoryId}
            minPrice={parsed.minPrice}
            maxPrice={parsed.maxPrice}
          />
          <ProductSort
            sortBy={parsed.query.sortBy ?? "createdAt"}
            sortOrder={parsed.query.sortOrder ?? "desc"}
          />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border bg-card p-5">
            <h2 className="mb-6 font-serif text-2xl font-semibold">Filteri</h2>
            <ProductFilters
              idPrefix="desktop"
              categories={categoryItems}
              categoryId={parsed.categoryId}
              minPrice={parsed.minPrice}
              maxPrice={parsed.maxPrice}
            />
          </div>
        </aside>
        <section aria-labelledby="results-heading">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="results-heading" className="font-semibold">
              {products.data
                ? `${products.data.pagination.total} pronađenih proizvoda`
                : "Proizvodi"}
            </h2>
          </div>
          {products.isPending ? (
            <ProductGridSkeleton />
          ) : products.isError ? (
            <ErrorState
              title="Proizvodi trenutno nisu dostupni"
              description={getApiErrorMessage(products.error)}
              onRetry={() => void products.refetch()}
            />
          ) : products.data.data.length === 0 ? (
            <EmptyState
              icon={Sprout}
              title="Nema proizvoda za ove kriterijume"
              description="Promenite pretragu ili uklonite neki od filtera."
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <CatalogPagination pagination={products.data.pagination} />
            </>
          )}
        </section>
      </div>
    </>
  );
}

function parseCatalogParams(searchParams: URLSearchParams): {
  query: ProductsQuery;
  search: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
} {
  const search = searchParams.get("search")?.trim() ?? "";
  const categoryId = searchParams.get("categoryId")?.trim() ?? "";
  const minPrice = validNumberParam(searchParams.get("minPrice"), true);
  const maxPrice = validNumberParam(searchParams.get("maxPrice"), false);
  const pageValue = Number(searchParams.get("page"));
  const sortByValue = searchParams.get("sortBy");
  const sortOrderValue = searchParams.get("sortOrder");
  const sortBy = sortFields.find((value) => value === sortByValue);
  const sortOrder = sortOrders.find((value) => value === sortOrderValue);

  return {
    search,
    categoryId,
    minPrice,
    maxPrice,
    query: {
      search: search || undefined,
      categoryId: categoryId || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      sortOrder,
      page:
        Number.isInteger(pageValue) && pageValue > 1 ? pageValue : undefined,
      limit: 12,
    },
  };
}

function validNumberParam(value: string | null, allowZero: boolean) {
  if (!value) return "";
  const number = Number(value);
  const minimum = allowZero ? 0 : Number.EPSILON;
  return Number.isFinite(number) && number >= minimum ? String(number) : "";
}
