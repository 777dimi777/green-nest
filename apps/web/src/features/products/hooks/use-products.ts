"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProductsQuery } from "@/types/product";
import { productsApi } from "../api/products-api";
import { productQueryKeys } from "../queries/product-query-keys";

export function useProducts(query: ProductsQuery) {
  return useQuery({
    queryKey: productQueryKeys.list(query),
    queryFn: () => productsApi.getProducts(query),
    staleTime: 60_000,
  });
}
