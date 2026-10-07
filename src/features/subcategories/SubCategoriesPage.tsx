import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { useActiveCategories } from "../categories/useActiveCategories";
import { useSubCategoriesList, useDeleteSubCategory } from "./useSubCategories";
import { type SubCategory } from "./subCategoryApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { SubCategoryFormModal } from "./SubCategoryFormModal";
import { EmptyState } from "../../components/ui/EmptyState";

export function SubCategoriesPage() {
  const { data: categories } = useActiveCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId") ?? "";
  const status = searchParams.get("status") ?? "active";

  const { data: subCategories, isLoading } = useSubCategoriesList(
    categoryId,
    status,
  );
  const deleteMutation = useDeleteSubCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SubCategory | null>(null);
  const [deleting, setDeleting] = useState<SubCategory | null>(null);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set(key, value) : next.delete(key);
    setSearchParams(next);
  };

  const columns: Column<SubCategory>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      render: (row) => (
        <span className="font-data text-muted">/{row.slug}</span>
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
          <h1 className="text-xl font-bold">SubCategories</h1>
          <p className="text-sm text-muted mt-0.5">
            Pick a category to manage its subcategories
          </p>
        </div>
        <Button
          disabled={!categoryId}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <span className="flex items-center gap-2">
            <Plus size={16} /> New SubCategory
          </span>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={categoryId}
          onChange={(e) => updateParam("categoryId", e.target.value)}
          className="font-data w-full sm:w-64 px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a category...</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          className="font-data px-3 py-2.5 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {categoryId ? (
        <DataTable
          columns={columns}
          data={subCategories ?? []}
          isLoading={isLoading}
          getRowId={(row) => row._id}
          emptyMessage={
            <EmptyState
              icon={Layers}
              message="No subcategories yet"
              action={{
                label: "Create one",
                onClick: () => {
                  setEditing(null);
                  setFormOpen(true);
                },
              }}
            />
          }
        />
      ) : (
        <div className="py-12 text-center text-muted border border-dashed border-border rounded-lg">
          Select a category above to view its subcategories
        </div>
      )}

      <SubCategoryFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        categoryId={categoryId}
        subCategory={editing}
      />
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleting!._id, {
            onSuccess: () => setDeleting(null),
          })
        }
        title="Deactivate subcategory?"
        message={`"${deleting?.name}" will be marked inactive and hidden from the storefront.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
