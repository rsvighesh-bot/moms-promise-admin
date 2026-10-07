import { useState } from "react";
import { Plus, Pencil, Trash2, Search, FolderOpen } from "lucide-react";
import { useFilterParams } from "../../lib/useFilterParams";
import { useCategoriesList, useDeleteCategory } from "./useCategories";
import { type Category } from "./categoryApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { CategoryFormModal } from "./CategoryFormModal";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";

export function CategoriesPage() {
  const { filters, page, setFilters, setPage } = useFilterParams({
    search: "",
    status: "active",
  });
  const { data, isLoading } = useCategoriesList(filters, page);
  const deleteMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  const navigate = useNavigate();

  const columns: Column<Category>[] = [
    {
      key: "image",
      header: "",
      render: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt=""
            className="w-11 h-11 rounded-lg object-cover ring-1 ring-border"
          />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-bg ring-1 ring-border flex items-center justify-center text-muted">
            <FolderOpen size={16} />
          </div>
        ),
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted font-data">/{row.slug}</div>
        </div>
      ),
    },
    {
      key: "sortOrder",
      header: "Sort",
      render: (row) => row.sortOrder,
      className: "font-data text-center",
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
              setEditingCategory(row);
              setFormOpen(true);
            }}
            className="p-1.5 rounded-md text-muted hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            title="Delete"
            onClick={() => setDeletingCategory(row)}
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
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Categories</h1>
          <p className="text-sm text-muted mt-0.5">
            {data
              ? `${data.totalDocs} categor${data.totalDocs === 1 ? "y" : "ies"}`
              : "Loading..."}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setFormOpen(true);
          }}
        >
          <span className="flex items-center gap-2">
            <Plus size={16} /> New Category
          </span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-50 sm:flex-none sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            placeholder="Search categories..."
            defaultValue={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="font-data w-full pl-9 pr-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
          className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.docs ?? []}
        isLoading={isLoading}
        getRowId={(row) => row._id}
        onRowClick={(row) => navigate(`/subcategories?categoryId=${row._id}`)}
        emptyMessage={
          <EmptyState
            icon={FolderOpen}
            message="No categories yet"
            action={{
              label: "Create your first category",
              onClick: () => {
                setEditingCategory(null);
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

      <CategoryFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        category={editingCategory}
      />

      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() =>
          deleteMutation.mutate(deletingCategory!._id, {
            onSuccess: () => setDeletingCategory(null),
          })
        }
        title="Deactivate category?"
        message={`"${deletingCategory?.name}" will be marked inactive and hidden from the storefront. You can reactivate it anytime from the status filter.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
