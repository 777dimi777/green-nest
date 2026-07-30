import type { ProductsQuery } from "@/types/product";

export const productQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  list: (query: ProductsQuery) =>
    [...productQueryKeys.lists(), query] as const,
  details: () => [...productQueryKeys.all, "detail"] as const,
  detail: (slug: string) => [...productQueryKeys.details(), slug] as const,
};
