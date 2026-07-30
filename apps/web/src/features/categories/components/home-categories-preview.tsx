"use client";

import { Shapes } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useCategories } from "../hooks/use-categories";
import { CategoryCard } from "./category-card";

export function HomeCategoriesPreview() {
  const categories = useCategories();

  if (categories.isPending) {
    return (
      <div className="grid gap-5 md:grid-cols-3" role="status">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
        <span className="sr-only">Kategorije se učitavaju.</span>
      </div>
    );
  }
  if (categories.isError) {
    return (
      <ErrorState
        title="Kategorije trenutno nisu dostupne"
        description={getApiErrorMessage(categories.error)}
        onRetry={() => void categories.refetch()}
      />
    );
  }
  if (categories.data.length === 0) {
    return (
      <EmptyState
        icon={Shapes}
        title="Kategorije stižu uskoro"
        description="Još nema kategorija za prikaz."
      />
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {categories.data.slice(0, 3).map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
