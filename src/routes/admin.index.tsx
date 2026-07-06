import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Dashboard — Admin" }, { name: "robots", content: "noindex" }] }),
});

function AdminDashboard() {
  const { orders, products, customers, settings } = useStore();

  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en", { weekday: "short" }), sales: 0 };
    });
    for (const o of orders) {
      const k = o.createdAt.slice(0, 10);
      const day = days.find((d) => d.key === k);
      if (day && o.status !== "Cancelled") day.sales += o.total;
    }
    return days;
  }, [orders]);

  const stats = [
    { label: "Total Revenue", value: formatCurrency(revenue, settings.currency), icon: DollarSign, color: "from-emerald-500 to-teal-500" },
    { label: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, color: "from-blue-500 to-indigo-500" },
    { label: "Products", value: products.length.toString(), icon: Package, color: "from-violet-500 to-purple-500" },
    { label: "Customers", value: customers.length.toString(), icon: Users, color: "from-amber-500 to-orange-500" },
  ];

  const recent = orders.slice(0, 6);
  const lowStock = products.filter((p) => p.stock <= 5).slice(0, 5);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white", s.color)}><s.icon size={20} /></span>
              <ArrowUpRight className="text-muted-foreground" size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
          <h3 className="font-semibold">Sales — Last 7 Days</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip formatter={(v: number) => formatCurrency(v, settings.currency)} />
                <Area type="monotone" dataKey="sales" stroke="var(--brand)" strokeWidth={2} fill="url(#sales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Low Stock Alert</h3>
          <div className="mt-4 space-y-3">
            {lowStock.length === 0 && <p className="text-sm text-muted-foreground">All products well stocked.</p>}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                <span className="flex-1 line-clamp-1 text-sm">{p.name}</span>
                <span className={cn("text-sm font-semibold", p.stock === 0 ? "text-destructive" : "text-amber-600")}>{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm text-brand hover:underline">View all</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No orders yet.</td></tr>}
              {recent.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-brand">{o.number}</td>
                  <td className="py-3">{o.customer.fullName}</td>
                  <td className="py-3">{formatCurrency(o.total, settings.currency)}</td>
                  <td className="py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
