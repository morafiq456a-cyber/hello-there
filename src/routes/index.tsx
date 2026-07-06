import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Headphones,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CategoryIcon } from "@/components/storefront/CategoryIcon";
import { Stars } from "@/components/storefront/Stars";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { seedFaq, seedReviews } from "@/lib/seed";

export const Route = createFileRoute("/")({
  component: Index,
});

function HeroSlider() {
  const { banners } = useStore();
  const active = banners.filter((b) => b.active).sort((a, b) => a.sort - b.sort);
  const [i, setI] = useState(0);
  const count = active.length || 1;

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);

  if (active.length === 0) return null;

  return (
    <div className="relative mx-auto mt-4 max-w-7xl overflow-hidden rounded-3xl px-0 sm:px-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl sm:aspect-[21/8]">
        {active.map((b, idx) => (
          <div
            key={b.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0 }}
          >
            <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 sm:p-14">
              <h2 className="max-w-lg text-2xl font-extrabold text-white sm:text-5xl">{b.title}</h2>
              <p className="max-w-md text-sm text-white/90 sm:text-lg">{b.subtitle}</p>
              <div>
                <Button asChild size="lg" className="mt-2 gap-2">
                  <Link to={b.link}>{b.cta} <ArrowRight size={16} /></Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setI((p) => (p - 1 + count) % count)}
        className="absolute left-6 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full glass"
        aria-label="Previous"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={() => setI((p) => (p + 1) % count)}
        className="absolute right-6 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full glass"
        aria-label="Next"
      >
        <ChevronRight />
      </button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {active.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, to }: { title: string; subtitle?: string; to?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          View all <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

const FEATURES = [
  { icon: Truck, title: "Fast Delivery", desc: "2–4 days nationwide" },
  { icon: ShieldCheck, title: "Secure Shopping", desc: "Safe & protected" },
  { icon: RefreshCcw, title: "Easy Returns", desc: "14-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

function Index() {
  const { products, categories, settings } = useStore();
  const visible = products.filter((p) => !p.hidden);

  const featured = useMemo(() => visible.filter((p) => p.featured).slice(0, 8), [visible]);
  const bestSellers = useMemo(() => visible.filter((p) => p.bestSeller).slice(0, 4), [visible]);
  const newArrivals = useMemo(
    () => [...visible].filter((p) => p.isNew).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8),
    [visible],
  );
  const deals = useMemo(
    () => visible.filter((p) => p.oldPrice && p.oldPrice > p.price).slice(0, 4),
    [visible],
  );

  return (
    <StoreLayout>
      <HeroSlider />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <f.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeader title="Shop by Category" subtitle="Find exactly what you need" to="/categories" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.filter((c) => !c.hidden).map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center card-hover"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand transition group-hover:bg-brand-gradient group-hover:text-white">
                <CategoryIcon name={c.icon} />
              </span>
              <span className="text-xs font-medium sm:text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeader title="Featured Products" subtitle="Handpicked for you" to="/products" />
        <ProductGrid products={featured} />
      </section>

      {deals.length > 0 && (
        <section className="mx-auto mt-6 max-w-7xl px-4 py-6">
          <div className="overflow-hidden rounded-3xl bg-brand-gradient p-6 sm:p-10">
            <div className="mb-5 flex items-center gap-3 text-white">
              <BadgePercent size={28} />
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">Hot Deals & Discounts</h2>
                <p className="text-sm text-white/80">Limited time offers — grab them fast!</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeader title="Best Sellers" subtitle="Our most loved products" to="/products" />
        <ProductGrid products={bestSellers} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeader title="New Arrivals" subtitle="Fresh additions to the store" to="/products" />
        <ProductGrid products={newArrivals} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeader title="What Our Customers Say" subtitle="Real reviews from happy shoppers" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {seedReviews.map((r) => (
            <div key={r.id} className="rounded-2xl border bg-card p-5">
              <Stars rating={r.rating} />
              <p className="mt-3 text-sm text-muted-foreground">“{r.text}”</p>
              <div className="mt-4 flex items-center gap-3">
                <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-full object-cover" />
                <span className="text-sm font-semibold">{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <SectionHeader title="Frequently Asked Questions" />
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-4">
          {seedFaq.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="flex flex-col items-center gap-4 rounded-3xl border bg-card p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to shop with {settings.storeName}?</h2>
          <p className="max-w-md text-muted-foreground">
            Browse hundreds of premium products with cash on delivery across Egypt.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/products">Start Shopping <ArrowRight size={16} /></Link>
          </Button>
        </div>
      </section>
    </StoreLayout>
  );
}
