import { EmptyState } from "@/components/common/empty-state";
import { Database } from "lucide-react";
export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
}
export function DataTable<T>({
  rows,
  columns,
  rowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
}) {
  if (!rows.length)
    return (
      <EmptyState
        icon={Database}
        title="Nema podataka"
        description="Nema rezultata za izabrane kriterijume."
      />
    );
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table
        aria-label="Administrativni podaci"
        className="w-full min-w-[700px] text-sm"
      >
        <thead className="bg-muted/60 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
