import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageSearch, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track-order")({
  component: TrackOrderPage,
  head: () => ({
    meta: [
      { title: "Track Your Order — Nova Store" },
      { name: "description", content: "Track your Nova Store order status using your phone number and order number." },
    ],
  }),
});

const TIMELINE = ORDER_STATUSES.filter((s) => s !== "Cancelled");

function TrackOrderPage() {
  const { orders, settings } = useStore();
  const [phone, setPhone] = useState("");
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<Order | null | "none">(null);

  const track = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) => o.number.toLowerCase() === number.trim().toLowerCase() && o.customer.phone.replace(/\D/g, "").endsWith(phone.trim().replace(/\D/g, "").slice(-9)),
    );
    setResult(found ?? "none");
  };

  const activeIndex = result && result !== "none" ? (TIMELINE as OrderStatus[]).indexOf(result.status) : -1;

  return (
    <StoreLayout>
      <PageHeader title="Track Your Order" subtitle="Enter your details to see your order status" breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Track Order</>} />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={track} className="space-y-4 rounded-2xl border bg-card p-6">
          <div>
            <Label htmlFor="tphone">Phone Number</Label>
            <Input id="tphone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="tnum">Order Number</Label>
            <Input id="tnum" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="NV-123456" className="mt-1" required />
          </div>
          <Button type="submit" className="w-full gap-2"><PackageSearch size={16} /> Track Order</Button>
        </form>

        {result === "none" && (
          <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            No matching order found. Please check your order number and phone.
          </div>
        )}

        {result && result !== "none" && (
          <div className="mt-6 rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order</p>
                <p className="text-lg font-bold text-brand">{result.number}</p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", result.status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-brand/10 text-brand")}>
                {result.status}
              </span>
            </div>

            {result.status !== "Cancelled" && (
              <div className="mt-6 space-y-0">
                {TIMELINE.map((step, i) => (
                  <div key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2", i <= activeIndex ? "border-brand bg-brand text-white" : "border-muted text-muted-foreground")}>
                        {i <= activeIndex ? <Check size={16} /> : i + 1}
                      </span>
                      {i < TIMELINE.length - 1 && <span className={cn("h-8 w-0.5", i < activeIndex ? "bg-brand" : "bg-muted")} />}
                    </div>
                    <div className="pb-4">
                      <p className={cn("font-medium", i <= activeIndex && "text-brand")}>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              {result.items.map((it) => (
                <div key={it.productId} className="flex justify-between">
                  <span className="text-muted-foreground">{it.name} ×{it.quantity}</span>
                  <span>{formatCurrency(it.price * it.quantity, settings.currency)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span className="text-brand">{formatCurrency(result.total, settings.currency)}</span></div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
