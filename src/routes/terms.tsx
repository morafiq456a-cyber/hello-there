import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Nova Store" },
      { name: "description", content: "The terms and conditions governing your use of Nova Store." },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
});

const SECTIONS = [
  { h: "Acceptance of Terms", p: "By using our website and placing orders, you agree to these terms and conditions in full." },
  { h: "Orders & Payment", p: "All orders are subject to availability. We currently accept Cash on Delivery only. Prices are listed in EGP and include applicable taxes." },
  { h: "Shipping & Delivery", p: "We deliver across all governorates in Egypt within 2–4 business days. Delivery times may vary based on location and availability." },
  { h: "Returns & Refunds", p: "Items may be returned within 14 days of delivery if unused and in original packaging. Refunds are processed after inspection." },
  { h: "Product Information", p: "We strive for accuracy in product descriptions and images, but slight variations may occur. Colors may differ due to screen settings." },
  { h: "Limitation of Liability", p: "We are not liable for any indirect damages arising from the use of our products or website beyond the value of the purchased items." },
  { h: "Changes to Terms", p: "We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of the updated terms." },
];

function TermsPage() {
  return (
    <StoreLayout>
      <PageHeader title="Terms & Conditions" breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Terms</>} />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold">{s.h}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
    </StoreLayout>
  );
}
