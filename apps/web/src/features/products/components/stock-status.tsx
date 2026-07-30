import { cn } from "@/lib/utils/cn";

export function getStockLabel(stock: number) {
  if (stock <= 0) return "Nema na stanju";
  if (stock <= 5) return "Male zalihe";
  return "Dostupno";
}

export function StockStatus({
  stock,
  className,
}: {
  stock: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium",
        stock <= 0
          ? "text-destructive"
          : stock <= 5
            ? "text-amber-700 dark:text-amber-400"
            : "text-primary",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-current"
      />
      {getStockLabel(stock)}
    </span>
  );
}
