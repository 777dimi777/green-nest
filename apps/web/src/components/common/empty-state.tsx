import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description: string; action?: React.ReactNode;
}) {
  return <div className="rounded-xl border border-dashed p-8 text-center"><Icon className="mx-auto mb-4 size-8 text-muted-foreground" /><h2 className="font-semibold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
