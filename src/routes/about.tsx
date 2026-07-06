import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Heart, ShieldCheck, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — Nova Store" },
      { name: "description", content: "Learn about Nova Store — your trusted destination for premium online shopping in Egypt." },
      { property: "og:title", content: "About Nova Store" },
      { property: "og:description", content: "Your trusted destination for premium online shopping in Egypt." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

const VALUES = [
  { icon: Award, title: "Quality First", desc: "We curate only the best products from trusted brands." },
  { icon: Truck, title: "Fast Delivery", desc: "Reliable nationwide shipping within 2–4 days." },
  { icon: ShieldCheck, title: "Shop Safely", desc: "Cash on delivery and a secure shopping experience." },
  { icon: Heart, title: "Customer Care", desc: "A dedicated team ready to help you anytime." },
];

function AboutPage() {
  const { settings } = useStore();
  return (
    <StoreLayout>
      <PageHeader title={`About ${settings.storeName}`} breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / About</>} />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="prose-lg space-y-4 text-muted-foreground">
          <p>{settings.storeName} is a leading online store dedicated to bringing you premium products at unbeatable prices. From cutting-edge electronics to the latest fashion, home essentials, beauty, and more — we've got everything you need in one place.</p>
          <p>Founded with a passion for quality and customer satisfaction, we serve thousands of happy customers across Egypt with cash on delivery, fast shipping, and dedicated support.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border bg-card p-5 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white"><v.icon size={22} /></span>
              <h3 className="mt-3 font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 rounded-3xl bg-brand-gradient p-8 text-center text-white sm:grid-cols-3">
          <div><p className="text-3xl font-extrabold">50K+</p><p className="text-sm text-white/80">Happy Customers</p></div>
          <div><p className="text-3xl font-extrabold">1000+</p><p className="text-sm text-white/80">Products</p></div>
          <div><p className="text-3xl font-extrabold">27</p><p className="text-sm text-white/80">Governorates Served</p></div>
        </div>
      </div>
    </StoreLayout>
  );
}
