import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Store,
  Tags,
  Ticket,
  Users,
  Settings as SettingsIcon,
  ExternalLink,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: Tags },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Coupons", to: "/admin/coupons", icon: Ticket },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: SettingsIcon },
] as const;

export function AdminShell({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  const { admin, hydrated, logout, settings, orders } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const newOrders = orders.filter((o) => o.status === "New").length;

  useEffect(() => {
    if (hydrated && !admin) navigate({ to: "/admin/login" });
  }, [hydrated, admin, navigate]);

  if (!hydrated || !admin) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5 font-extrabold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white"><Store size={18} /></span>
          <span className="text-gradient">{settings.storeName}</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition", active ? "bg-brand-gradient text-white" : "hover:bg-accent")}>
                <n.icon size={18} /> {n.label}
                {n.to === "/admin/orders" && newOrders > 0 && (
                  <span className="ml-auto rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{newOrders}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <Button asChild variant="ghost" className="w-full justify-start gap-3"><Link to="/"><ExternalLink size={18} /> View Store</Link></Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={() => { logout(); navigate({ to: "/admin/login" }); }}>
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-card/80 px-4 backdrop-blur sm:px-6">
          <h1 className="text-lg font-bold">{title}</h1>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 no-scrollbar lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={cn("flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium", pathname === n.to ? "bg-brand-gradient text-white" : "bg-muted")}>
              <n.icon size={14} /> {n.label}
            </Link>
          ))}
        </div>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
