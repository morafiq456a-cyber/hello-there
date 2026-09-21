import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { orderFromRow } from "./mappers";
import type { Order, Profile } from "./types";

// ---------- Profile ----------
export const getProfileFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Profile> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      id: context.userId,
      fullName: data?.full_name ?? "",
      phone: data?.phone ?? "",
      governorate: data?.governorate ?? "",
      city: data?.city ?? "",
      address: data?.address ?? "",
    };
  });

const profileSchema = z.object({
  fullName: z.string().trim().max(80),
  phone: z.string().trim().max(20),
  governorate: z.string().trim().max(60),
  city: z.string().trim().max(60),
  address: z.string().trim().max(200),
});

export const updateProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: z.infer<typeof profileSchema>) => profileSchema.parse(data))
  .handler(async ({ data, context }): Promise<Profile> => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      full_name: data.fullName,
      phone: data.phone,
      governorate: data.governorate,
      city: data.city,
      address: data.address,
    });
    if (error) throw new Error(error.message);
    return { id: context.userId, ...data };
  });

// ---------- My orders ----------
export const myOrdersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Order[]> => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(orderFromRow);
  });
