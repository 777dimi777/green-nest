import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="Učitavanje proizvoda"
      role="status"
    >
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-1/3" />
          </CardContent>
        </Card>
      ))}
      <span className="sr-only">Proizvodi se učitavaju.</span>
    </div>
  );
}
