interface StatusBadgeProps {
  status: "active" | "inactive" | "draft" | "out_of_stock";
}

const styles: Record<StatusBadgeProps["status"], string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-600",
  draft: "bg-accent text-accent-foreground",
  out_of_stock: "bg-red-100 text-red-600",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
