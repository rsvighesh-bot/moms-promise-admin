import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { useAnimatedPresence } from "../../lib/hooks/useAnimatedPresence";

const SIZE_CLASSES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  wide: "sm:max-w-[70vw]",
} as const;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: keyof typeof SIZE_CLASSES;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const { ref, shouldRender } = useAnimatedPresence<HTMLDivElement>(isOpen, {
    from: { opacity: 0, scale: 0.96, y: 8 },
    to: { opacity: 1, scale: 1, y: 0 },
  });

  // Escape key closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={ref}
        className={`relative bg-surface w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-full ${SIZE_CLASSES[size]} sm:rounded-lg flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-bg">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
