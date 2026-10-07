import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Shirt } from "lucide-react";
import { useFilterParams } from "../../lib/useFilterParams";
import { useActiveCategories } from "../categories/useActiveCategories";
import { useSubCategoriesList } from "../subcategories/useSubCategories";
import { useProductsList, useDeleteProduct } from "./useProducts";
import { type ProductListItem } from "./productApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProductFormModal } from "./ProductFormModal";
import { formatMoney } from "../../lib/format";

export function ProductsPage() {
  const navigate = useNavigate();
  const { filters, page, setFilters, setPage } = useFilterParams({
    search: "",
    status: "",
    categoryId: "",
    subCategoryId: "",
  });
  const { data, isLoading } = useProductsList(filters, page);
  const { data: categories } = useActiveCategories();
  const { data: subCategories } = useSubCategoriesList(
    filters.categoryId,
    "active",
  );
  const deleteMutation = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductListItem | null>(null);
  const [deleting, setDeleting] = useState<ProductListItem | null>(null);

  const handleCategoryChange = (categoryId: string) => {
    // Switching category invalidates whatever subcategory was selected —
    // clear it in the same update so the URL never holds a mismatched pair.
    setFilters({ categoryId, subCategoryId: "" });
  };

  const columns: Column<ProductListItem>[] = [
    {
      key: "image",
      header: "",
      render: (row) =>
        row.images[0] ? (
          <img
            src={row.images[0]}
            alt=""
            className="w-11 h-11 rounded-lg object-cover ring-1 ring-border"
          />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-bg ring-1 ring-border flex items-center justify-center text-muted">
            <Shirt size={16} />
          </div>
        ),
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted font-data">{row.sku}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <div>
          <div>{row.categoryId?.name ?? "—"}</div>
          <div className="text-xs text-muted">
            {row.subCategoryId?.name ?? "—"}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      className: "font-data",
      render: (row) => (
        <div>
          <div>{formatMoney(row.sellingPrice)}</div>
          {row.discountPercent > 0 && (
            <div className="text-xs text-muted line-through">
              {formatMoney(row.mrp)}
            </div>
          )}
        </div>
      ),
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
            title="Unpublish"
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
          <h1 className="text-xl font-bold">Products</h1>
          <p className="text-sm text-muted mt-0.5">
            {data
              ? `${data.totalDocs} product${data.totalDocs === 1 ? "" : "s"}`
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
            <Plus size={16} /> New Product
          </span>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-50 sm:flex-none sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            placeholder="Search products..."
            defaultValue={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="font-data w-full pl-9 pr-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={filters.categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.subCategoryId}
          onChange={(e) => setFilters({ subCategoryId: e.target.value })}
          disabled={!filters.categoryId}
          className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="">
            {filters.categoryId ? "All subcategories" : "Pick a category first"}
          </option>
          {subCategories?.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
          className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.docs ?? []}
        isLoading={isLoading}
        getRowId={(row) => row._id}
        onRowClick={(row) => navigate(`/products/${row._id}/variants`)}
        emptyMessage={
          <EmptyState
            icon={Shirt}
            message="No products yet"
            action={{
              label: "Create your first product",
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

      <ProductFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        product={
          editing
            ? {
                ...editing,
                categoryId: editing.categoryId?._id ?? "",
                subCategoryId: editing.subCategoryId?._id ?? "",
              }
            : null
        }
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleting!._id, {
            onSuccess: () => setDeleting(null),
          })
        }
        title="Unpublish product?"
        message={`"${deleting?.name}" will be set back to draft and removed from the storefront.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
