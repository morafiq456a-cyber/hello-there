import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/account/login")({
  component: AccountAuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Nova Store" },
      { name: "description", content: "Sign in or create a Nova Store account to track your orders and check out faster." },
      { property: "og:title", content: "Sign in — Nova Store" },
      { property: "og:description", content: "Access your Nova Store account, saved details and order history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function AccountAuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useStore();
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/account" });
  }, [user, navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await signIn(loginEmail, loginPassword);
    setBusy(false);
    if (res.ok) {
      toast.success("Welcome back!");
      navigate({ to: "/account" });
    } else {
      toast.error(res.message || "Could not sign in");
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return toast.error("Please enter your full name");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const res = await signUp({ email, password, fullName: name, phone });
    setBusy(false);
    if (!res.ok) return toast.error(res.message || "Could not create account");
    if (res.needsConfirm) {
      setSent(true);
      toast.success(res.message);
    } else {
      toast.success("Account created!");
      navigate({ to: "/account" });
    }
  };

  return (
    <StoreLayout>
      <PageHeader title="My Account" breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Account</>} />
      <div className="mx-auto max-w-md px-4 py-10">
        <Tabs defaultValue="login" className="rounded-2xl border bg-card p-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={onLogin} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="le">Email</Label>
                <Input id="le" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lp">Password</Label>
                <Input id="lp" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="mt-1" />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />} Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            {sent ? (
              <p className="mt-6 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                We sent a confirmation link to <b>{email}</b>. Open it to activate your account, then sign in.
              </p>
            ) : (
              <form onSubmit={onRegister} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="rn">Full Name</Label>
                  <Input id="rn" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="rph">Phone</Label>
                  <Input id="rph" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="01xxxxxxxxx" />
                </div>
                <div>
                  <Label htmlFor="re">Email</Label>
                  <Input id="re" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="rp">Password</Label>
                  <Input id="rp" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />} Create Account
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          You can also <Link to="/checkout" className="text-brand hover:underline">check out as a guest</Link>.
        </p>
      </div>
    </StoreLayout>
  );
}
