import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  defaultSettings,
  seedBanners,
  seedCategories,
  seedCoupons,
  seedProducts,
} from "./seed";
import type {
  Banner,
  CartItem,
  Category,
  Coupon,
  Customer,
  Order,
  OrderStatus,
  Product,
  Settings,
} from "./types";

const KEY = "nova_store_v1";

type PersistShape = {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  settings: Settings;
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  admin: boolean;
};

const defaultState: PersistShape = {
  products: seedProducts,
  categories: seedCategories,
  orders: [],
  coupons: seedCoupons,
  banners: seedBanners,
  settings: defaultSettings,
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  admin: false,
};

type StoreContextValue = {
  hydrated: boolean;
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  settings: Settings;
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  admin: boolean;
  customers: Customer[];
  // cart
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  setCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  // wishlist
  toggleWishlist: (productId: string) => void;
  inWishlist: (productId: string) => boolean;
  // viewed
  addRecentlyViewed: (productId: string) => void;
  // products/categories admin
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  reorderProducts: (ids: string[]) => void;
  saveCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (ids: string[]) => void;
  // coupons
  saveCoupon: (c: Coupon) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, subtotal: number) => { ok: boolean; message: string; discount: number; coupon?: Coupon };
  // banners
  saveBanner: (b: Banner) => void;
  deleteBanner: (id: string) => void;
  // orders
  placeOrder: (order: Omit<Order, "id" | "number" | "createdAt" | "status">) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  // settings
  updateSettings: (s: Partial<Settings>) => void;
  // admin
  login: (password: string) => boolean;
  logout: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistShape>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const firstWrite = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistShape>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (firstWrite.current) {
      firstWrite.current = false;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const patch = useCallback((p: Partial<PersistShape>) => {
    setState((prev) => ({ ...prev, ...p }));
  }, []);

  // ---------- Cart ----------
  const addToCart = useCallback((productId: string, qty = 1) => {
    setState((prev) => {
      const existing = prev.cart.find((c) => c.productId === productId);
      const cart = existing
        ? prev.cart.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + qty } : c))
        : [...prev.cart, { productId, quantity: qty }];
      return { ...prev, cart };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState((prev) => ({ ...prev, cart: prev.cart.filter((c) => c.productId !== productId) }));
  }, []);

  const setCartQty = useCallback((productId: string, qty: number) => {
    setState((prev) => ({
      ...prev,
      cart: qty <= 0
        ? prev.cart.filter((c) => c.productId !== productId)
        : prev.cart.map((c) => (c.productId === productId ? { ...c, quantity: qty } : c)),
    }));
  }, []);

  const clearCart = useCallback(() => setState((prev) => ({ ...prev, cart: [] })), []);

  // ---------- Wishlist ----------
  const toggleWishlist = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      wishlist: prev.wishlist.includes(productId)
        ? prev.wishlist.filter((id) => id !== productId)
        : [...prev.wishlist, productId],
    }));
  }, []);

  const addRecentlyViewed = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      recentlyViewed: [productId, ...prev.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
    }));
  }, []);

  // ---------- Products ----------
  const saveProduct = useCallback((p: Product) => {
    setState((prev) => {
      const exists = prev.products.some((x) => x.id === p.id);
      return {
        ...prev,
        products: exists ? prev.products.map((x) => (x.id === p.id ? p : x)) : [...prev.products, p],
      };
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  }, []);

  const reorderProducts = useCallback((ids: string[]) => {
    setState((prev) => ({
      ...prev,
      products: prev.products
        .map((p) => ({ ...p, sort: ids.indexOf(p.id) === -1 ? p.sort : ids.indexOf(p.id) }))
        .sort((a, b) => a.sort - b.sort),
    }));
  }, []);

  // ---------- Categories ----------
  const saveCategory = useCallback((c: Category) => {
    setState((prev) => {
      const exists = prev.categories.some((x) => x.id === c.id);
      return {
        ...prev,
        categories: exists ? prev.categories.map((x) => (x.id === c.id ? c : x)) : [...prev.categories, c],
      };
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  }, []);

  const reorderCategories = useCallback((ids: string[]) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories
        .map((c) => ({ ...c, sort: ids.indexOf(c.id) === -1 ? c.sort : ids.indexOf(c.id) }))
        .sort((a, b) => a.sort - b.sort),
    }));
  }, []);

  // ---------- Coupons ----------
  const saveCoupon = useCallback((c: Coupon) => {
    setState((prev) => {
      const exists = prev.coupons.some((x) => x.id === c.id);
      return {
        ...prev,
        coupons: exists ? prev.coupons.map((x) => (x.id === c.id ? c : x)) : [...prev.coupons, c],
      };
    });
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    setState((prev) => ({ ...prev, coupons: prev.coupons.filter((c) => c.id !== id) }));
  }, []);

  const validateCoupon = useCallback(
    (code: string, subtotal: number) => {
      const coupon = state.coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
      if (!coupon) return { ok: false, message: "Invalid coupon code", discount: 0 };
      if (!coupon.active) return { ok: false, message: "This coupon is no longer active", discount: 0 };
      if (coupon.minOrder && subtotal < coupon.minOrder)
        return { ok: false, message: `Minimum order of ${coupon.minOrder} required`, discount: 0 };
      const discount = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
      return { ok: true, message: `Coupon applied: -${Math.round(discount)}`, discount, coupon };
    },
    [state.coupons],
  );

  // ---------- Banners ----------
  const saveBanner = useCallback((b: Banner) => {
    setState((prev) => {
      const exists = prev.banners.some((x) => x.id === b.id);
      return {
        ...prev,
        banners: exists ? prev.banners.map((x) => (x.id === b.id ? b : x)) : [...prev.banners, b],
      };
    });
  }, []);

  const deleteBanner = useCallback((id: string) => {
    setState((prev) => ({ ...prev, banners: prev.banners.filter((b) => b.id !== id) }));
  }, []);

  // ---------- Orders ----------
  const placeOrder = useCallback(
    (order: Omit<Order, "id" | "number" | "createdAt" | "status">) => {
      const id = `o${Date.now()}`;
      const number = `NV-${Math.floor(100000 + Math.random() * 900000)}`;
      const full: Order = { ...order, id, number, createdAt: new Date().toISOString(), status: "New" };
      setState((prev) => ({
        ...prev,
        orders: [full, ...prev.orders],
        cart: [],
        products: prev.products.map((p) => {
          const item = order.items.find((i) => i.productId === p.id);
          return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
        }),
      }));
      return full;
    },
    [],
  );

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setState((prev) => ({ ...prev, orders: prev.orders.filter((o) => o.id !== id) }));
  }, []);

  // ---------- Settings ----------
  const updateSettings = useCallback((s: Partial<Settings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...s } }));
  }, []);

  // ---------- Admin ----------
  const login = useCallback((password: string) => {
    if (password === "admin123") {
      patch({ admin: true });
      return true;
    }
    return false;
  }, [patch]);

  const logout = useCallback(() => patch({ admin: false }), [patch]);

  // ---------- Derived ----------
  const cartCount = useMemo(() => state.cart.reduce((s, c) => s + c.quantity, 0), [state.cart]);

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const o of state.orders) {
      const key = o.customer.phone;
      const existing = map.get(key);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += o.total;
        if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
      } else {
        map.set(key, {
          id: key,
          fullName: o.customer.fullName,
          phone: o.customer.phone,
          governorate: o.customer.governorate,
          ordersCount: 1,
          totalSpent: o.total,
          lastOrderAt: o.createdAt,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [state.orders]);

  const value: StoreContextValue = {
    hydrated,
    ...state,
    customers,
    addToCart,
    removeFromCart,
    setCartQty,
    clearCart,
    cartCount,
    toggleWishlist,
    inWishlist: (id) => state.wishlist.includes(id),
    addRecentlyViewed,
    saveProduct,
    deleteProduct,
    reorderProducts,
    saveCategory,
    deleteCategory,
    reorderCategories,
    saveCoupon,
    deleteCoupon,
    validateCoupon,
    saveBanner,
    deleteBanner,
    placeOrder,
    updateOrderStatus,
    deleteOrder,
    updateSettings,
    login,
    logout,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
