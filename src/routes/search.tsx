import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Search = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({ q: typeof s.q === "string" ? s.q : "" }),
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search — Nova Store" }, { name: "robots", content: "noindex" }] }),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { products } = useStore();
  const [term, setTerm] = useState(q ?? "");

  const results = useMemo(() => {
    const query = (q ?? "").trim().toLowerCase();
    if (!query) return [];
    return products.filter(
      (p) => !p.hidden && (p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)),
    );
  }, [q, products]);

  return (
    <StoreLayout>
      <PageHeader title="Search" breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Search</>} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/search", search: { q: term } }); }}
          className="mb-6 flex gap-2"
        >
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search for products..." className="pl-10" />
          </div>
          <Button type="submit">Search</Button>
        </form>
        {q ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{results.length} results for “{q}”</p>
            <ProductGrid products={results} />
          </>
        ) : (
          <p className="text-center text-muted-foreground">Start typing to search our catalog.</p>
        )}
      </div>
    </StoreLayout>
  );
}
