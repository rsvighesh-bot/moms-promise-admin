import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Tag,
  Layers,
  Shirt,
  Package,
  Image as ImageIcon,
  MessageSquare,
  Store,
  ChevronDown,
  Ticket,
  Settings,
  KeyRound,
  Users,
  BookOpen,
  Truck,
  FileText,
  Plus,
  Baby,
  Gift,
  LayoutGrid,
  MessageSquareQuote,
  Video
} from "lucide-react";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { AdminMenu } from "../components/ui/AdminMenu";
import { useAdminMe } from "../features/auth/useAdminMe";
import Logo from "../assets/logo.png";

interface NavLink {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  superAdminOnly?: boolean;
}

interface NavGroup {
  label: string;
  icon: typeof LayoutDashboard;
  children: NavLink[];
}

type NavItem = NavLink | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/categories", label: "Categories", icon: Tag },
  { to: "/subcategories", label: "SubCategories", icon: Layers },
  { to: "/shop-by-age", label: "Shop by Age", icon: Baby },
  { to: "/products", label: "Products", icon: Shirt },
  {
    label: "Marketing",
    icon: Store,
    children: [
      { to: "/banners", label: "Banners", icon: ImageIcon },
      { to: "/top-scroll", label: "Top Scroll", icon: MessageSquare },
      { to: "/combo-offers", label: "Combo Offers", icon: Gift },
      { to: "/kpi-images", label: "KPI Images", icon: LayoutGrid },
      { to: "/reviews", label: "Customer Reviews", icon: MessageSquareQuote },
      { to: "/shop-videos", label: "Shop Videos", icon: Video },
    ],
  },
  { to: "/coupons", label: "Coupons", icon: Ticket },
  {
    label: "Orders",
    icon: Package,
    children: [
      { to: "/orders", label: "All Orders", icon: Package },
      { to: "/orders/manual", label: "Create Manual Order", icon: Plus },
    ],
  },
  {
    label: "Policies",
    icon: BookOpen,
    children: [
      {
        to: "/content/shipping-return",
        label: "Shipping & Return",
        icon: Truck,
      },
      { to: "/content/terms", label: "Terms of Service", icon: FileText },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { to: "/settings/password", label: "Change Password", icon: KeyRound },
      {
        to: "/settings/admins",
        label: "Admin Users",
        icon: Users,
        superAdminOnly: true,
      },
    ],
  },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg text-foreground flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border 
    transform transition-transform
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:flex lg:flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <img src={Logo} alt="moms-promise logo" className="w-25 md:w-25 mt-12" />
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-6 md:mt-9 pb-6">
          {navItems.map((item) =>
            isGroup(item) ? (
              <NavGroupItem
                key={item.label}
                group={item}
                currentPath={location.pathname}
                onNavigate={() => setSidebarOpen(false)}
              />
            ) : (
              <NavLinkItem
                key={item.to}
                item={item}
                isActive={location.pathname === item.to}
                onNavigate={() => setSidebarOpen(false)}
              />
            ),
          )}
        </nav>
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 border-b border-border bg-surface">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="font-semibold">moms-promise Pop Admin</div>
          <div />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AdminMenu />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavLinkItem({
  item,
  isActive,
  onNavigate,
}: {
  item: NavLink;
  isActive: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
        ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted hover:bg-bg hover:text-foreground"}`}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </Link>
  );
}

function NavGroupItem({
  group,
  currentPath,
  onNavigate,
}: {
  group: NavGroup;
  currentPath: string;
  onNavigate: () => void;
}) {
  const childIsActive = group.children.some((c) => c.to === currentPath);
  // Auto-expand if a child route is currently active, otherwise default closed
  const [isOpen, setIsOpen] = useState(childIsActive);
  const Icon = group.icon;
  const { data: me } = useAdminMe();

  const visibleChildren = group.children.filter(
    (c) => !c.superAdminOnly || me?.role === "superadmin",
  );

  return (
    <div>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
          ${childIsActive ? "text-primary font-medium" : "text-muted hover:bg-bg hover:text-foreground"}`}
      >
        <Icon size={18} />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="ml-4 pl-3 border-l border-border mt-1 space-y-1">
          {visibleChildren.map((child) => (
            <NavLinkItem
              key={child.to}
              item={child}
              isActive={currentPath === child.to}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
