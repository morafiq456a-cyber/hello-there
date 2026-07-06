import { Link } from "@tanstack/react-router";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store";

export function StickyActions() {
  const { settings, cartCount } = useStore();
  return (
    <>
      <a
        href={`https://wa.me/${settings.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
      {cartCount > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-brand-gradient px-5 text-white shadow-lg transition hover:scale-105"
          aria-label="View cart"
        >
          <ShoppingCart size={22} />
          <span className="font-semibold">{cartCount}</span>
        </Link>
      )}
    </>
  );
}
