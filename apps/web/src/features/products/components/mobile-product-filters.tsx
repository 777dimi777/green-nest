"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/types/category";
import { ProductFilters } from "./product-filters";

interface MobileProductFiltersProps {
  categories: Category[];
  categoryId: string;
  minPrice: string;
  maxPrice: string;
}

export function MobileProductFilters(props: MobileProductFiltersProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal />
          Filteri
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>Filteri proizvoda</SheetTitle>
        <SheetDescription>
          Suzite ponudu prema kategoriji i ceni.
        </SheetDescription>
        <div className="mt-8">
          <ProductFilters {...props} idPrefix="mobile" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
