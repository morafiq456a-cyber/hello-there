import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, ShoppingCart, Store, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchAutocomplete } from "@/components/storefront/SearchAutocomplete";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/" as const },
  { label: "Products", to: "/products" as const },
  { label: "Categories", to: "/categories" as const },
  { label: "Track Order", to: "/track-order" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function Header() {
  const { cartCount, wishlist, settings, categories } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q } });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b glass">
      <div className="bg-brand-gradient text-center text-xs font-medium text-white">
        <div className="mx-auto max-w-7xl px-4 py-1.5">
          🚚 Free shipping on orders over {settings.freeShippingThreshold} {settings.currency} · Cash on Delivery available
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-gradient">{settings.storeName}</SheetTitle>
            </SheetHeader>
            <form onSubmit={submitSearch} className="mt-4 flex gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." />
              <Button size="icon" type="submit"><Search size={16} /></Button>
            </form>
            <nav className="mt-4 flex flex-col">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t pt-4">
              <p className="px-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">Categories</p>
              {categories.filter((c) => !c.hidden).map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-accent"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 font-extrabold">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.storeName} className="h-9 w-auto" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <Store size={18} />
            </span>
          )}
          <span className="hidden text-lg text-gradient sm:inline">{settings.storeName}</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition hover:text-brand",
                pathname === n.to && "text-brand",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Track order">
            <Link to="/track-order"><Truck size={20} /></Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Wishlist">
            <Link to="/wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
                  {wishlist.length}
                </Badge>
              )}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Cart">
            <Link to="/cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
