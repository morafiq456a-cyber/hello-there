import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { categories, products, hydrated } = useStore();
  const [sort, setSort] = useState("featured");
  const category = categories.find((c) => c.slug === slug);

  const list = useMemo(() => {
    if (!category) return [];
    let l = products.filter((p) => p.categoryId === category.id && !p.hidden);
    switch (sort) {
      case "price-asc": l = [...l].sort((a, b) => a.price - b.price); break;
      case "price-desc": l = [...l].sort((a, b) => b.price - a.price); break;
      case "newest": l = [...l].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
      case "rating": l = [...l].sort((a, b) => b.rating - a.rating); break;
      default: l = [...l].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return l;
  }, [category, products, sort]);

  if (!category) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <Link to="/categories" className="mt-4 inline-block text-brand hover:underline">Back to categories</Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <PageHeader
        title={category.name}
        subtitle={category.description}
        breadcrumb={
          <>
            <Link to="/" className="hover:text-brand">Home</Link> /{" "}
            <Link to="/categories" className="hover:text-brand">Categories</Link> / {category.name}
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{list.length} products</span>
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
        <ProductGrid products={list} loading={!hydrated} />
      </div>
    </StoreLayout>
  );
}
