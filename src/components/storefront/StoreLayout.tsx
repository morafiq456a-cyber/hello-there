import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { StickyActions } from "./StickyActions";

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 animate-fade-in">{children}</main>
      <Footer />
      <StickyActions />
    </div>
  );
}

export function PageHeader({ title, subtitle, breadcrumb }: { title: string; subtitle?: string; breadcrumb?: ReactNode }) {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {breadcrumb && <div className="mb-2 text-sm text-muted-foreground">{breadcrumb}</div>}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
