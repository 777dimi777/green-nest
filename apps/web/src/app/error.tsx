"use client";
import { ErrorState } from "@/components/common/error-state";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-lg">
        <ErrorState
          title="Stranica trenutno ne može da se prikaže"
          description="Pokušajte ponovo. Ako se problem nastavi, vratite se na početnu stranicu."
          onRetry={reset}
        />
      </div>
    </main>
  );
}
