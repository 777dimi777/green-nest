"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";

function visiblePages(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function CatalogPagination({
  pagination,
}: {
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (pagination.totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Paginacija proizvoda"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={!pagination.hasPreviousPage}
        onClick={() => goToPage(pagination.page - 1)}
      >
        <ChevronLeft />
        Prethodna
      </Button>
      {visiblePages(pagination.page, pagination.totalPages).map((page) => (
        <Button
          key={page}
          variant={page === pagination.page ? "default" : "outline"}
          size="sm"
          aria-current={page === pagination.page ? "page" : undefined}
          aria-label={`Stranica ${page}`}
          onClick={() => goToPage(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={!pagination.hasNextPage}
        onClick={() => goToPage(pagination.page + 1)}
      >
        Sledeća
        <ChevronRight />
      </Button>
    </nav>
  );
}
