import Link from "next/link";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Green Nest početna"
      className={cn(
        "inline-flex items-center gap-2 text-foreground",
        className,
      )}
    >
      <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
        <Leaf className="size-4" />
      </span>
      <span className="font-serif text-2xl font-bold tracking-tight">
        Green Nest
      </span>
    </Link>
  );
}
