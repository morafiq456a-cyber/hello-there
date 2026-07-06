import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Ticket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import type { Coupon } from "@/lib/types";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCoupons,
  head: () => ({ meta: [{ title: "Coupons — Admin" }, { name: "robots", content: "noindex" }] }),
});

const emptyCoupon = (): Coupon => ({
  id: `cp${Date.now()}`,
  code: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  active: true,
  usageLimit: undefined,
  usedCount: 0,
});

function AdminCoupons() {
  const { coupons, saveCoupon, deleteCoupon, settings } = useStore();
  const [editing, setEditing] = useState<Coupon | null>(null);

  return (
    <AdminShell title="Coupons" actions={<Button onClick={() => setEditing(emptyCoupon())} className="gap-1.5"><Plus size={16} /> Add Coupon</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white"><Ticket size={18} /></span>
              <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="mt-3 font-mono text-lg font-bold">{c.code}</p>
            <p className="text-sm text-muted-foreground">{c.type === "percent" ? `${c.value}% off` : `${c.value} ${settings.currency} off`}{c.minOrder ? ` · min ${c.minOrder}` : ""}</p>
            <p className="mt-1 text-xs text-muted-foreground">Used {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""} times</p>
            <div className="mt-3 flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(c)}><Pencil size={15} /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { deleteCoupon(c.id); toast.success("Coupon deleted"); }}><Trash2 size={15} /></Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Dialog open onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing.code ? "Edit Coupon" : "New Coupon"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className="mt-1 font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as Coupon["type"] })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="percent">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Value</Label><Input type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: +e.target.value })} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Min Order</Label><Input type="number" value={editing.minOrder ?? 0} onChange={(e) => setEditing({ ...editing, minOrder: +e.target.value })} className="mt-1" /></div>
                <div><Label>Usage Limit</Label><Input type="number" value={editing.usageLimit ?? ""} onChange={(e) => setEditing({ ...editing, usageLimit: e.target.value ? +e.target.value : undefined })} className="mt-1" /></div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3"><Label>Active</Label><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button disabled={!editing.code} onClick={() => { saveCoupon(editing); toast.success("Coupon saved"); setEditing(null); }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminShell>
  );
}
