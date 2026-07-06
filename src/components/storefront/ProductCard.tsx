import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatCurrency, discountPercent } from "@/lib/currency";
import { Stars } from "./Stars";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, inWishlist, settings } = useStore();
  const off = discountPercent(product.price, product.oldPrice);
  const wished = inWishlist(product.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card card-hover">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {off > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
              -{off}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-brand-gradient px-2 py-0.5 text-xs font-bold text-white">New</span>
          )}
          {product.bestSeller && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">Best Seller</span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
            toast(wished ? "Removed from wishlist" : "Added to wishlist");
          }}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full glass text-foreground transition hover:scale-110"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={cn(wished && "fill-red-500 text-red-500")} />
        </button>
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-sm font-semibold">
            Out of stock
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="line-clamp-2 text-sm font-medium hover:text-brand">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <Stars rating={product.rating} />
          <span className="text-xs text-muted-foreground">({product.reviewsCount})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-brand">{formatCurrency(product.price, settings.currency)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.oldPrice, settings.currency)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="mt-3 w-full gap-1.5"
          disabled={product.stock <= 0}
          onClick={() => {
            addToCart(product.id);
            toast.success("Added to cart");
          }}
        >
          <ShoppingCart size={15} /> Add to Cart
        </Button>
      </div>
    </div>
  );
}
