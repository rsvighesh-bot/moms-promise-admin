// import { type ReactNode } from "react";
import { Button } from "./Button";
import { type LucideIcon, Plus } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <Icon size={20} />
      </div>
      <p className="text-muted">{message}</p>
      {action && (
        <Button variant="ghost" onClick={action.onClick}>
          <span className="flex items-center gap-2">
            <Plus size={14} /> {action.label}
          </span>
        </Button>
      )}
    </div>
  );
}
