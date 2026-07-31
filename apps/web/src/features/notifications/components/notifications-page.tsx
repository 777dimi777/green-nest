"use client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/date";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/use-notifications";
export function NotificationsPage() {
  const q = useNotifications(),
    read = useMarkNotificationRead(),
    all = useMarkAllRead();
  if (q.isPending) return <Skeleton className="h-80" />;
  if (q.isError)
    return (
      <ErrorState
        title="Notifikacije nisu dostupne"
        description={getApiErrorMessage(q.error)}
        onRetry={() => void q.refetch()}
      />
    );
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl font-semibold">Notifikacije</h1>
          <p className="mt-2 text-muted-foreground">
            {q.data.pagination.total} obaveštenja
          </p>
        </div>
        <Button
          variant="outline"
          disabled={all.isPending}
          onClick={() => all.mutate()}
        >
          Označi sve pročitano
        </Button>
      </div>
      {!q.data.data.length ? (
        <div className="mt-8">
          <EmptyState
            icon={Bell}
            title="Nema notifikacija"
            description="Obaveštenja o porudžbinama pojaviće se ovde."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {q.data.data.map((n) => (
            <button
              key={n.id}
              className={`w-full rounded-xl border p-5 text-left ${!n.read ? "bg-secondary/40" : ""}`}
              disabled={read.isPending}
              onClick={() => {
                if (!n.read) read.mutate(n.id);
              }}
            >
              <div className="flex justify-between gap-4">
                <strong>{n.title}</strong>
                <time className="text-xs text-muted-foreground">
                  {formatDateTime(n.createdAt)}
                </time>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{n.message}</p>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
