import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Loader2, Package, Save } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProfileFn, myOrdersFn, updateProfileFn } from "@/lib/account.functions";
import { formatCurrency } from "@/lib/currency";
import { EGYPT_GOVERNORATES } from "@/lib/seed";
import { PAYMENT_METHODS, type Profile } from "@/lib/types";

export const Route = createFileRoute("/account/")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "My Account — Nova Store" },
      { name: "description", content: "View your Nova Store orders and manage your delivery details." },
      { property: "og:title", content: "My Account — Nova Store" },
      { property: "og:description", content: "Your Nova Store order history and saved delivery details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const empty: Profile = { id: "", fullName: "", phone: "", governorate: "", city: "", address: "" };

function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, hydrated, settings, signOut } = useStore();

  const getProfile = useServerFn(getProfileFn);
  const getOrders = useServerFn(myOrdersFn);
  const saveProfile = useServerFn(updateProfileFn);

  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => getProfile(), enabled: !!user });
  const ordersQ = useQuery({ queryKey: ["my-orders"], queryFn: () => getOrders(), enabled: !!user });

  const [form, setForm] = useState<Profile>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileQ.data) setForm(profileQ.data);
  }, [profileQ.data]);

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/account/login" });
  }, [hydrated, user, navigate]);

  if (!user) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">Loading your account…</div>
      </StoreLayout>
    );
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProfile({
        data: {
          fullName: form.fullName,
          phone: form.phone,
          governorate: form.governorate,
          city: form.city,
          address: form.address,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Details saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your details");
    } finally {
      setSaving(false);
    }
  };

  const orders = ordersQ.data ?? [];

  return (
    <StoreLayout>
      <PageHeader title="My Account" breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Account</>} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[360px_1fr]">
        <form onSubmit={onSave} className="h-fit space-y-4 rounded-2xl border bg-card p-6">
          <div>
            <h3 className="text-lg font-semibold">My Details</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <Label htmlFor="fn">Full Name</Label>
            <Input id="fn" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="ph">Phone</Label>
            <Input id="ph" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Governorate</Label>
            <Select value={form.governorate} onValueChange={(v) => setForm({ ...form, governorate: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select governorate" /></SelectTrigger>
              <SelectContent className="max-h-64">
                {EGYPT_GOVERNORATES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ci">City / Area</Label>
            <Input id="ci" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="ad">Address</Label>
            <Input id="ad" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Details
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut size={16} /> Sign Out
          </Button>
        </form>

        <div className="space-y-4 rounded-2xl border bg-card p-6">
          <h3 className="text-lg font-semibold">My Orders</h3>
          {ordersQ.isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-3 text-muted-foreground" size={36} />
              <p className="text-muted-foreground">You have not placed any orders yet.</p>
              <Button asChild className="mt-4"><Link to="/products">Start Shopping</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{o.number}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-brand">{formatCurrency(o.total, settings.currency)}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.status} · {PAYMENT_METHODS.find((m) => m.value === o.paymentMethod)?.label} ({o.paymentStatus})
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {o.items.map((it) => (
                      <span key={it.productId + it.name} className="rounded-lg bg-muted px-2 py-1 text-xs">
                        {it.name} ×{it.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
