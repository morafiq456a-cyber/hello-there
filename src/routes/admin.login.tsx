import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail, Store } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { adminExistsFn, claimFirstAdminFn } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Admin Login — Nova Store" }, { name: "robots", content: "noindex" }] }),
});

function AdminLogin() {
  const { login, admin, hydrated, settings } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    if (hydrated && admin) navigate({ to: "/admin" });
  }, [hydrated, admin, navigate]);

  useEffect(() => {
    adminExistsFn()
      .then((exists) => setNeedsSetup(!exists))
      .catch(() => setNeedsSetup(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      if (needsSetup) {
        await claimFirstAdminFn({ data: { email, password } });
        toast.success("Admin account created!");
        setNeedsSetup(false);
      }
      const ok = await login(email, password);
      if (ok) {
        toast.success("Welcome back!");
        navigate({ to: "/admin" });
      } else {
        toast.error("Invalid credentials or not an admin account");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-gradient p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white"><Store size={26} /></span>
          <h1 className="mt-3 text-xl font-bold">{settings.storeName} Admin</h1>
          <p className="text-sm text-muted-foreground">
            {needsSetup ? "Create your admin account to get started" : "Sign in to manage your store"}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="pl-9" required autoFocus />
            </div>
          </div>
          <div>
            <Label htmlFor="pw">Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" required />
            </div>
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-5 w-full gap-2" disabled={busy || needsSetup === null}>
          {busy ? <Loader2 className="animate-spin" size={16} /> : needsSetup ? "Create Admin Account" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
