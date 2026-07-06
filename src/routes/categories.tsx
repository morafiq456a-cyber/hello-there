import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { CategoryIcon } from "@/components/storefront/CategoryIcon";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({
    meta: [
      { title: "Categories — Nova Store" },
      { name: "description", content: "Explore all product categories at Nova Store." },
    ],
  }),
});

function CategoriesPage() {
  const { categories, products } = useStore();
  const visible = categories.filter((c) => !c.hidden).sort((a, b) => a.sort - b.sort);

  return (
    <StoreLayout>
      <PageHeader
        title="Shop by Category"
        subtitle="Browse our full range of collections"
        breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Categories</>}
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id && !p.hidden).length;
          return (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative overflow-hidden rounded-3xl border card-hover"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl glass text-white">
                    <CategoryIcon name={c.icon} />
                  </span>
                  <div>
                    <h3 className="font-bold">{c.name}</h3>
                    <p className="text-xs text-white/80">{count} products</p>
                  </div>
                </div>
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </StoreLayout>
  );
}
