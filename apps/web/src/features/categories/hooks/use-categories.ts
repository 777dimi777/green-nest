"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories-api";

export const categoryQueryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryQueryKeys.all, "list"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryQueryKeys.list(),
    queryFn: categoriesApi.getCategories,
    staleTime: 5 * 60_000,
  });
}
