import type { Tables } from "@/integrations/supabase/types";
import type {
  Banner,
  Category,
  Coupon,
  Customer,
  Order,
  OrderItem,
  Product,
  Settings,
} from "./types";

export const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const num = (v: number | string | null | undefined, fallback = 0) =>
  v === null || v === undefined ? fallback : Number(v);

// ---------- Product ----------
export function productFromRow(r: Tables<"products">): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    specifications: Array.isArray(r.specifications)
      ? (r.specifications as { label: string; value: string }[])
      : [],
    categoryId: r.category_id ?? "",
    price: num(r.price),
    oldPrice: r.old_price != null ? num(r.old_price) : undefined,
    images: r.images ?? [],
    stock: r.stock ?? 0,
    sku: r.sku ?? "",
    barcode: r.barcode ?? undefined,
    weight: r.weight != null ? num(r.weight) : undefined,
    dimensions: r.dimensions ?? undefined,
    featured: !!r.featured,
    isNew: !!r.is_new,
    bestSeller: !!r.best_seller,
    hidden: !!r.hidden,
    rating: num(r.rating),
    reviewsCount: r.reviews_count ?? 0,
    sort: r.sort ?? 0,
    createdAt: r.created_at,
  };
}

export function productToRow(p: Product) {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    specifications: p.specifications ?? [],
    category_id: p.categoryId || null,
    price: p.price,
    old_price: p.oldPrice ?? null,
    images: p.images ?? [],
    stock: p.stock ?? 0,
    sku: p.sku ?? "",
    barcode: p.barcode || null,
    weight: p.weight ?? null,
    dimensions: p.dimensions || null,
    featured: p.featured,
    is_new: p.isNew,
    best_seller: p.bestSeller,
    hidden: p.hidden,
    rating: p.rating ?? 0,
    reviews_count: p.reviewsCount ?? 0,
    sort: p.sort ?? 0,
  };
}

// ---------- Category ----------
export function categoryFromRow(r: Tables<"categories">): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    image: r.image ?? "",
    icon: r.icon ?? "Package",
    hidden: !!r.hidden,
    sort: r.sort ?? 0,
  };
}

export function categoryToRow(c: Category) {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description || null,
    image: c.image ?? "",
    icon: c.icon ?? "Package",
    hidden: c.hidden,
    sort: c.sort ?? 0,
  };
}

// ---------- Coupon ----------
export function couponFromRow(r: Tables<"coupons">): Coupon {
  return {
    id: r.id,
    code: r.code,
    type: r.type,
    value: num(r.value),
    minOrder: r.min_order != null ? num(r.min_order) : undefined,
    active: !!r.active,
    usageLimit: r.usage_limit != null ? r.usage_limit : undefined,
    usedCount: r.used_count ?? 0,
  };
}

export function couponToRow(c: Coupon) {
  return {
    code: c.code.trim().toUpperCase(),
    type: c.type,
    value: c.value,
    min_order: c.minOrder ?? null,
    active: c.active,
    usage_limit: c.usageLimit ?? null,
    used_count: c.usedCount ?? 0,
  };
}

// ---------- Banner ----------
export function bannerFromRow(r: Tables<"banners">): Banner {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle ?? "",
    image: r.image ?? "",
    cta: r.cta ?? "",
    link: r.link ?? "/",
    active: !!r.active,
    sort: r.sort ?? 0,
  };
}

export function bannerToRow(b: Banner) {
  return {
    title: b.title,
    subtitle: b.subtitle ?? "",
    image: b.image ?? "",
    cta: b.cta ?? "",
    link: b.link || "/",
    active: b.active,
    sort: b.sort ?? 0,
  };
}

// ---------- Customer ----------
export function customerFromRow(r: Tables<"customers">): Customer {
  return {
    id: r.id,
    fullName: r.full_name ?? "",
    phone: r.phone,
    governorate: r.governorate ?? "",
    ordersCount: r.orders_count ?? 0,
    totalSpent: num(r.total_spent),
    lastOrderAt: r.last_order_at ?? r.created_at,
  };
}

