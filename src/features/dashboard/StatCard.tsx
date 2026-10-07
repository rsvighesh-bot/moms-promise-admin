import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = "text-primary",
}: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ${iconColor}`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="text-2xl font-bold font-data mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
