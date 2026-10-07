import { useState } from "react";
import { Plus, Pencil, Trash2, MessageSquareQuote } from "lucide-react";
import { useFilterParams } from "../../lib/useFilterParams";
import { useReviewsList, useDeleteReview } from "./useReviews";
import { type Review } from "./reviewApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { StarRatingDisplay } from "../../components/ui/StarRatingDisplay";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ReviewFormModal } from "./ReviewFormModal";

export function ReviewsPage() {
  const { filters, page, setFilters, setPage } = useFilterParams({
    status: "active",
  });
  const { data, isLoading } = useReviewsList(filters, page);
  const deleteMutation = useDeleteReview();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState<Review | null>(null);

  const columns: Column<Review>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          {row.customerImage ? (
            <img
              src={row.customerImage}
              alt=""
              className="w-8 h-8 rounded-full object-cover ring-1 ring-border shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {row.customerName[0]?.toUpperCase()}
            </div>
          )}
          <span className="font-medium">{row.customerName}</span>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StarRatingDisplay rating={row.rating} size={14} />
          <span className="text-xs text-muted font-data">{row.rating}</span>
        </div>
      ),
    },
    {
      key: "reviewText",
      header: "Review",
      render: (row) => (
        <p className="max-w-sm truncate text-muted">{row.reviewText}</p>
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
          <h1 className="text-xl font-bold">Customer Reviews</h1>
          <p className="text-sm text-muted mt-0.5">
            {data
              ? `${data.totalDocs} review${data.totalDocs === 1 ? "" : "s"}`
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
            <Plus size={16} /> New Review
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
            icon={MessageSquareQuote}
            message="No reviews yet"
            action={{
              label: "Add your first review",
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

      <ReviewFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        review={editing}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleting!._id, {
            onSuccess: () => setDeleting(null),
          })
        }
        title="Deactivate review?"
        message={`This review will be hidden from the storefront. You can reactivate it anytime.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
