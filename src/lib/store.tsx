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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import * as api from "./api";
import {
  placeOrderFn,
  trackOrderFn,
  validateCouponFn,
  type CouponResult,
  type PlaceOrderInput,
} from "./orders.functions";
import { defaultSettings } from "./seed";
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

const LOCAL_KEY = "nova_store_local_v2";

type LocalState = {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  lastOrder: Order | null;
};

const defaultLocal: LocalState = { cart: [], wishlist: [], recentlyViewed: [], lastOrder: null };

type StoreContextValue = {
  hydrated: boolean;
  loading: boolean;
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  settings: Settings;
  customers: Customer[];
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  lastOrder: Order | null;
  admin: boolean;
  user: User | null;
  // customer auth
  signUp: (input: { email: string; password: string; fullName: string; phone: string }) => Promise<{ ok: boolean; needsConfirm: boolean; message: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signOut: () => Promise<void>;
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
  saveProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  reorderProducts: (ids: string[]) => Promise<void>;
  saveCategory: (c: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (ids: string[]) => Promise<void>;
  // coupons
  saveCoupon: (c: Coupon) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  validateCoupon: (code: string, subtotal: number) => Promise<CouponResult>;
  // banners
  saveBanner: (b: Banner) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  // orders
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  trackOrder: (number: string, phone: string) => Promise<Order | null>;
  // settings
  updateSettings: (s: Partial<Settings>) => void;
  // admin
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // ---------- Auth ----------
  const [, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const checkRole = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setAdmin(false);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    setAdmin(!!data);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await checkRole(data.session?.user?.id);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Only react to real identity transitions. Ignore TOKEN_REFRESHED
      // (~hourly + on tab focus) and INITIAL_SESSION (every mount) to avoid
      // thrashing the query cache with unnecessary refetches.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setTimeout(() => checkRole(session?.user?.id), 0);
        // Don't refetch protected queries against a cleared session on sign-out.
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [checkRole, queryClient]);

  // ---------- Server-backed data ----------
  const productsQ = useQuery({ queryKey: ["products"], queryFn: api.fetchProducts });
  const categoriesQ = useQuery({ queryKey: ["categories"], queryFn: api.fetchCategories });
  const bannersQ = useQuery({ queryKey: ["banners"], queryFn: api.fetchBanners });
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: api.fetchSettings });
  const couponsQ = useQuery({ queryKey: ["coupons"], queryFn: api.fetchCoupons, enabled: admin });
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: api.fetchOrders, enabled: admin });
  const customersQ = useQuery({ queryKey: ["customers"], queryFn: api.fetchCustomers, enabled: admin });

  // ---------- Settings (local live-preview + debounced persist) ----------
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const pendingPatch = useRef<Partial<Settings>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (settingsQ.data) setSettings(settingsQ.data);
  }, [settingsQ.data]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    pendingPatch.current = { ...pendingPatch.current, ...patch };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const p = pendingPatch.current;
      pendingPatch.current = {};
      try {
        await api.updateSettings(p);
      } catch {
        /* silent; RLS blocks non-admins */
      }
    }, 600);
  }, []);

  // ---------- Local state (cart / wishlist / recently viewed) ----------
  const [local, setLocal] = useState<LocalState>(defaultLocal);
  const [localHydrated, setLocalHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setLocal({ ...defaultLocal, ...(JSON.parse(raw) as Partial<LocalState>) });
    } catch {
      /* ignore */
    }
    setLocalHydrated(true);
  }, []);

  useEffect(() => {
    if (!localHydrated) return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
    } catch {
      /* ignore */
    }
  }, [local, localHydrated]);

  // ---------- Derived data ----------
  const products = productsQ.data ?? [];
  const categories = categoriesQ.data ?? [];
  const banners = bannersQ.data ?? [];
  const coupons = couponsQ.data ?? [];
  const orders = ordersQ.data ?? [];
  const customers = customersQ.data ?? [];

  const cartCount = useMemo(() => local.cart.reduce((s, c) => s + c.quantity, 0), [local.cart]);

  // ---------- Cart ----------
  const addToCart = useCallback((productId: string, qty = 1) => {
    setLocal((prev) => {
      const existing = prev.cart.find((c) => c.productId === productId);
      const cart = existing
        ? prev.cart.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + qty } : c))
        : [...prev.cart, { productId, quantity: qty }];
      return { ...prev, cart };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setLocal((prev) => ({ ...prev, cart: prev.cart.filter((c) => c.productId !== productId) }));
  }, []);

  const setCartQty = useCallback((productId: string, qty: number) => {
    setLocal((prev) => ({
      ...prev,
      cart:
        qty <= 0
          ? prev.cart.filter((c) => c.productId !== productId)
          : prev.cart.map((c) => (c.productId === productId ? { ...c, quantity: qty } : c)),
    }));
  }, []);

  const clearCart = useCallback(() => setLocal((prev) => ({ ...prev, cart: [] })), []);

  // ---------- Wishlist ----------
  const toggleWishlist = useCallback((productId: string) => {
    setLocal((prev) => ({
      ...prev,
      wishlist: prev.wishlist.includes(productId)
        ? prev.wishlist.filter((id) => id !== productId)
        : [...prev.wishlist, productId],
    }));
  }, []);

  const addRecentlyViewed = useCallback((productId: string) => {
    setLocal((prev) => ({
      ...prev,
      recentlyViewed: [productId, ...prev.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
    }));
  }, []);

  // ---------- Admin mutations ----------
  const invalidate = useCallback(
    (key: string) => queryClient.invalidateQueries({ queryKey: [key] }),
    [queryClient],
  );

  const saveProduct = useCallback(async (p: Product) => { await api.upsertProduct(p); await invalidate("products"); }, [invalidate]);
  const deleteProduct = useCallback(async (id: string) => { await api.deleteProduct(id); await invalidate("products"); }, [invalidate]);
  const reorderProducts = useCallback(async (ids: string[]) => { await api.reorderProducts(ids); await invalidate("products"); }, [invalidate]);
  const saveCategory = useCallback(async (c: Category) => { await api.upsertCategory(c); await invalidate("categories"); }, [invalidate]);
  const deleteCategory = useCallback(async (id: string) => { await api.deleteCategory(id); await invalidate("categories"); await invalidate("products"); }, [invalidate]);
  const reorderCategories = useCallback(async (ids: string[]) => { await api.reorderCategories(ids); await invalidate("categories"); }, [invalidate]);
  const saveCoupon = useCallback(async (c: Coupon) => { await api.upsertCoupon(c); await invalidate("coupons"); }, [invalidate]);
  const deleteCoupon = useCallback(async (id: string) => { await api.deleteCoupon(id); await invalidate("coupons"); }, [invalidate]);
  const saveBanner = useCallback(async (b: Banner) => { await api.upsertBanner(b); await invalidate("banners"); }, [invalidate]);
  const deleteBanner = useCallback(async (id: string) => { await api.deleteBanner(id); await invalidate("banners"); }, [invalidate]);
  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    await api.updateOrderStatus(id, status);
    await invalidate("orders");
    await invalidate("customers");
  }, [invalidate]);
  const updatePaymentStatus = useCallback(async (id: string, paymentStatus: PaymentStatus) => {
    await api.updatePaymentStatus(id, paymentStatus);
    await invalidate("orders");
  }, [invalidate]);
  const deleteOrder = useCallback(async (id: string) => {
    await api.deleteOrder(id);
    await invalidate("orders");
    await invalidate("customers");
  }, [invalidate]);

  // ---------- Coupons / Orders (public server fns) ----------
  const validateCoupon = useCallback(
    (code: string, subtotal: number) => validateCouponFn({ data: { code, subtotal } }),
    [],
  );

  const placeOrder = useCallback(
    async (input: PlaceOrderInput) => {
      const order = await placeOrderFn({ data: input });
      setLocal((prev) => ({ ...prev, cart: [], lastOrder: order }));
      await Promise.all([invalidate("products"), invalidate("orders"), invalidate("customers")]);
      return order;
    },
    [invalidate],
  );

  const trackOrder = useCallback(
    (number: string, phone: string) => trackOrderFn({ data: { number, phone } }),
    [],
  );

  // ---------- Customer auth ----------
  const signUp = useCallback(
    async (input: { email: string; password: string; fullName: string; phone: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          data: { full_name: input.fullName.trim(), phone: input.phone.trim() },
        },
      });
      if (error) return { ok: false, needsConfirm: false, message: error.message };
      if (!data.session) {
        return { ok: true, needsConfirm: true, message: "Check your email to confirm your account." };
      }
      queryClient.invalidateQueries();
      return { ok: true, needsConfirm: false, message: "Welcome!" };
    },
    [queryClient],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { ok: false, message: error.message };
      queryClient.invalidateQueries();
      return { ok: true, message: "Signed in" };
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    await supabase.auth.signOut();
    setAdmin(false);
    queryClient.removeQueries({ queryKey: ["my-orders"] });
    queryClient.removeQueries({ queryKey: ["profile"] });
  }, [queryClient]);

  // ---------- Admin auth ----------
  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) return false;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        setAdmin(false);
        return false;
      }
      setAdmin(true);
      queryClient.invalidateQueries();
      return true;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await queryClient.cancelQueries();
    await supabase.auth.signOut();
    setAdmin(false);
    queryClient.removeQueries({ queryKey: ["orders"] });
    queryClient.removeQueries({ queryKey: ["customers"] });
    queryClient.removeQueries({ queryKey: ["coupons"] });
  }, [queryClient]);

  const loading = productsQ.isLoading || categoriesQ.isLoading || settingsQ.isLoading;
  const hydrated = authChecked && localHydrated && !settingsQ.isLoading && !productsQ.isLoading;

  const value: StoreContextValue = {
    hydrated,
    loading,
    products,
    categories,
    orders,
    coupons,
    banners,
    settings,
    customers,
    cart: local.cart,
    wishlist: local.wishlist,
    recentlyViewed: local.recentlyViewed,
    lastOrder: local.lastOrder,
    admin,
    user,
    signUp,
    signIn,
    signOut,
    addToCart,
    removeFromCart,
    setCartQty,
    clearCart,
    cartCount,
    toggleWishlist,
    inWishlist: (id) => local.wishlist.includes(id),
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
    trackOrder,
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
