import { type ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string; // e.g. "font-data" for numeric columns
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: ReactNode;
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "No records found.",
  getRowId,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return <div className="py-12 text-center text-muted">Loading...</div>;
  }
  if (data.length === 0) {
    return <div className="py-12 text-center text-muted">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 font-medium text-muted whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={getRowId(row)}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border last:border-0 hover:bg-surface/50 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 whitespace-nowrap ${col.className ?? ""}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