// ---------- Order ----------
type OrderRowWithItems = Tables<"orders"> & { order_items?: Tables<"order_items">[] };

export function orderItemFromRow(r: Tables<"order_items">): OrderItem {
  return {
    productId: r.product_id ?? "",
    name: r.name,
    image: r.image ?? "",
    price: num(r.price),
    quantity: r.quantity ?? 1,
  };
}

export function orderFromRow(r: OrderRowWithItems): Order {
  return {
    id: r.id,
    number: r.number,
    customer: {
      fullName: r.full_name,
      phone: r.phone,
      governorate: r.governorate,
      city: r.city ?? "",
      address: r.address,
      landmark: r.landmark ?? undefined,
      notes: r.notes ?? undefined,
    },
    items: (r.order_items ?? []).map(orderItemFromRow),
    subtotal: num(r.subtotal),
    shipping: num(r.shipping),
    discount: num(r.discount),
    couponCode: r.coupon_code ?? undefined,
    total: num(r.total),
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    paymentReference: r.payment_reference ?? undefined,
    createdAt: r.created_at,
  };
}

// ---------- Settings ----------
export function settingsFromRow(r: Tables<"settings">): Settings {
  return {
    storeName: r.store_name,
    logo: r.logo ?? "",
    banner: r.banner ?? "",
    favicon: r.favicon ?? "/favicon.ico",
    phone: r.phone ?? "",
    whatsapp: r.whatsapp ?? "",
    email: r.email ?? "",
    address: r.address ?? "",
    googleMap: r.google_map ?? "",
    businessHours: r.business_hours ?? "",
    facebook: r.facebook ?? "",
    instagram: r.instagram ?? "",
    tiktok: r.tiktok ?? "",
    primaryColor: r.primary_color ?? "#6d28d9",
    secondaryColor: r.secondary_color ?? "#0ea5e9",
    buttonColor: r.button_color ?? "#6d28d9",
    textColor: r.text_color ?? "#0f172a",
    backgroundColor: r.background_color ?? "#ffffff",
    font: r.font ?? "Inter",
    darkMode: !!r.dark_mode,
    freeShippingThreshold: num(r.free_shipping_threshold),
    shippingFee: num(r.shipping_fee),
    currency: r.currency ?? "EGP",
    seoTitle: r.seo_title ?? "",
    seoDescription: r.seo_description ?? "",
    payCodEnabled: r.pay_cod_enabled ?? true,
    payCardEnabled: !!r.pay_card_enabled,
    payWalletEnabled: !!r.pay_wallet_enabled,
    payBankEnabled: !!r.pay_bank_enabled,
    walletNumbers: r.wallet_numbers ?? "",
    bankDetails: r.bank_details ?? "",
  };
}

export function settingsToRow(s: Partial<Settings>): Record<string, unknown> {
  const map: Record<keyof Settings, string> = {
    storeName: "store_name",
    logo: "logo",
    banner: "banner",
    favicon: "favicon",
    phone: "phone",
    whatsapp: "whatsapp",
    email: "email",
    address: "address",
    googleMap: "google_map",
    businessHours: "business_hours",
    facebook: "facebook",
    instagram: "instagram",
    tiktok: "tiktok",
    primaryColor: "primary_color",
    secondaryColor: "secondary_color",
    buttonColor: "button_color",
    textColor: "text_color",
    backgroundColor: "background_color",
    font: "font",
    darkMode: "dark_mode",
    freeShippingThreshold: "free_shipping_threshold",
    shippingFee: "shipping_fee",
    currency: "currency",
    seoTitle: "seo_title",
    seoDescription: "seo_description",
    payCodEnabled: "pay_cod_enabled",
    payCardEnabled: "pay_card_enabled",
    payWalletEnabled: "pay_wallet_enabled",
    payBankEnabled: "pay_bank_enabled",
    walletNumbers: "wallet_numbers",
    bankDetails: "bank_details",
  };
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) {
    const col = map[k as keyof Settings];
    if (col) row[col] = v;
  }
  return row;
}
