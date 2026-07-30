"use client";

import { Label } from "@/components/ui/label";
import { useCatalogUrl } from "../hooks/use-catalog-url";

const sortOptions = [
  { value: "createdAt-desc", label: "Najnovije" },
  { value: "createdAt-asc", label: "Najstarije" },
  { value: "price-asc", label: "Cena: rastuće" },
  { value: "price-desc", label: "Cena: opadajuće" },
  { value: "name-asc", label: "Naziv: A–Š" },
  { value: "name-desc", label: "Naziv: Š–A" },
  { value: "stock-desc", label: "Najviše na stanju" },
] as const;

export function ProductSort({
  sortBy,
  sortOrder,
}: {
  sortBy: string;
  sortOrder: string;
}) {
  const updateUrl = useCatalogUrl();
  const value = `${sortBy}-${sortOrder}`;

  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="product-sort" className="whitespace-nowrap">
        Sortiraj
      </Label>
      <select
        id="product-sort"
        value={value}
        onChange={(event) => {
          const [nextSortBy, nextSortOrder] = event.target.value.split("-");
          updateUrl({
            sortBy: nextSortBy === "createdAt" ? null : nextSortBy,
            sortOrder: nextSortOrder === "desc" ? null : nextSortOrder,
            page: null,
          });
        }}
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
