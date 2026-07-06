import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Order } from "./types";

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(999),
});

const placeOrderSchema = z.object({
  customer: z.object({
    fullName: z.string().trim().min(3).max(80),
    phone: z.string().trim().min(6).max(20),
    governorate: z.string().trim().min(1).max(60),
    city: z.string().trim().min(1).max(60),
    address: z.string().trim().min(5).max(200),
    landmark: z.string().trim().max(120).optional().nullable(),
    notes: z.string().trim().max(300).optional().nullable(),
  }),
  items: z.array(itemSchema).min(1).max(100),
  couponCode: z.string().trim().max(40).optional().nullable(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

function genNumber() {
  return `NV-${Math.floor(100000 + Math.random() * 900000)}`;
}

export const placeOrderFn = createServerFn({ method: "POST" })
  .inputValidator((data: PlaceOrderInput) => placeOrderSchema.parse(data))
  .handler(async ({ data }): Promise<Order> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ids = [...new Set(data.items.map((i) => i.productId))];
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id,name,price,images,stock,hidden")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);
    const map = new Map((products ?? []).map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const p = map.get(item.productId);
      if (!p || p.hidden) throw new Error("One or more products are no longer available.");
      if ((p.stock ?? 0) < item.quantity) throw new Error(`Not enough stock for ${p.name}.`);
      const price = Number(p.price);
      subtotal += price * item.quantity;
      return {
        product_id: p.id,
        name: p.name,
        image: (p.images ?? [])[0] ?? "",
        price,
        quantity: item.quantity,
      };
    });

    // Coupon (server-authoritative)
    let discount = 0;
    let couponCode: string | null = null;
    let couponId: string | null = null;
    if (data.couponCode && data.couponCode.trim()) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .ilike("code", data.couponCode.trim())
        .maybeSingle();
      if (coupon && coupon.active) {
        const min = coupon.min_order != null ? Number(coupon.min_order) : 0;
        const withinLimit = coupon.usage_limit == null || (coupon.used_count ?? 0) < coupon.usage_limit;
        if (subtotal >= min && withinLimit) {
          discount = coupon.type === "percent" ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);
          discount = Math.min(discount, subtotal);
          couponCode = coupon.code;
          couponId = coupon.id;
        }
      }
    }

    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("free_shipping_threshold,shipping_fee")
      .eq("id", "default")
      .maybeSingle();
    const threshold = settings ? Number(settings.free_shipping_threshold) : 1500;
    const fee = settings ? Number(settings.shipping_fee) : 60;
    const shipping = subtotal - discount >= threshold ? 0 : fee;
    const total = Math.max(0, subtotal - discount + shipping);

    // Insert order with unique number retry
    let orderRow: { id: string; number: string; created_at: string } | null = null;
    for (let attempt = 0; attempt < 6 && !orderRow; attempt++) {
      const number = genNumber();
      const { data: inserted, error } = await supabaseAdmin
        .from("orders")
        .insert({
          number,
          full_name: data.customer.fullName,
          phone: data.customer.phone,
          governorate: data.customer.governorate,
          city: data.customer.city,
          address: data.customer.address,
          landmark: data.customer.landmark ?? null,
          notes: data.customer.notes ?? null,
          subtotal,
          shipping,
          discount,
          coupon_code: couponCode,
          total,
          status: "New",
        })
        .select("id,number,created_at")
        .single();
      if (error) {
        if (error.code === "23505") continue; // duplicate number
        throw new Error(error.message);
      }
      orderRow = inserted;
    }
    if (!orderRow) throw new Error("Could not create order. Please try again.");

    // Order items
    const { error: oiErr } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems.map((it) => ({ ...it, order_id: orderRow!.id })));
    if (oiErr) throw new Error(oiErr.message);

    // Decrement stock atomically
    await Promise.all(
      data.items.map((it) =>
        supabaseAdmin.rpc("decrement_stock", { _product_id: it.productId, _qty: it.quantity }),
      ),
    );

    // Increment coupon usage
    if (couponId) {
      const current = await supabaseAdmin.from("coupons").select("used_count").eq("id", couponId).maybeSingle();
      const used = (current.data?.used_count ?? 0) + 1;
      await supabaseAdmin.from("coupons").update({ used_count: used }).eq("id", couponId);
    }

    return {
      id: orderRow.id,
      number: orderRow.number,
      customer: {
        fullName: data.customer.fullName,
        phone: data.customer.phone,
        governorate: data.customer.governorate,
        city: data.customer.city,
        address: data.customer.address,
        landmark: data.customer.landmark ?? undefined,
        notes: data.customer.notes ?? undefined,
      },
      items: orderItems.map((it) => ({
        productId: it.product_id,
        name: it.name,
        image: it.image,
        price: it.price,
        quantity: it.quantity,
      })),
      subtotal,
      shipping,
      discount,
      couponCode: couponCode ?? undefined,
      total,
      status: "New",
      createdAt: orderRow.created_at,
    };
  });

