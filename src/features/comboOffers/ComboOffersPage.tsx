import { useState } from "react";
import { Plus, Pencil, Trash2, Gift } from "lucide-react";
import { useFilterParams } from "../../lib/useFilterParams";
import { useComboOffersList, useDeleteComboOffer } from "./useComboOffers";
import { type ComboOffer } from "./comboOfferApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ComboOfferFormModal } from "./ComboOfferFormModal";
import { formatMoney } from "../../lib/format";

export function ComboOffersPage() {
  const { filters, page, setFilters, setPage } = useFilterParams({
    status: "active",
  });
  const { data, isLoading } = useComboOffersList(filters, page);
  const deleteMutation = useDeleteComboOffer();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ComboOffer | null>(null);
  const [deleting, setDeleting] = useState<ComboOffer | null>(null);

  const columns: Column<ComboOffer>[] = [
    {
      key: "image",
      header: "",
      render: (row) => (
        <img
          src={row.imageUrl}
          alt=""
          className="w-12 h-12 rounded-md object-cover ring-1 ring-border"
        />
      ),
    },
    {
      key: "name",
      header: "Offer",
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted font-data">
            {row.productIds.length} products
          </div>
        </div>
      ),
    },
    {
      key: "pricing",
      header: "Pricing",
      className: "font-data",
      render: (row) =>
        row.discountType === "percentage"
          ? `${row.discountValue}% off`
          : `${formatMoney(row.discountValue)} flat`,
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
          <h1 className="text-xl font-bold">Combo Offers</h1>
          <p className="text-sm text-muted mt-0.5">
            {data
              ? `${data.totalDocs} combo${data.totalDocs === 1 ? "" : "s"}`
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
            <Plus size={16} /> New Combo Offer
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
            icon={Gift}
            message="No combo offers yet"
            action={{
              label: "Create your first combo offer",
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

      <ComboOfferFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        offer={editing}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleting!._id, {
            onSuccess: () => setDeleting(null),
          })
        }
        title="Deactivate combo offer?"
        message={`This combo will be hidden from the storefront. You can reactivate it anytime.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
