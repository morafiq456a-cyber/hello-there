import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Returns whether at least one admin account exists yet.
export const adminExistsFn = createServerFn({ method: "GET" }).handler(async (): Promise<boolean> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
});

const claimSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

// One-time bootstrap: creates the first admin account. Refuses once an admin exists.
export const claimFirstAdminFn = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof claimSchema>) => claimSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) throw new Error("An admin account already exists. Please sign in instead.");

    const { data: created, error: uErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (uErr || !created.user) throw new Error(uErr?.message ?? "Could not create admin account.");

    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (rErr) throw new Error(rErr.message);

    return { ok: true };
  });
