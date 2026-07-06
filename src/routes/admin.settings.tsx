import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Palette, RotateCcw, Save, Store } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultSettings } from "@/lib/seed";
import type { Settings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
  head: () => ({ meta: [{ title: "Settings — Admin" }, { name: "robots", content: "noindex" }] }),
});

const FONTS = ["Inter", "Poppins", "Montserrat", "Cairo"];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
      </div>
    </div>
  );
}

function AdminSettings() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState<Settings>(settings);
  const set = (patch: Partial<Settings>) => {
    const next = { ...form, ...patch };
    setForm(next);
    // Live preview colors + theme
    updateSettings(patch);
  };

  const save = () => {
    updateSettings(form);
    toast.success("Settings saved — your store is updated!");
  };

  const reset = () => {
    setForm(defaultSettings);
    updateSettings(defaultSettings);
    toast.success("Reset to defaults");
  };

  return (
    <AdminShell
      title="Store Settings"
      actions={
        <>
          <Button variant="outline" onClick={reset} className="gap-1.5"><RotateCcw size={15} /> Reset</Button>
          <Button onClick={save} className="gap-1.5"><Save size={15} /> Save</Button>
        </>
      }
    >
      <Tabs defaultValue="general">
        <TabsList className="mb-5 flex-wrap">
          <TabsTrigger value="general"><Store size={15} className="mr-1.5" /> General</TabsTrigger>
          <TabsTrigger value="appearance"><Palette size={15} className="mr-1.5" /> Appearance</TabsTrigger>
          <TabsTrigger value="contact">Contact & Social</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 rounded-2xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Store Name</Label><Input value={form.storeName} onChange={(e) => set({ storeName: e.target.value })} className="mt-1" /></div>
            <div><Label>Logo URL</Label><Input value={form.logo} onChange={(e) => set({ logo: e.target.value })} className="mt-1" placeholder="Leave empty for text logo" /></div>
            <div><Label>Banner URL</Label><Input value={form.banner} onChange={(e) => set({ banner: e.target.value })} className="mt-1" /></div>
            <div><Label>Favicon URL</Label><Input value={form.favicon} onChange={(e) => set({ favicon: e.target.value })} className="mt-1" /></div>
            <div><Label>Currency</Label><Input value={form.currency} onChange={(e) => set({ currency: e.target.value })} className="mt-1" /></div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 rounded-2xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Changes apply instantly across your entire store.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ColorField label="Primary Color" value={form.primaryColor} onChange={(v) => set({ primaryColor: v })} />
            <ColorField label="Secondary Color" value={form.secondaryColor} onChange={(v) => set({ secondaryColor: v })} />
            <ColorField label="Buttons Color" value={form.buttonColor} onChange={(v) => set({ buttonColor: v })} />
            <ColorField label="Text Color" value={form.textColor} onChange={(v) => set({ textColor: v })} />
            <ColorField label="Background Color" value={form.backgroundColor} onChange={(v) => set({ backgroundColor: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Font Family</Label>
              <Select value={form.font} onValueChange={(v) => set({ font: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{FONTS.map((f) => <SelectItem key={f} value={f}><span style={{ fontFamily: f }}>{f}</span></SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3"><Label>Dark Mode</Label><Switch checked={form.darkMode} onCheckedChange={(v) => set({ darkMode: v })} /></div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 rounded-2xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set({ phone: e.target.value })} className="mt-1" /></div>
            <div><Label>WhatsApp (digits only)</Label><Input value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} className="mt-1" /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => set({ email: e.target.value })} className="mt-1" /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => set({ address: e.target.value })} className="mt-1" /></div>
            <div><Label>Google Map Link</Label><Input value={form.googleMap} onChange={(e) => set({ googleMap: e.target.value })} className="mt-1" /></div>
            <div><Label>Business Hours</Label><Input value={form.businessHours} onChange={(e) => set({ businessHours: e.target.value })} className="mt-1" /></div>
            <div><Label>Facebook</Label><Input value={form.facebook} onChange={(e) => set({ facebook: e.target.value })} className="mt-1" /></div>
            <div><Label>Instagram</Label><Input value={form.instagram} onChange={(e) => set({ instagram: e.target.value })} className="mt-1" /></div>
            <div><Label>TikTok</Label><Input value={form.tiktok} onChange={(e) => set({ tiktok: e.target.value })} className="mt-1" /></div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4 rounded-2xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Shipping Fee ({form.currency})</Label><Input type="number" value={form.shippingFee} onChange={(e) => set({ shippingFee: +e.target.value })} className="mt-1" /></div>
            <div><Label>Free Shipping Threshold</Label><Input type="number" value={form.freeShippingThreshold} onChange={(e) => set({ freeShippingThreshold: +e.target.value })} className="mt-1" /></div>
            <div className="sm:col-span-2"><Label>SEO Title</Label><Input value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} className="mt-1" /></div>
            <div className="sm:col-span-2"><Label>SEO Description</Label><Textarea value={form.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} rows={3} className="mt-1" /></div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}
