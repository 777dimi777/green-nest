"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products-api";
import { productQueryKeys } from "../queries/product-query-keys";

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productQueryKeys.detail(slug),
    queryFn: () => productsApi.getProductDetails(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}
