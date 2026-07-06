import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Phone, Printer, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
  head: () => ({ meta: [{ title: "Orders — Admin" }, { name: "robots", content: "noindex" }] }),
});

const STATUS_COLORS: Record<OrderStatus, string> = {
  New: "bg-blue-100 text-blue-700",
  Preparing: "bg-amber-100 text-amber-700",
  Ready: "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

function AdminOrders() {
  const { orders, settings, updateOrderStatus, deleteOrder } = useStore();
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<Order | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  const printInvoice = (o: Order) => {
    const rows = o.items.map((it) => `<tr><td style="padding:6px;border-bottom:1px solid #eee">${it.name}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${it.quantity}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(it.price * it.quantity, settings.currency)}</td></tr>`).join("");
    const html = `<html><head><title>Invoice ${o.number}</title></head><body style="font-family:Arial,sans-serif;max-width:640px;margin:24px auto;color:#111">
      <h1 style="color:${settings.primaryColor}">${settings.storeName}</h1>
      <p>Invoice: <b>${o.number}</b><br/>Date: ${new Date(o.createdAt).toLocaleString()}</p>
      <hr/>
      <p><b>Customer:</b> ${o.customer.fullName}<br/>${o.customer.phone}<br/>${o.customer.address}, ${o.customer.city}, ${o.customer.governorate}${o.customer.landmark ? `<br/>Landmark: ${o.customer.landmark}` : ""}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px"><thead><tr><th style="text-align:left;padding:6px;border-bottom:2px solid #333">Item</th><th style="padding:6px;border-bottom:2px solid #333">Qty</th><th style="text-align:right;padding:6px;border-bottom:2px solid #333">Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div style="margin-top:12px;text-align:right">
        <p>Subtotal: ${formatCurrency(o.subtotal, settings.currency)}</p>
        ${o.discount ? `<p>Discount: -${formatCurrency(o.discount, settings.currency)}</p>` : ""}
        <p>Shipping: ${o.shipping ? formatCurrency(o.shipping, settings.currency) : "Free"}</p>
        <h2>Total: ${formatCurrency(o.total, settings.currency)}</h2>
        <p><b>Payment: Cash on Delivery</b></p>
      </div>
      <p style="text-align:center;margin-top:24px;color:#888">Thank you for shopping with ${settings.storeName}!</p>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
  };

  return (
    <AdminShell
      title="Orders"
      actions={
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      }
    >
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="p-3 font-medium text-brand">{o.number}</td>
                <td className="p-3">
                  <p className="font-medium">{o.customer.fullName}</p>
                  <p className="text-xs text-muted-foreground">{o.customer.governorate}</p>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-3 font-semibold">{formatCurrency(o.total, settings.currency)}</td>
                <td className="p-3">
                  <Select value={o.status} onValueChange={(v) => { updateOrderStatus(o.id, v as OrderStatus); toast.success(`Status: ${v}`); }}>
                    <SelectTrigger className={cn("h-8 w-40 border-0 text-xs font-semibold", STATUS_COLORS[o.status])}><SelectValue /></SelectTrigger>
                    <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView(o)}><Eye size={15} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => printInvoice(o)}><Printer size={15} /></Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8"><a href={`https://wa.me/${o.customer.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /></a></Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8"><a href={`tel:${o.customer.phone}`}><Phone size={15} /></a></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { deleteOrder(o.id); toast.success("Order deleted"); }}><Trash2 size={15} /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>

      {view && (
        <Dialog open onOpenChange={(o) => !o && setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Order {view.number}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="rounded-xl bg-muted p-3 text-sm">
                <p className="font-semibold">{view.customer.fullName}</p>
                <p className="text-muted-foreground">{view.customer.phone}</p>
                <p className="text-muted-foreground">{view.customer.address}, {view.customer.city}, {view.customer.governorate}</p>
                {view.customer.landmark && <p className="text-muted-foreground">Landmark: {view.customer.landmark}</p>}
                {view.customer.notes && <p className="mt-1 text-muted-foreground">Notes: {view.customer.notes}</p>}
              </div>
              <div className="space-y-2">
                {view.items.map((it) => (
                  <div key={it.productId} className="flex items-center gap-3">
                    <img src={it.image} alt={it.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 text-sm"><p className="font-medium">{it.name}</p><p className="text-muted-foreground">×{it.quantity}</p></div>
                    <span className="text-sm font-semibold">{formatCurrency(it.price * it.quantity, settings.currency)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 border-t pt-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(view.subtotal, settings.currency)}</span></div>
                {view.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(view.discount, settings.currency)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{view.shipping ? formatCurrency(view.shipping, settings.currency) : "Free"}</span></div>
                <div className="flex justify-between border-t pt-1 font-bold"><span>Total</span><span className="text-brand">{formatCurrency(view.total, settings.currency)}</span></div>
              </div>
              <Button className="w-full gap-2" onClick={() => printInvoice(view)}><Printer size={16} /> Print Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminShell>
  );
}
