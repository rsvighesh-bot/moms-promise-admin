import { useState } from "react";
import { Plus, Pencil, Trash2, Video as VideoIcon } from "lucide-react";
import { useFilterParams } from "../../lib/useFilterParams";
import { useShopVideosList, useDeleteShopVideo } from "./useShopVideos";
import { type ShopVideo } from "./shopVideoApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ShopVideoFormModal } from "./ShopVideoFormModal";

const MAX_ACTIVE = 8;

export function ShopVideosPage() {
  const { filters, page, setFilters, setPage } = useFilterParams({
    status: "active",
  });
  const { data, isLoading } = useShopVideosList(filters, page);
  const deleteMutation = useDeleteShopVideo();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ShopVideo | null>(null);
  const [deleting, setDeleting] = useState<ShopVideo | null>(null);

  const activeCount =
    filters.status === "active" ? (data?.totalDocs ?? 0) : undefined;

  const columns: Column<ShopVideo>[] = [
    {
      key: "video",
      header: "",
      render: (row) => (
        <video
          src={row.videoUrl}
          className="w-10 h-16 rounded-md object-cover ring-1 ring-border bg-black"
          muted
        />
      ),
    },
    {
      key: "caption",
      header: "Caption",
      render: (row) => (
        <div>
          <div className="font-medium">
            {row.caption || <span className="text-muted">No caption</span>}
          </div>
          {row.productId && (
            <div className="text-xs text-muted font-data">
              🛍 {row.productId.name}
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
          <h1 className="text-xl font-bold">Shop Videos</h1>
          <p className="text-sm text-muted mt-0.5">
            Homepage TikTok-style reel — up to {MAX_ACTIVE} active at a time
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
            <Plus size={16} /> New Video
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
            icon={VideoIcon}
            message="No videos yet"
            action={{
              label: "Add your first video",
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

      <ShopVideoFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        video={editing}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleting!._id, {
            onSuccess: () => setDeleting(null),
          })
        }
        title="Deactivate video?"
        message={`This video will be hidden from the storefront. You can reactivate it anytime.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
