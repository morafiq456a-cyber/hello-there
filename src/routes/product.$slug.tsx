import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Heart,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { Stars } from "@/components/storefront/Stars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, discountPercent } from "@/lib/currency";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const {
    products,
    categories,
    settings,
    addToCart,
    toggleWishlist,
    inWishlist,
    addRecentlyViewed,
    recentlyViewed,
  } = useStore();

  const product = products.find((p) => p.slug === slug && !p.hidden);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState({ x: 50, y: 50, on: false });

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      setActiveImg(0);
      setQty(1);
    }
  }, [product?.id]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id && !p.hidden).slice(0, 4);
  }, [product, products]);

  const recent = useMemo(
    () => recentlyViewed.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p && p.id !== product?.id).slice(0, 4),
    [recentlyViewed, products, product],
  );

  if (!product) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link to="/products" className="mt-4 inline-block text-brand hover:underline">Browse products</Link>
        </div>
      </StoreLayout>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const off = discountPercent(product.price, product.oldPrice);
  const wished = inWishlist(product.id);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch { /* cancelled */ }
  };

  const buyNow = () => {
    addToCart(product.id, qty);
    navigate({ to: "/checkout" });
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-brand">Home</Link> /{" "}
          {category && (
            <>
              <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-brand">{category.name}</Link> /{" "}
            </>
          )}
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div
              className="relative aspect-square overflow-hidden rounded-3xl border bg-muted"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
              }}
              onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
            >
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-200"
                style={zoom.on ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
              {off > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">-{off}%</span>
              )}
            </div>
            <div className="mt-3 flex gap-3">
              {product.images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "h-20 w-20 overflow-hidden rounded-xl border-2 transition",
                    activeImg === i ? "border-brand" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={im} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-2">
              {product.isNew && <Badge className="bg-brand-gradient text-white">New</Badge>}
              {product.bestSeller && <Badge className="bg-amber-500 text-white">Best Seller</Badge>}
              {product.featured && <Badge variant="secondary">Featured</Badge>}
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <Stars rating={product.rating} size={16} />
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewsCount} reviews)</span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-brand">{formatCurrency(product.price, settings.currency)}</span>
              {product.oldPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatCurrency(product.oldPrice, settings.currency)}</span>
              )}
              {off > 0 && <Badge variant="destructive">Save {off}%</Badge>}
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className={cn("flex items-center gap-1 font-medium", product.stock > 0 ? "text-green-600" : "text-destructive")}>
                <Check size={16} /> {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
              </span>
              <span className="text-muted-foreground">SKU: {product.sku}</span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-xl border">
                <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></Button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}><Plus size={16} /></Button>
              </div>
              <span className="text-sm text-muted-foreground">Total: {formatCurrency(product.price * qty, settings.currency)}</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                disabled={product.stock <= 0}
                onClick={() => { addToCart(product.id, qty); toast.success("Added to cart"); }}
              >
                <ShoppingCart size={18} /> Add to Cart
              </Button>
              <Button size="lg" className="gap-2" disabled={product.stock <= 0} onClick={buyNow}>
                Buy Now
              </Button>
            </div>

            <div className="mt-3 flex gap-3">
              <Button variant="ghost" className="gap-2" onClick={() => { toggleWishlist(product.id); toast(wished ? "Removed from wishlist" : "Added to wishlist"); }}>
                <Heart size={18} className={cn(wished && "fill-red-500 text-red-500")} /> Wishlist
              </Button>
              <Button variant="ghost" className="gap-2" onClick={handleShare}>
                <Share2 size={18} /> Share
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 text-sm">
              <span className="flex items-center gap-2"><Truck size={16} className="text-brand" /> Fast nationwide delivery</span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand" /> Cash on delivery</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <Tabs defaultValue="desc">
            <TabsList>
              <TabsTrigger value="desc">Description</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="desc" className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
              {product.description}
            </TabsContent>
            <TabsContent value="specs" className="rounded-2xl border bg-card p-6">
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{s.label}</td>
                      <td className="py-2 text-muted-foreground">{s.value}</td>
                    </tr>
                  ))}
                  <tr className="border-b"><td className="py-2 pr-4 font-medium">Weight</td><td className="py-2 text-muted-foreground">{product.weight} kg</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">Dimensions</td><td className="py-2 text-muted-foreground">{product.dimensions}</td></tr>
                </tbody>
              </table>
            </TabsContent>
            <TabsContent value="shipping" className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
              Orders are delivered within 2–4 business days across Egypt. Free shipping on orders over {settings.freeShippingThreshold} {settings.currency}. Cash on delivery only.
            </TabsContent>
          </Tabs>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 text-xl font-bold">Related Products</h2>
            <ProductGrid products={related} />
          </div>
        )}

        {recent.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 text-xl font-bold">Recently Viewed</h2>
            <ProductGrid products={recent} />
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
