"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { formatDateTime } from "@/lib/utils/date";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { NotificationType } from "@/types/notification";
import { adminApi } from "../api/admin-api";
import { adminQueryKeys } from "../queries/admin-query-keys";
import { DataTable } from "./data-table";
const types: NotificationType[] = [
  "ORDER_CREATED",
  "ORDER_CONFIRMED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "ORDER_CANCELLED",
  "PAYMENT_COMPLETED",
  "PAYMENT_FAILED",
  "PAYMENT_REFUNDED",
  "GENERAL",
];
export function AdminNotifications() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [read, setRead] = useState(""),
    [type, setType] = useState("");
  const query = {
    page,
    limit: 20,
    search: search || undefined,
    read: read === "" ? undefined : read === "true",
    type: type ? (type as NotificationType) : undefined,
  };
  const q = useQuery({
    queryKey: adminQueryKeys.notifications.list(query),
    queryFn: () => adminApi.notifications.list(query),
  });
  return (
    <>
      <p className="text-sm text-primary">Administracija</p>
      <h1 className="font-serif text-4xl font-semibold">Notifikacije</h1>
      <div className="my-6 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Pretraga
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Naslov, poruka ili email"
          />
        </label>
        <label className="text-sm">
          Status
          <select
            className="mt-1 h-10 w-full rounded-md border bg-background px-3"
            value={read}
            onChange={(e) => {
              setRead(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Sve</option>
            <option value="false">Nepročitane</option>
            <option value="true">Pročitane</option>
          </select>
        </label>
        <label className="text-sm">
          Tip
          <select
            className="mt-1 h-10 w-full rounded-md border bg-background px-3"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Svi tipovi</option>
            {types.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      {q.isPending ? (
        <Skeleton className="h-80" />
      ) : q.isError ? (
        <ErrorState
          title="Notifikacije nisu dostupne"
          description={getApiErrorMessage(q.error)}
          onRetry={() => void q.refetch()}
        />
      ) : (
        <>
          <DataTable
            rows={q.data.data}
            rowKey={(n) => n.id}
            columns={[
              {
                key: "title",
                label: "Naslov",
                render: (n) => (
                  <Link
                    className="font-medium text-primary"
                    href={`/admin/notifikacije/${n.id}`}
                  >
                    {n.title}
                  </Link>
                ),
              },
              {
                key: "recipient",
                label: "Primalac",
                render: (n) => n.user.email,
              },
              { key: "type", label: "Tip", render: (n) => n.type },
              {
                key: "message",
                label: "Poruka",
                render: (n) => (
                  <span className="line-clamp-2">{n.message}</span>
                ),
              },
              {
                key: "read",
                label: "Status",
                render: (n) => (n.read ? "Pročitana" : "Nepročitana"),
              },
              {
                key: "created",
                label: "Kreirano",
                render: (n) => formatDateTime(n.createdAt),
              },
            ]}
          />
          <nav
            aria-label="Paginacija notifikacija"
            className="mt-5 flex items-center justify-between"
          >
            <Button
              variant="outline"
              disabled={!q.data.pagination.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Prethodna
            </Button>
            <span>
              Strana {q.data.pagination.page} od{" "}
              {Math.max(1, q.data.pagination.totalPages)} ·{" "}
              {q.data.pagination.total} ukupno
            </span>
            <Button
              variant="outline"
              disabled={!q.data.pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Sledeća
            </Button>
          </nav>
        </>
      )}
    </>
  );
}
export function AdminNotificationDetails({ id }: { id: string }) {
  const q = useQuery({
    queryKey: adminQueryKeys.notifications.detail(id),
    queryFn: () => adminApi.notifications.detail(id),
  });
  if (q.isPending) return <Skeleton className="h-72" />;
  if (q.isError)
    return (
      <ErrorState
        title="Notifikacija nije dostupna"
        description={getApiErrorMessage(q.error)}
        onRetry={() => void q.refetch()}
      />
    );
  const n = q.data;
  return (
    <>
      <p className="mb-5 text-sm">
        <Link href="/admin/notifikacije" className="text-primary">
          Notifikacije
        </Link>{" "}
        / Detalji
      </p>
      <h1 className="font-serif text-4xl font-semibold">{n.title}</h1>
      <dl className="mt-8 max-w-3xl rounded-xl border p-6">
        <Row
          label="Primalac"
          value={`${n.user.firstName} ${n.user.lastName} · ${n.user.email}`}
        />
        <Row label="Tip" value={n.type} />
        <Row label="Status" value={n.read ? "Pročitana" : "Nepročitana"} />
        <Row label="Kreirano" value={formatDateTime(n.createdAt)} />
        <Row label="Poruka" value={n.message} />
      </dl>
    </>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b py-3 sm:grid-cols-[140px_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value}</dd>
    </div>
  );
}
