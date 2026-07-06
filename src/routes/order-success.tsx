import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

type Search = { order?: string };

export const Route = createFileRoute("/order-success")({
  validateSearch: (s: Record<string, unknown>): Search => ({ order: typeof s.order === "string" ? s.order : "" }),
  component: OrderSuccessPage,
  head: () => ({ meta: [{ title: "Order Confirmed — Nova Store" }, { name: "robots", content: "noindex" }] }),
});

function OrderSuccessPage() {
  const { order: orderNumber } = Route.useSearch();
  const { lastOrder, settings } = useStore();
  const order = lastOrder && lastOrder.number === orderNumber ? lastOrder : undefined;

  return (
    <StoreLayout>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 size={44} />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Thank you for your order!</h1>
        <p className="mt-2 text-muted-foreground">Your order has been placed successfully. We'll contact you shortly to confirm.</p>

        <div className="mt-8 rounded-2xl border bg-card p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Order Number</span>
            <span className="text-lg font-bold text-brand">{orderNumber}</span>
          </div>
          {order && (
            <>
              <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                {order.items.map((it) => (
                  <div key={it.productId} className="flex justify-between">
                    <span className="text-muted-foreground">{it.name} ×{it.quantity}</span>
                    <span>{formatCurrency(it.price * it.quantity, settings.currency)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t pt-3 font-bold">
                <span>Total (Cash on Delivery)</span>
                <span className="text-brand">{formatCurrency(order.total, settings.currency)}</span>
              </div>
              <div className="mt-4 rounded-xl bg-muted p-3 text-sm">
                <p className="font-medium">Delivery to:</p>
                <p className="text-muted-foreground">{order.customer.fullName} · {order.customer.phone}</p>
                <p className="text-muted-foreground">{order.customer.address}, {order.customer.city}, {order.customer.governorate}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="gap-2"><Link to="/track-order"><Truck size={16} /> Track Order</Link></Button>
          <Button asChild className="gap-2"><Link to="/products"><Package size={16} /> Continue Shopping</Link></Button>
        </div>
      </div>
    </StoreLayout>
  );
}
