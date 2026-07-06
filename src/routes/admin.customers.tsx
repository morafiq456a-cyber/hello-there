import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Phone, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
  head: () => ({ meta: [{ title: "Customers — Admin" }, { name: "robots", content: "noindex" }] }),
});

function AdminCustomers() {
  const { customers, settings } = useStore();
  const [q, setQ] = useState("");
  const filtered = customers.filter((c) => c.fullName.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));

  return (
    <AdminShell title="Customers">
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers..." className="pl-9" />
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Governorate</th>
              <th className="p-3 font-medium">Orders</th>
              <th className="p-3 font-medium">Total Spent</th>
              <th className="p-3 font-medium">Last Order</th>
              <th className="p-3 font-medium text-right">Contact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3">
                  <p className="font-medium">{c.fullName}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </td>
                <td className="p-3 text-muted-foreground">{c.governorate}</td>
                <td className="p-3">{c.ordersCount}</td>
                <td className="p-3 font-semibold text-brand">{formatCurrency(c.totalSpent, settings.currency)}</td>
                <td className="p-3 text-muted-foreground">{new Date(c.lastOrderAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8"><a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /></a></Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8"><a href={`tel:${c.phone}`}><Phone size={15} /></a></Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
