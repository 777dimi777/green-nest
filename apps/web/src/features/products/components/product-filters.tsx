"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/types/category";
import { useCatalogUrl } from "../hooks/use-catalog-url";

interface ProductFiltersProps {
  categories: Category[];
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  idPrefix?: string;
  onApplied?: () => void;
}

export function ProductFilters({
  categories,
  categoryId,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  idPrefix = "catalog",
  onApplied,
}: ProductFiltersProps) {
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const updateUrl = useCatalogUrl();

  function applyPrices(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUrl({
      minPrice: validPrice(minPrice, true),
      maxPrice: validPrice(maxPrice, false),
      page: null,
    });
    onApplied?.();
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    updateUrl({
      search: null,
      categoryId: null,
      minPrice: null,
      maxPrice: null,
      sortBy: null,
      sortOrder: null,
      page: null,
    });
    onApplied?.();
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-category-filter`}>Kategorija</Label>
        <select
          id={`${idPrefix}-category-filter`}
          value={categoryId}
          onChange={(event) => {
            updateUrl({
              categoryId: event.target.value || null,
              page: null,
            });
            onApplied?.();
          }}
          className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Sve kategorije</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <form className="space-y-4" onSubmit={applyPrices}>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Raspon cene</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`${idPrefix}-min-price`} className="sr-only">
                Minimalna cena
              </Label>
              <Input
                id={`${idPrefix}-min-price`}
                inputMode="decimal"
                min="0"
                type="number"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Od"
              />
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-max-price`} className="sr-only">
                Maksimalna cena
              </Label>
              <Input
                id={`${idPrefix}-max-price`}
                inputMode="decimal"
                min="0.01"
                type="number"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Do"
              />
            </div>
          </div>
        </fieldset>
        <Button type="submit" variant="secondary" className="w-full">
          Primeni cenu
        </Button>
      </form>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={clearFilters}
      >
        Obriši filtere
      </Button>
    </div>
  );
}

function validPrice(value: string, allowZero: boolean) {
  const number = Number(value);
  const valid = allowZero ? number >= 0 : number > 0;
  return value && Number.isFinite(number) && valid ? String(number) : null;
}
