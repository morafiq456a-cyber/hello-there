import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({ meta: [{ title: "Wishlist — Nova Store" }, { name: "robots", content: "noindex" }] }),
});

function WishlistPage() {
  const { wishlist, products } = useStore();
  const items = wishlist.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <StoreLayout>
      <PageHeader title="My Wishlist" subtitle={`${items.length} saved items`} breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Wishlist</>} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
            <Heart className="mb-3 text-muted-foreground" size={40} />
            <p className="text-lg font-semibold">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Save products you love to find them later.</p>
            <Button asChild className="mt-4"><Link to="/products">Browse Products</Link></Button>
          </div>
        ) : (
          <ProductGrid products={items} />
        )}
      </div>
    </StoreLayout>
  );
}
