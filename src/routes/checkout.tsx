import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, CreditCard, Landmark, Loader2, ShoppingBag, Smartphone, Tag } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfileFn } from "@/lib/account.functions";
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
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/types";

const METHOD_ICONS: Record<PaymentMethod, typeof Banknote> = {
  cod: Banknote,
  card: CreditCard,
  wallet: Smartphone,
  bank: Landmark,
};

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
  const { cart, products, settings, validateCoupon, placeOrder, user } = useStore();
  const getProfile = useServerFn(getProfileFn);
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => getProfile(), enabled: !!user });
  const [autofilled, setAutofilled] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [applying, setApplying] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [reference, setReference] = useState("");

  const enabledMethods = useMemo(() => {
    const flags: Record<PaymentMethod, boolean> = {
      cod: settings.payCodEnabled,
      card: settings.payCardEnabled,
      wallet: settings.payWalletEnabled,
      bank: settings.payBankEnabled,
    };
    const list = PAYMENT_METHODS.filter((m) => flags[m.value]);
    return list.length > 0 ? list : PAYMENT_METHODS.filter((m) => m.value === "cod");
  }, [settings]);

  useEffect(() => {
    if (!enabledMethods.some((m) => m.value === method)) setMethod(enabledMethods[0]!.value);
  }, [enabledMethods, method]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { governorate: "" } });

  useEffect(() => {
    const p = profileQ.data;
    if (!p || autofilled) return;
    const opts = { shouldValidate: false } as const;
    if (p.fullName) setValue("fullName", p.fullName, opts);
    if (p.phone) setValue("phone", p.phone, opts);
    if (p.governorate && (EGYPT_GOVERNORATES as readonly string[]).includes(p.governorate)) setValue("governorate", p.governorate, opts);
    if (p.city) setValue("city", p.city, opts);
    if (p.address) setValue("address", p.address, opts);
    setAutofilled(true);
  }, [profileQ.data, autofilled, setValue]);

  const lines = useMemo(
    () => cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! })).filter((l) => l.product),
    [cart, products],
  );

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const discount = applied?.discount ?? 0;
  const shipping = subtotal - discount >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = async () => {
    setApplying(true);
    try {
      const res = await validateCoupon(code, subtotal);
      if (res.ok) {
        setApplied({ code: res.code ?? code.toUpperCase(), discount: res.discount });
        toast.success(res.message);
      } else {
        setApplied(null);
        toast.error(res.message);
      }
    } finally {
      setApplying(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (lines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    try {
      const order = await placeOrder({
        customer: values,
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        couponCode: applied?.code ?? null,
        paymentMethod: method,
        paymentReference: reference.trim() || null,
      });
      toast.success("Order placed successfully!");
      navigate({ to: "/order-success", search: { order: order.number } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order. Please try again.");
    }
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
          {autofilled && (
            <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand">
              تم ملء بيانات الشحن تلقائياً من حسابك — يمكنك تعديلها لهذا الطلب.
            </p>
          )}
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

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {enabledMethods.map((m) => {
                const Icon = METHOD_ICONS[m.value];
                const active = method === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    aria-pressed={active}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-start transition ${active ? "border-brand bg-brand/5" : "border-border hover:border-brand/40"}`}
                  >
                    <Icon className={active ? "text-brand" : "text-muted-foreground"} size={20} />
                    <span>
                      <span className="block font-semibold">{m.label}</span>
                      <span className="block text-sm text-muted-foreground">{m.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {method === "wallet" && settings.walletNumbers && (
              <div className="rounded-xl border bg-muted/40 p-4 text-sm">
                <p className="font-semibold">Send the total to:</p>
                <p className="whitespace-pre-line text-muted-foreground">{settings.walletNumbers}</p>
              </div>
            )}
            {method === "bank" && settings.bankDetails && (
              <div className="rounded-xl border bg-muted/40 p-4 text-sm">
                <p className="font-semibold">Bank account details:</p>
                <p className="whitespace-pre-line text-muted-foreground">{settings.bankDetails}</p>
              </div>
            )}
            {(method === "wallet" || method === "bank") && (
              <div>
                <Label htmlFor="reference">Transaction / Transfer Reference</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1"
                  placeholder="Enter the reference number after transferring"
                />
                <p className="mt-1 text-xs text-muted-foreground">We will confirm your payment before shipping.</p>
              </div>
            )}
            {method === "card" && (
              <p className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                You will receive a secure payment link right after placing the order.
              </p>
            )}
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
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="pl-9" />
            </div>
            <Button type="button" variant="outline" onClick={applyCoupon} disabled={applying || !code}>
              {applying ? <Loader2 className="animate-spin" size={15} /> : "Apply"}
            </Button>
          </div>
          <div className="space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal, settings.currency)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({applied?.code})</span><span>-{formatCurrency(discount, settings.currency)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatCurrency(shipping, settings.currency)}</span></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span className="text-brand">{formatCurrency(total, settings.currency)}</span></div>
          </div>
          <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Place Order"}
          </Button>
        </div>
      </form>
    </StoreLayout>
  );
}
