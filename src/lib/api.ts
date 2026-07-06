import { supabase } from "@/integrations/supabase/client";
import type {
  Banner,
  Category,
  Coupon,
  Customer,
  Order,
  OrderStatus,
  Product,
  Settings,
} from "./types";
import {
  bannerFromRow,
  bannerToRow,
  categoryFromRow,
  categoryToRow,
  couponFromRow,
  couponToRow,
  customerFromRow,
  isUuid,
  orderFromRow,
  productFromRow,
  productToRow,
  settingsFromRow,
  settingsToRow,
} from "./mappers";

function assert<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return data as T;
}

// ================= PUBLIC READS =================
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("sort", { ascending: true });
  return assert(data, error).map(productFromRow);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort", { ascending: true });
  return assert(data, error).map(categoryFromRow);
}

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from("banners").select("*").order("sort", { ascending: true });
  return assert(data, error).map(bannerFromRow);
}

export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("settings").select("*").eq("id", "default").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Settings not found");
  return settingsFromRow(data);
}

// ================= ADMIN READS =================
export async function fetchCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return assert(data, error).map(couponFromRow);
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => orderFromRow(r as never));
}

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from("customers").select("*").order("total_spent", { ascending: false });
  return assert(data, error).map(customerFromRow);
}

// ================= PRODUCT CRUD =================
export async function upsertProduct(p: Product): Promise<void> {
  const row = productToRow(p);
  if (isUuid(p.id)) {
    const { error } = await supabase.from("products").update(row).eq("id", p.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("products").insert(row);
    if (error) throw new Error(error.message);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderProducts(ids: string[]): Promise<void> {
  await Promise.all(
    ids.filter(isUuid).map((id, i) => supabase.from("products").update({ sort: i }).eq("id", id)),
  );
}

// ================= CATEGORY CRUD =================
export async function upsertCategory(c: Category): Promise<void> {
  const row = categoryToRow(c);
  if (isUuid(c.id)) {
    const { error } = await supabase.from("categories").update(row).eq("id", c.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("categories").insert(row);
    if (error) throw new Error(error.message);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderCategories(ids: string[]): Promise<void> {
  await Promise.all(
    ids.filter(isUuid).map((id, i) => supabase.from("categories").update({ sort: i }).eq("id", id)),
  );
}

// ================= COUPON CRUD =================
export async function upsertCoupon(c: Coupon): Promise<void> {
  const row = couponToRow(c);
  if (isUuid(c.id)) {
    const { error } = await supabase.from("coupons").update(row).eq("id", c.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("coupons").insert(row);
    if (error) throw new Error(error.message);
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ================= BANNER CRUD =================
export async function upsertBanner(b: Banner): Promise<void> {
  const row = bannerToRow(b);
  if (isUuid(b.id)) {
    const { error } = await supabase.from("banners").update(row).eq("id", b.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("banners").insert(row);
    if (error) throw new Error(error.message);
  }
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ================= ORDERS (admin) =================
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ================= SETTINGS =================
export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const row = settingsToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("settings").update(row as never).eq("id", "default");
  if (error) throw new Error(error.message);
}
