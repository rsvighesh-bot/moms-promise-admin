import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Monitor,
  Smartphone,
} from "lucide-react";
import { useFilterParams } from "../../lib/useFilterParams";
import { useBannersList, useDeleteBanner } from "./useBanners";
import { type Banner } from "./bannerApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { BannerFormModal } from "./BannerFormModal";

export function BannersPage() {
  const { filters, page, setFilters, setPage } = useFilterParams({
    status: "active",
  });
  const { data, isLoading } = useBannersList(filters, page);
  const deleteMutation = useDeleteBanner();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);

  const columns: Column<Banner>[] = [
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
      key: "device",
      header: "Show on",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-muted" title={row.device}>
          {(row.device === "desktop" || row.device === "all") && (
            <Monitor size={15} />
          )}
          {(row.device === "mobile" || row.device === "all") && (
            <Smartphone size={15} />
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
          <h1 className="text-xl font-bold">Banners</h1>
          <p className="text-sm text-muted mt-0.5">
            {data
              ? `${data.totalDocs} banner${data.totalDocs === 1 ? "" : "s"}`
              : "Loading..."}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <span className="flex items-center gap-2">
            <Plus size={16} /> New Banner
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
            message="No banners yet"
            action={{
              label: "Create your first banner",
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

      <BannerFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        banner={editing}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleting!._id, {
            onSuccess: () => setDeleting(null),
          })
        }
        title="Deactivate banner?"
        message={`This banner will be hidden from the storefront. You can reactivate it anytime.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
