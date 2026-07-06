import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, Store } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
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
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (hydrated && admin) navigate({ to: "/admin" });
  }, [hydrated, admin, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast.success("Welcome back!");
      navigate({ to: "/admin" });
    } else {
      toast.error("Incorrect password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-gradient p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white"><Store size={26} /></span>
          <h1 className="mt-3 text-xl font-bold">{settings.storeName} Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your store</p>
        </div>
        <div>
          <Label htmlFor="pw">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" className="pl-9" autoFocus />
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-5 w-full">Sign In</Button>
        <p className="mt-4 text-center text-xs text-muted-foreground">Demo password: <span className="font-mono font-semibold">admin123</span></p>
      </form>
    </div>
  );
}
