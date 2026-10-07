import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { useProduct } from "../products/useProducts";
import { useVariantsList, useDeleteVariant } from "./useVariants";
import { type Variant } from "./variantApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { VariantFormModal } from "./VariantFormModal";
import { formatMoney } from "../../lib/format";

export function ProductVariantsPage() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product } = useProduct(productId!);

  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") ?? "active";

  const { data: variants, isLoading } = useVariantsList(productId!, status);
  const deleteMutation = useDeleteVariant();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Variant | null>(null);
  const [deleting, setDeleting] = useState<Variant | null>(null);

  const resolvePrice = (v: Variant) =>
    v.priceOverride ?? product?.sellingPrice ?? 0;
  const isLowStock = (v: Variant) => v.stockQuantity <= v.lowStockThreshold;

  const columns: Column<Variant>[] = [
    {
      key: "sku",
      header: "SKU",
      className: "font-data",
      render: (row) => row.sku,
    },
    { key: "age", header: "Age", render: (row) => `${row.age} yrs` },
    { key: "color", header: "Color", render: (row) => row.color ?? "—" },
    { key: "size", header: "Size", render: (row) => row.size ?? "—" },
    {
      key: "stock",
      header: "Stock",
      className: "font-data",
      render: (row) => (
        <span
          className={
            isLowStock(row)
              ? "text-red-500 font-medium flex items-center gap-1"
              : ""
          }
        >
          {isLowStock(row) && <AlertTriangle size={13} />}
          {row.stockQuantity}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      className: "font-data",
      render: (row) => formatMoney(resolvePrice(row)),
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
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Products
      </button>

      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">{product?.name ?? "Loading..."}</h1>
          <p className="text-sm text-muted mt-0.5 font-data">
            {product?.sku} · Base price{" "}
            {product ? formatMoney(product.sellingPrice) : "—"}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <span className="flex items-center gap-2">
            <Plus size={16} /> New Variant
          </span>
        </Button>
      </div>

      <select
        value={status}
        onChange={(e) =>
          setSearchParams(e.target.value ? { status: e.target.value } : {})
        }
        className="font-data mb-4 px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="">All</option>
      </select>

      <DataTable
        columns={columns}
        data={variants ?? []}
        isLoading={isLoading}
        getRowId={(row) => row._id}
        emptyMessage={
          <EmptyState
            icon={Layers}
            message="No variants yet — this product can't go active without at least one."
            action={{
              label: "Add a variant",
              onClick: () => {
                setEditing(null);
                setFormOpen(true);
              },
            }}
          />
        }
      />

      <VariantFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        productId={productId!}
        variant={editing}
        product={product}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleting!._id, {
            onSuccess: () => setDeleting(null),
          })
        }
        title="Deactivate variant?"
        message={`SKU "${deleting?.sku}" will be marked inactive and hidden from the storefront.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
