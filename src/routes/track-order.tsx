import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PackageSearch, Check, Loader2, PackageOpen } from "lucide-react";
import { useStore } from "@/lib/store";
import { myOrdersFn } from "@/lib/account.functions";
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
      { title: "Track Your Orders — Nova Store" },
      { name: "description", content: "Track all your Nova Store orders instantly using your phone number or your account." },
      { property: "og:title", content: "Track Your Orders — Nova Store" },
      { property: "og:description", content: "See the live status of every order you placed at Nova Store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const TIMELINE = ORDER_STATUSES.filter((s) => s !== "Cancelled");

function TrackOrderPage() {
  const { user, hydrated, trackOrder } = useStore();
  const getOrders = useServerFn(myOrdersFn);
  const mine = useQuery({ queryKey: ["my-orders"], queryFn: () => getOrders(), enabled: !!user });

  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setResult(await trackOrder(phone));
    } catch {
      setResult([]);
    } finally {
      setLoading(false);
    }
  };

  const orders = user ? mine.data ?? null : result;
  const busy = user ? mine.isLoading : false;

  return (
    <StoreLayout>
      <PageHeader
        title="تتبع طلباتك"
        subtitle={user ? "كل طلباتك وحالتها لحظياً" : "اكتب رقم موبايلك وهتظهرلك كل طلباتك"}
        breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Track Order</>}
      />
      <div className="mx-auto max-w-2xl px-4 py-8">
        {hydrated && !user && (
          <form onSubmit={track} className="space-y-4 rounded-2xl border bg-card p-6">
            <div>
              <Label htmlFor="tphone">رقم الموبايل</Label>
              <Input id="tphone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="mt-1" required minLength={9} />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <PackageSearch size={16} />} تتبع
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              عندك حساب؟ <Link to="/account/login" className="text-brand hover:underline">سجل دخول</Link> وشوف طلباتك من غير ما تكتب حاجة.
            </p>
          </form>
        )}

        {busy && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand" /></div>}

        {orders && orders.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            <PackageOpen className="mx-auto mb-2" />
            {user ? "لسه معملتش أي طلبات." : "مفيش طلبات على الرقم ده."}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {orders?.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      </div>
    </StoreLayout>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { settings } = useStore();
  const activeIndex = (TIMELINE as OrderStatus[]).indexOf(order.status);
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-lg font-bold text-brand">{order.number}</p>
          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", order.status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-brand/10 text-brand")}>
          {order.status}
        </span>
      </div>

      {order.status !== "Cancelled" && (
        <div className="mt-6">
          {TIMELINE.map((step, i) => (
            <div key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2", i <= activeIndex ? "border-brand bg-brand text-primary-foreground" : "border-muted text-muted-foreground")}>
                  {i <= activeIndex ? <Check size={16} /> : i + 1}
                </span>
                {i < TIMELINE.length - 1 && <span className={cn("h-6 w-0.5", i < activeIndex ? "bg-brand" : "bg-muted")} />}
              </div>
              <p className={cn("pt-1 font-medium", i <= activeIndex && "text-brand")}>{step}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2 border-t pt-4 text-sm">
        {order.items.map((it, idx) => (
          <div key={`${it.productId}-${idx}`} className="flex justify-between">
            <span className="text-muted-foreground">{it.name} ×{it.quantity}</span>
            <span>{formatCurrency(it.price * it.quantity, settings.currency)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span className="text-brand">{formatCurrency(order.total, settings.currency)}</span></div>
      </div>
    </div>
  );
}
