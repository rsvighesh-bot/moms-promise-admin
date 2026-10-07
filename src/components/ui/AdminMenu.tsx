import { useState, useRef } from "react";
import { LogOut, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../features/auth/authApi";
import { useAdminMe, ADMIN_ME_KEY } from "../../features/auth/useAdminMe";
import { useClickOutside } from "../../lib/hooks/useClickOutside";
import { useAnimatedPresence } from "../../lib/hooks/useAnimatedPresence";

export function AdminMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { ref: menuRef, shouldRender } = useAnimatedPresence<HTMLDivElement>(
    isOpen,
    {
      from: { opacity: 0, y: -6, scale: 0.97 },
      to: { opacity: 1, y: 0, scale: 1 },
    },
  );

  useClickOutside([buttonRef as any, menuRef], () => setIsOpen(false), isOpen);

  const { data: admin } = useAdminMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      queryClient.setQueryData(ADMIN_ME_KEY, null);
      navigate("/login");
    },
  });

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-bg cursor-pointer"
      >
        <User size={18} />
        <span className="text-sm hidden sm:inline">
          {admin?.name ?? admin?.email}
        </span>
      </button>

      {shouldRender && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-md shadow-lg py-1 z-50"
        >
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-bg cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
