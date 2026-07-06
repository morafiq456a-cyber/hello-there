import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
};

export function SearchAutocomplete({ className, autoFocus, onNavigate }: Props) {
  const { products, settings } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return products
      .filter(
        (p) =>
          !p.hidden &&
          (p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)),
      )
      .slice(0, 6);
  }, [q, products]);

  useEffect(() => {
    setActive(-1);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goToSearch = () => {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    onNavigate?.();
    navigate({ to: "/search", search: { q: term } });
  };

  const goToProduct = (slug: string) => {
    setOpen(false);
    setQ("");
    onNavigate?.();
    navigate({ to: "/product/$slug", params: { slug } });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        goToSearch();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && suggestions[active]) goToProduct(suggestions[active].slug);
      else goToSearch();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && q.trim().length > 0;

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          goToSearch();
        }}
      >
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            id="site-search"
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search products..."
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="search-suggestions"
            className="pl-9 pr-9"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setOpen(false);
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover shadow-xl"
        >
          {suggestions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No products match “{q.trim()}”.
            </p>
          ) : (
            <ul className="max-h-[70vh] overflow-auto py-1">
              {suggestions.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => goToProduct(p.slug)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition",
                      i === active ? "bg-accent" : "hover:bg-accent",
                    )}
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {formatCurrency(p.price, settings.currency)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={goToSearch}
            className="flex w-full items-center gap-2 border-t px-4 py-2.5 text-sm font-medium text-brand hover:bg-accent"
          >
            <Search size={14} /> See all results for “{q.trim()}”
          </button>
        </div>
      )}
    </div>
  );
}
