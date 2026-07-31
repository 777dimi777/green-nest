"use client";
import { useQuery } from "@tanstack/react-query";
import { Banknote, Boxes, ShoppingCart, UsersRound } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { adminApi } from "../api/admin-api";
import { adminQueryKeys } from "../queries/admin-query-keys";
const tip = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    color: "hsl(var(--card-foreground))",
    boxShadow: "0 12px 30px rgb(0 0 0/.25)",
  },
  labelStyle: { color: "hsl(var(--muted-foreground))" },
  cursor: { fill: "hsl(var(--muted)/.35)" },
} as const;
export function AdminDashboard() {
  const q = useQuery({
    queryKey: adminQueryKeys.analytics,
    queryFn: async () => {
      const [overview, revenue, users, orders, payments] = await Promise.all([
        adminApi.analytics.overview(),
        adminApi.analytics.revenue(),
        adminApi.analytics.users(),
        adminApi.analytics.orders(),
        adminApi.analytics.payments(),
      ]);
      return { overview, revenue, users, orders, payments };
    },
  });
  if (q.isPending) return <Skeleton className="h-[600px]" />;
  if (q.isError)
    return (
      <ErrorState
        title="Analitika nije dostupna"
        description={getApiErrorMessage(q.error)}
        onRetry={() => void q.refetch()}
      />
    );
  const { overview, revenue, users, orders, payments } = q.data,
    cards = [
      [Banknote, "Prihod", formatCurrency(overview.totals.revenue)],
      [ShoppingCart, "Porudžbine", overview.totals.orders],
      [UsersRound, "Novi korisnici", overview.totals.users],
      [Boxes, "Objavljeni proizvodi", overview.totals.products],
    ] as const;
  return (
    <>
      <p className="text-sm font-medium text-primary">Pregled poslovanja</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold">
        Admin kontrolna tabla
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, label, value]) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">{label}</CardTitle>
              <Icon className="text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {value}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Chart title="Prihod">
          <AreaChart data={revenue.data}>
            <Grid />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip {...tip} />
            <Area
              dataKey="revenue"
              name="Prihod"
              stroke="#3f7d55"
              fill="#3f7d5555"
            />
          </AreaChart>
        </Chart>
        <Chart title="Novi korisnici">
          <BarChart data={users.data}>
            <Grid />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip {...tip} />
            <Bar
              dataKey="users"
              name="Korisnici"
              fill="#4f9368"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </Chart>
        <Chart title="Porudžbine po statusu">
          <BarChart data={orders.statuses}>
            <Grid />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip {...tip} />
            <Bar
              dataKey="count"
              name="Porudžbine"
              fill="#719f78"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </Chart>
        <Card>
          <CardHeader>
            <CardTitle>Uspešnost plaćanja</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-semibold text-primary">
              {payments.successRate}%
            </p>
            <p className="mt-3 text-muted-foreground">
              {payments.totals.completed} uspešnih od {payments.totals.attempts}{" "}
              pokušaja
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
function Grid() {
  return <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />;
}
function Chart({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80 pl-1 pr-4 sm:pl-3">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
