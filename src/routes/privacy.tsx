import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nova Store" },
      { name: "description", content: "Read how Nova Store collects, uses, and protects your personal information." },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
});

const SECTIONS = [
  { h: "Information We Collect", p: "We collect information you provide when placing an order, including your name, phone number, and delivery address. This information is used solely to process and deliver your orders." },
  { h: "How We Use Your Data", p: "Your data is used to fulfill orders, provide customer support, and improve your shopping experience. We never sell your personal information to third parties." },
  { h: "Data Security", p: "We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure." },
  { h: "Cookies", p: "We use cookies and local storage to remember your cart, wishlist, and preferences for a smoother experience." },
  { h: "Your Rights", p: "You have the right to access, correct, or delete your personal data at any time by contacting our support team." },
  { h: "Contact", p: "If you have any questions about this Privacy Policy, please reach out to us through our Contact page." },
];

function PrivacyPage() {
  return (
    <StoreLayout>
      <PageHeader title="Privacy Policy" breadcrumb={<><Link to="/" className="hover:text-brand">Home</Link> / Privacy</>} />
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
