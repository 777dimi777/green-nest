function toValidDate(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | number | Date): string {
  const date = toValidDate(value);
  return date ? new Intl.DateTimeFormat("sr-RS", { dateStyle: "medium" }).format(date) : "—";
}

export function formatDateTime(value: string | number | Date): string {
  const date = toValidDate(value);
  return date
    ? new Intl.DateTimeFormat("sr-RS", { dateStyle: "medium", timeStyle: "short" }).format(date)
    : "—";
}
