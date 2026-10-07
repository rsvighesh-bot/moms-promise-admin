import { useState } from "react";
import { Plus, Users, ToggleLeft, ToggleRight } from "lucide-react";
import { useAdminsList, useToggleAdminStatus } from "./useSettings";
import { useAdminMe } from "../auth/useAdminMe";
import { type AdminUser } from "./settingsApi";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { CreateAdminModal } from "./CreateAdminModal";

export function AdminUsersPage() {
  const { data: admins, isLoading } = useAdminsList();
  const { data: me } = useAdminMe();
  const toggleMutation = useToggleAdminStatus();

  const [createOpen, setCreateOpen] = useState(false);
  const [toggling, setToggling] = useState<AdminUser | null>(null);

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted">{row.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium
          ${
            row.role === "superadmin"
              ? "bg-accent text-accent-foreground"
              : "bg-primary/10 text-primary"
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const isSelf = row._id === (me as any)?._id;
        return (
          <button
            disabled={isSelf || toggleMutation.isPending}
            title={
              isSelf
                ? "You cannot deactivate your own account"
                : row.status === "active"
                  ? "Click to block"
                  : "Click to unblock"
            }
            onClick={(e) => {
              e.stopPropagation();
              setToggling(row);
            }}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                row.status === "active"
                  ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600"
                  : "bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700"
              }`}
          >
            {row.status === "active" ? (
              <>
                <ToggleRight size={14} /> Active
              </>
            ) : (
              <>
                <ToggleLeft size={14} /> Blocked
              </>
            )}
          </button>
        );
      },
    },
    {
      key: "created",
      header: "Created",
      className: "font-data",
      render: (row) => new Date(row.createdAt).toLocaleDateString("en-IN"),
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Admin Users</h1>
          <p className="text-sm text-muted mt-0.5">
            {admins
              ? `${admins.length} account${admins.length === 1 ? "" : "s"}`
              : "Loading..."}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus size={16} /> New Admin
          </span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={admins ?? []}
        isLoading={isLoading}
        getRowId={(row) => row._id}
        emptyMessage={
          <EmptyState icon={Users} message="No admin accounts found" />
        }
      />

      <CreateAdminModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!toggling}
        onClose={() => setToggling(null)}
        onConfirm={() =>
          toggleMutation.mutate(toggling!._id, {
            onSuccess: () => setToggling(null),
          })
        }
        title={
          toggling?.status === "active"
            ? "Block this admin?"
            : "Unblock this admin?"
        }
        message={
          toggling?.status === "active"
            ? `"${toggling?.name}" will be blocked and lose access immediately.`
            : `"${toggling?.name}" will regain access to the admin panel.`
        }
        variant={toggling?.status === "active" ? "danger" : "primary"}
        isLoading={toggleMutation.isPending}
      />
    </div>
  );
}
