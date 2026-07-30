import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function LoadingSpinner({ className, label = "Učitavanje" }: { className?: string; label?: string }) {
  return <span role="status" className="inline-flex items-center"><LoaderCircle className={cn("size-5 animate-spin", className)} /><span className="sr-only">{label}</span></span>;
}