// ================= VALIDATE COUPON =================
const validateSchema = z.object({
  code: z.string().trim().max(40),
  subtotal: z.number().nonnegative(),
});

export type CouponResult = { ok: boolean; message: string; discount: number; code?: string };

export const validateCouponFn = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof validateSchema>) => validateSchema.parse(data))
  .handler(async ({ data }): Promise<CouponResult> => {
    if (!data.code.trim()) return { ok: false, message: "Enter a coupon code", discount: 0 };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .ilike("code", data.code.trim())
      .maybeSingle();
    if (!coupon) return { ok: false, message: "Invalid coupon code", discount: 0 };
    if (!coupon.active) return { ok: false, message: "This coupon is no longer active", discount: 0 };
    const min = coupon.min_order != null ? Number(coupon.min_order) : 0;
    if (data.subtotal < min)
      return { ok: false, message: `Minimum order of ${min} required`, discount: 0 };
    if (coupon.usage_limit != null && (coupon.used_count ?? 0) >= coupon.usage_limit)
      return { ok: false, message: "This coupon has reached its usage limit", discount: 0 };
    let discount = coupon.type === "percent" ? (data.subtotal * Number(coupon.value)) / 100 : Number(coupon.value);
    discount = Math.min(discount, data.subtotal);
    return { ok: true, message: `Coupon applied: -${Math.round(discount)}`, discount, code: coupon.code };
  });

// ================= TRACK ORDER =================
const trackSchema = z.object({
  number: z.string().trim().min(1).max(40),
  phone: z.string().trim().min(3).max(20),
});

export const trackOrderFn = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof trackSchema>) => trackSchema.parse(data))
  .handler(async ({ data }): Promise<Order | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const digits = (s: string) => s.replace(/\D/g, "");
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .ilike("number", data.number.trim());
    if (error) throw new Error(error.message);
    const target = digits(data.phone);
    const match = (rows ?? []).find((r) => {
      const rp = digits(r.phone);
      return rp === target || rp.endsWith(target.slice(-9)) || target.endsWith(rp.slice(-9));
    });
    if (!match) return null;
    return {
      id: match.id,
      number: match.number,
      customer: {
        fullName: match.full_name,
        phone: match.phone,
        governorate: match.governorate,
        city: match.city ?? "",
        address: match.address,
        landmark: match.landmark ?? undefined,
        notes: match.notes ?? undefined,
      },
      items: (match.order_items ?? []).map((oi) => ({
        productId: oi.product_id ?? "",
        name: oi.name,
        image: oi.image ?? "",
        price: Number(oi.price),
        quantity: oi.quantity ?? 1,
      })),
      subtotal: Number(match.subtotal),
      shipping: Number(match.shipping),
      discount: Number(match.discount),
      couponCode: match.coupon_code ?? undefined,
      total: Number(match.total),
      status: match.status,
      createdAt: match.created_at,
    };
  });
