import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useFilterParams } from "../../lib/useFilterParams";
import { useCouponsList, useToggleCoupon, useDeleteCoupon } from "./useCoupons";
import { type Coupon } from "./couponApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { CouponFormModal } from "./CouponFormModal";
import { formatMoney } from "../../lib/format";

export function CouponsPage() {
  const { filters, page, setFilters, setPage } = useFilterParams({
    isActive: "true",
  });
  const { data, isLoading } = useCouponsList(filters, page);
  const toggleMutation = useToggleCoupon();
  const deleteMutation = useDeleteCoupon();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);

  const formatDiscount = (c: Coupon) =>
    c.discountType === "percentage"
      ? `${c.discountValue}%${c.maxDiscountAmount ? ` (max ${formatMoney(c.maxDiscountAmount)})` : ""}`
      : formatMoney(c.discountValue);

  const columns: Column<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      render: (row) => (
        <span className="font-data font-semibold tracking-wide text-primary">
          {row.code}
        </span>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      className: "font-data",
      render: (row) => formatDiscount(row),
    },
    {
      key: "minCart",
      header: "Min. cart",
      className: "font-data",
      render: (row) => formatMoney(row.minCartValue),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <button
          title={row.isActive ? "Click to deactivate" : "Click to activate"}
          onClick={(e) => {
            e.stopPropagation();
            toggleMutation.mutate(row._id);
          }}
          disabled={toggleMutation.isPending}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors
            ${
              row.isActive
                ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600"
                : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
            }`}
        >
          {row.isActive ? (
            <>
              <ToggleRight size={14} /> Active
            </>
          ) : (
            <>
              <ToggleLeft size={14} /> Inactive
            </>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div
          className="flex gap-1 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
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
          <h1 className="text-xl font-bold">Coupons</h1>
          <p className="text-sm text-muted mt-0.5">
            {data
              ? `${data.totalDocs} coupon${data.totalDocs === 1 ? "" : "s"}`
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
            <Plus size={16} /> New Coupon
          </span>
        </Button>
      </div>

      {/* Filter */}
      <select
        value={filters.isActive}
        onChange={(e) => setFilters({ isActive: e.target.value })}
        className="font-data mb-4 px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>

      <DataTable
        columns={columns}
        data={data?.docs ?? []}
        isLoading={isLoading}
        getRowId={(row) => row._id}
        emptyMessage={
          <EmptyState
            icon={Tag}
            message="No coupons yet"
            action={{
              label: "Create your first coupon",
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

      <CouponFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        coupon={editing}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleting!._id, {
            onSuccess: () => setDeleting(null),
          })
        }
        title="Delete coupon?"
        message={`"${deleting?.code}" will be permanently deleted. Orders that used this code are unaffected since they snapshot the code as text.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
