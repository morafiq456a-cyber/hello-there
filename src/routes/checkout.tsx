import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { EGYPT_GOVERNORATES } from "@/lib/seed";

const schema = z.object({
  fullName: z.string().trim().min(3, "Please enter your full name").max(80),
  phone: z.string().trim().regex(/^0?1[0-9]{9,10}$|^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  governorate: z.string().min(1, "Select your governorate"),
  city: z.string().trim().min(2, "Enter your city").max(60),
  address: z.string().trim().min(5, "Enter your full address").max(200),
  landmark: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — Nova Store" }, { name: "robots", content: "noindex" }] }),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, products, settings, validateCoupon, placeOrder } = useStore();
  const [couponCode] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { governorate: "" } });

  const lines = useMemo(
    () => cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! })).filter((l) => l.product),
    [cart, products],
  );

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const couponRes = validateCoupon(couponCode, subtotal);
  const discount = couponRes.ok ? couponRes.discount : 0;
  const shipping = subtotal - discount >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const total = Math.max(0, subtotal - discount + shipping);

  const onSubmit = (values: FormValues) => {
    if (lines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const order = placeOrder({
      customer: values,
      items: lines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        image: l.product.images[0],
        price: l.product.price,
        quantity: l.quantity,
      })),
      subtotal,
      shipping,
      discount,
      total,
    });
    toast.success("Order placed successfully!");
    navigate({ to: "/order-success", search: { order: order.number } });
  };

  if (lines.length === 0) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <ShoppingBag className="mx-auto mb-3 text-muted-foreground" size={40} />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <Button asChild className="mt-4"><Link to="/products">Shop Now</Link></Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <PageHeader title="Checkout" breadcrumb={<><Link to="/cart" className="hover:text-brand">Cart</Link> / Checkout</>} />
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-2xl border bg-card p-6">
          <h3 className="text-lg font-semibold">Delivery Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" {...register("fullName")} className="mt-1" />
              {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...register("phone")} className="mt-1" placeholder="01xxxxxxxxx" />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div>
              <Label>Governorate *</Label>
              <Select value={watch("governorate")} onValueChange={(v) => setValue("governorate", v, { shouldValidate: true })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select governorate" /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {EGYPT_GOVERNORATES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.governorate && <p className="mt-1 text-xs text-destructive">{errors.governorate.message}</p>}
            </div>
            <div>
              <Label htmlFor="city">City / Area *</Label>
              <Input id="city" {...register("city")} className="mt-1" />
              {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div>
              <Label htmlFor="landmark">Landmark</Label>
              <Input id="landmark" {...register("landmark")} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input id="address" {...register("address")} className="mt-1" placeholder="Street, building, apartment" />
              {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea id="notes" {...register("notes")} className="mt-1" rows={3} placeholder="Any special instructions?" />
            </div>
          </div>

          <div className="rounded-xl border-2 border-brand bg-brand/5 p-4">
            <div className="flex items-center gap-3">
              <Banknote className="text-brand" />
              <div>
                <p className="font-semibold">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">Pay in cash when your order arrives.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-fit space-y-4 rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Your Order</h3>
          <div className="max-h-64 space-y-3 overflow-auto no-scrollbar">
            {lines.map((l) => (
              <div key={l.productId} className="flex items-center gap-3">
                <img src={l.product.images[0]} alt={l.product.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium">{l.product.name}</p>
                  <p className="text-muted-foreground">×{l.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(l.product.price * l.quantity, settings.currency)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal, settings.currency)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discount, settings.currency)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatCurrency(shipping, settings.currency)}</span></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span className="text-brand">{formatCurrency(total, settings.currency)}</span></div>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>Place Order</Button>
        </div>
      </form>
    </StoreLayout>
  );
}
