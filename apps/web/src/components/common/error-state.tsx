"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Nešto nije u redu",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border p-8 text-center">
      <CircleAlert className="mx-auto mb-4 size-8 text-destructive" />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button className="mt-5" onClick={onRetry}>
          Pokušaj ponovo
        </Button>
      )}
    </div>
  );
}
