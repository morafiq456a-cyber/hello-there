import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatCurrency } from "@/lib/currency";
import { ORDER_STATUSES } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
  head: () => ({ meta: [{ title: "Reports — Admin" }, { name: "robots", content: "noindex" }] }),
});

const PIE_COLORS = ["#6d28d9", "#0ea5e9", "#f59e0b", "#10b981", "#6366f1", "#ef4444"];

function AdminReports() {
  const { orders, products, settings } = useStore();

  const valid = orders.filter((o) => o.status !== "Cancelled");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const avgOrder = valid.length ? revenue / valid.length : 0;

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of valid) {
      for (const it of o.items) {
        const e = map.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0 };
        e.qty += it.quantity;
        e.revenue += it.price * it.quantity;
        map.set(it.productId, e);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [valid]);

  const statusData = useMemo(
    () => ORDER_STATUSES.map((s) => ({ name: s, value: orders.filter((o) => o.status === s).length })).filter((d) => d.value > 0),
    [orders],
  );

  const lowStock = products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  const stats = [
    { label: "Total Sales", value: formatCurrency(revenue, settings.currency), icon: DollarSign },
    { label: "Orders", value: valid.length.toString(), icon: ShoppingCart },
    { label: "Avg Order Value", value: formatCurrency(avgOrder, settings.currency), icon: TrendingUp },
    { label: "Low Stock Items", value: lowStock.length.toString(), icon: AlertTriangle },
  ];

  return (
    <AdminShell title="Reports">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand"><s.icon size={20} /></span>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Top Selling Products</h3>
          <div className="mt-4 h-72">
            {topProducts.length === 0 ? (
              <p className="pt-16 text-center text-muted-foreground">No sales data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v: string) => (v.length > 16 ? v.slice(0, 16) + "…" : v)} />
                  <Tooltip formatter={(v: number) => `${v} sold`} />
                  <Bar dataKey="qty" fill="var(--brand)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Orders by Status</h3>
          <div className="mt-4 h-72">
            {statusData.length === 0 ? (
              <p className="pt-16 text-center text-muted-foreground">No orders yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => `${e.name} (${e.value})`}>
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5">
        <h3 className="font-semibold">Low Stock Report</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">SKU</th><th className="pb-2 font-medium">Stock</th></tr></thead>
            <tbody>
              {lowStock.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">All products well stocked.</td></tr>}
              {lowStock.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 text-muted-foreground">{p.sku}</td>
                  <td className={cn("py-2 font-semibold", p.stock === 0 ? "text-destructive" : "text-amber-600")}>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
