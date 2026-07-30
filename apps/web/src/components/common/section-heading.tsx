import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string; title: string; description?: string; action?: React.ReactNode; className?: string;
}
export function SectionHeading({ eyebrow, title, description, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>}
        <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
