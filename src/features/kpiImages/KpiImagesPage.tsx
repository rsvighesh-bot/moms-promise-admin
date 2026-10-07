import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { useFilterParams } from "../../lib/useFilterParams";
import { useKpiImagesList, useDeleteKpiImage } from "./useKpiImages";
import { type KpiImage } from "./kpiImageApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { KpiImageFormModal } from "./KpiImageFormModal";

const MAX_ACTIVE = 4;

export function KpiImagesPage() {
  const { filters, page, setFilters, setPage } = useFilterParams({
    status: "active",
  });
  const { data, isLoading } = useKpiImagesList(filters, page);
  const deleteMutation = useDeleteKpiImage();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KpiImage | null>(null);
  const [deleting, setDeleting] = useState<KpiImage | null>(null);

  const activeCount =
    filters.status === "active" ? (data?.totalDocs ?? 0) : undefined;

  const columns: Column<KpiImage>[] = [
    {
      key: "image",
      header: "",
      render: (row) => (
        <img
          src={row.imageUrl}
          alt=""
          className="w-20 h-12 rounded-md object-cover ring-1 ring-border"
        />
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <div>
          <div className="font-medium">
            {row.title || <span className="text-muted">Untitled</span>}
          </div>
          {row.linkUrl && (
            <div className="text-xs text-muted flex items-center gap-1 font-data">
              <ExternalLink size={11} /> {row.linkUrl}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "sortOrder",
      header: "Sort",
      className: "font-data text-center",
      render: (row) => row.sortOrder,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <button
            title="Edit"
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
            className="p-1.5 rounded-md text-muted hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            title="Delete"
            onClick={() => setDeleting(row)}
            className="p-1.5 rounded-md text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">KPI Images</h1>
          <p className="text-sm text-muted mt-0.5">
            Homepage gallery below &quot;About Us&quot; — up to {MAX_ACTIVE}{" "}
            active at a time
            {activeCount !== undefined ? ` (${activeCount}/${MAX_ACTIVE} active)` : ""}
            .
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <span className="flex items-center gap-2">
            <Plus size={16} /> New KPI Image
          </span>
        </Button>
      </div>

      <select
        value={filters.status}
        onChange={(e) => setFilters({ status: e.target.value })}
        className="font-data mb-4 px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="">All</option>
      </select>

      <DataTable
        columns={columns}
        data={data?.docs ?? []}
        isLoading={isLoading}
        getRowId={(row) => row._id}
        emptyMessage={
          <EmptyState
            icon={ImageIcon}
            message="No KPI images yet"
            action={{
              label: "Add your first KPI image",
              onClick: () => {
                setEditing(null);
                setFormOpen(true);
              },
            }}
          />
        }
      />

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}

      <KpiImageFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        image={editing}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleting!._id, {
            onSuccess: () => setDeleting(null),
          })
        }
        title="Deactivate KPI image?"
        message={`This image will be hidden from the storefront. You can reactivate it anytime.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
