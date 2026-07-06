import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Store } from "lucide-react";
import { useStore } from "@/lib/store";

export function Footer() {
  const { settings, categories } = useStore();
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <Store size={18} />
            </span>
            <span className="text-lg text-gradient">{settings.storeName}</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">{settings.seoDescription}</p>
          <div className="mt-4 flex gap-2">
            <a href={settings.facebook} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-accent" aria-label="Facebook"><Facebook size={16} /></a>
            <a href={settings.instagram} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-accent" aria-label="Instagram"><Instagram size={16} /></a>
            <a href={settings.tiktok} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-accent" aria-label="TikTok">
              <span className="text-xs font-bold">TT</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-brand">All Products</Link></li>
            {categories.filter((c) => !c.hidden).slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-brand">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/track-order" className="hover:text-brand">Track Order</Link></li>
            <li><Link to="/contact" className="hover:text-brand">Contact Us</Link></li>
            <li><Link to="/about" className="hover:text-brand">About Us</Link></li>
            <li><Link to="/privacy" className="hover:text-brand">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-brand">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> {settings.address}</li>
            <li className="flex items-center gap-2"><Phone size={16} /> {settings.phone}</li>
            <li className="flex items-center gap-2"><Mail size={16} /> {settings.email}</li>
            <li className="text-xs">{settings.businessHours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
