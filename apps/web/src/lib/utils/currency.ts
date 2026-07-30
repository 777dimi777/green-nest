export function formatCurrency(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
  }).format(Number.isFinite(amount) ? amount : 0);
}
