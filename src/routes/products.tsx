import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

type Search = { category?: string; sort?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
  }),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "All Products — Nova Store" },
      { name: "description", content: "Browse our full catalog of premium products with cash on delivery." },
    ],
  }),
});

function ProductsPage() {
  const { products, categories, hydrated } = useStore();
  const search = Route.useSearch();
  const [selectedCats, setSelectedCats] = useState<string[]>(search.category ? [search.category] : []);
  const [sort, setSort] = useState(search.sort ?? "featured");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [onlyDiscount, setOnlyDiscount] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => !p.hidden);
    if (selectedCats.length) list = list.filter((p) => selectedCats.includes(p.categoryId));
    list = list.filter((p) => p.price <= maxPrice);
    if (onlyDiscount) list = list.filter((p) => p.oldPrice && p.oldPrice > p.price);
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "newest": list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      default: list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, selectedCats, maxPrice, onlyDiscount, sort]);

  const toggleCat = (id: string) =>
    setSelectedCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const Filters = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><SlidersHorizontal size={16} /> Categories</h3>
        <div className="space-y-2">
          {categories.filter((c) => !c.hidden).map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <Checkbox id={`cat-${c.id}`} checked={selectedCats.includes(c.id)} onCheckedChange={() => toggleCat(c.id)} />
              <Label htmlFor={`cat-${c.id}`} className="cursor-pointer text-sm font-normal">{c.name}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">Max Price</h3>
        <Slider value={[maxPrice]} min={200} max={10000} step={100} onValueChange={(v) => setMaxPrice(v[0])} />
        <p className="mt-2 text-sm text-muted-foreground">Up to {maxPrice.toLocaleString()} EGP</p>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="discount" checked={onlyDiscount} onCheckedChange={(v) => setOnlyDiscount(!!v)} />
        <Label htmlFor="discount" className="cursor-pointer text-sm font-normal">On sale only</Label>
      </div>
      <Button variant="outline" className="w-full" onClick={() => { setSelectedCats([]); setMaxPrice(10000); setOnlyDiscount(false); }}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <StoreLayout>
      <PageHeader
        title="All Products"
        subtitle={`${filtered.length} products available`}
        breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Products</>}
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-2xl border bg-card p-5 lg:block">
          <Filters />
        </aside>
        <div>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">{filtered.length} results</span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4 rounded-2xl border bg-card p-4 lg:hidden">
            <Filters />
          </div>
          <ProductGrid products={filtered} loading={!hydrated} />
        </div>
      </div>
    </StoreLayout>
  );
}
