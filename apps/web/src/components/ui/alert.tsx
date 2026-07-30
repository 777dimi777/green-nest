import { cn } from "@/lib/utils/cn";

export function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="alert" className={cn("relative rounded-lg border bg-card p-4 text-sm", className)} {...props} />;
}
export function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return <h5 className={cn("mb-1 font-medium", className)} {...props} />;
}
export function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-muted-foreground", className)} {...props} />;
}
