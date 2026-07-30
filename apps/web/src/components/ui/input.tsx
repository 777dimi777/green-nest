import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input type={type} className={cn(
      "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
      className,
    )} {...props} />
  );
}
