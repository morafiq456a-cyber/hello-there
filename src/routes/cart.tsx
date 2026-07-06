import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Shopping Cart — Nova Store" }, { name: "robots", content: "noindex" }] }),
});

function CartPage() {
  const { cart, products, settings, setCartQty, removeFromCart, validateCoupon } = useStore();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);

  const lines = useMemo(
    () => cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! })).filter((l) => l.product),
    [cart, products],
  );

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const discount = applied?.discount ?? 0;
  const shipping = subtotal - discount >= settings.freeShippingThreshold || subtotal === 0 ? 0 : settings.shippingFee;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = () => {
    const res = validateCoupon(code, subtotal);
    if (res.ok) {
      setApplied({ code: code.toUpperCase(), discount: res.discount });
      toast.success(res.message);
    } else {
      setApplied(null);
      toast.error(res.message);
    }
  };

  return (
    <StoreLayout>
      <PageHeader title="Shopping Cart" breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Cart</>} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
            <ShoppingBag className="mb-3 text-muted-foreground" size={40} />
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Add some products to get started.</p>
            <Button asChild className="mt-4"><Link to="/products">Shop Now</Link></Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {lines.map((l) => (
                <div key={l.productId} className="flex gap-4 rounded-2xl border bg-card p-3">
                  <Link to="/product/$slug" params={{ slug: l.product.slug }} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <img src={l.product.images[0]} alt={l.product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link to="/product/$slug" params={{ slug: l.product.slug }} className="font-medium hover:text-brand">{l.product.name}</Link>
                    <span className="text-sm text-muted-foreground">{formatCurrency(l.product.price, settings.currency)}</span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-lg border">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCartQty(l.productId, l.quantity - 1)}><Minus size={14} /></Button>
                        <span className="w-8 text-center text-sm font-semibold">{l.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCartQty(l.productId, Math.min(l.product.stock, l.quantity + 1))}><Plus size={14} /></Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-brand">{formatCurrency(l.product.price * l.quantity, settings.currency)}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFromCart(l.productId)}><Trash2 size={16} /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit space-y-4 rounded-2xl border bg-card p-5">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="pl-9" />
                </div>
                <Button variant="outline" onClick={applyCoupon}>Apply</Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal, settings.currency)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({applied?.code})</span><span>-{formatCurrency(discount, settings.currency)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatCurrency(shipping, settings.currency)}</span></div>
                <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span className="text-brand">{formatCurrency(total, settings.currency)}</span></div>
              </div>
              <Button asChild size="lg" className="w-full"><Link to="/checkout">Proceed to Checkout</Link></Button>
              <Button asChild variant="ghost" className="w-full"><Link to="/products">Continue Shopping</Link></Button>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
