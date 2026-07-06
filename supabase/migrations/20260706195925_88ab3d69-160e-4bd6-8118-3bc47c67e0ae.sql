-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');
CREATE TYPE public.coupon_type AS ENUM ('percent', 'fixed');
CREATE TYPE public.order_status AS ENUM ('New', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled');

-- ========== SHARED updated_at TRIGGER FN ==========
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ========== USER ROLES ==========
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========== CATEGORIES ==========
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Package',
  hidden boolean NOT NULL DEFAULT false,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view visible categories" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (hidden = false OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_categories_sort ON public.categories (sort);
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== PRODUCTS ==========
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  old_price numeric(12,2) CHECK (old_price IS NULL OR old_price >= 0),
  images text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku text NOT NULL DEFAULT '',
  barcode text,
  weight numeric(10,2),
  dimensions text,
  featured boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  best_seller boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false,
  rating numeric(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view visible products" ON public.products
  FOR SELECT TO anon, authenticated
  USING (hidden = false OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_products_category ON public.products (category_id);
CREATE INDEX idx_products_sort ON public.products (sort);
CREATE INDEX idx_products_flags ON public.products (featured, is_new, best_seller) WHERE hidden = false;
CREATE INDEX idx_products_created ON public.products (created_at DESC);
CREATE INDEX idx_products_search ON public.products USING gin (to_tsvector('simple', name || ' ' || description));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== COUPONS ==========
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type public.coupon_type NOT NULL DEFAULT 'percent',
  value numeric(12,2) NOT NULL DEFAULT 0 CHECK (value >= 0),
  min_order numeric(12,2) CHECK (min_order IS NULL OR min_order >= 0),
  active boolean NOT NULL DEFAULT true,
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit >= 0),
  used_count integer NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_coupons_updated BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== BANNERS ==========
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  cta text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '/',
  active boolean NOT NULL DEFAULT true,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active banners" ON public.banners
  FOR SELECT TO anon, authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage banners" ON public.banners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_banners_sort ON public.banners (sort);
CREATE TRIGGER trg_banners_updated BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== ORDERS ==========
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text NOT NULL,
  governorate text NOT NULL,
  city text NOT NULL DEFAULT '',
  address text NOT NULL,
  landmark text,
  notes text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  shipping numeric(12,2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  discount numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  coupon_code text,
  total numeric(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  status public.order_status NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_orders_created ON public.orders (created_at DESC);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_phone ON public.orders (phone);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== ORDER ITEMS ==========
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name text NOT NULL,
  image text NOT NULL DEFAULT '',
  price numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0)
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view order items" ON public.order_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_order_items_order ON public.order_items (order_id);
CREATE INDEX idx_order_items_product ON public.order_items (product_id);

-- ========== CUSTOMERS (auto-maintained) ==========
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  governorate text NOT NULL DEFAULT '',
  orders_count integer NOT NULL DEFAULT 0,
  total_spent numeric(12,2) NOT NULL DEFAULT 0,
  last_order_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.sync_customer()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p text := COALESCE(NEW.phone, OLD.phone);
  agg RECORD;
BEGIN
  IF p IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  SELECT
    COUNT(*) AS cnt,
    COALESCE(SUM(CASE WHEN status <> 'Cancelled' THEN total ELSE 0 END), 0) AS spent,
    MAX(created_at) AS last_at,
    (ARRAY_AGG(full_name ORDER BY created_at DESC))[1] AS fname,
    (ARRAY_AGG(governorate ORDER BY created_at DESC))[1] AS gov
  INTO agg
  FROM public.orders WHERE phone = p;

  IF agg.cnt = 0 THEN
    DELETE FROM public.customers WHERE phone = p;
  ELSE
    INSERT INTO public.customers (phone, full_name, governorate, orders_count, total_spent, last_order_at)
    VALUES (p, agg.fname, agg.gov, agg.cnt, agg.spent, agg.last_at)
    ON CONFLICT (phone) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      governorate = EXCLUDED.governorate,
      orders_count = EXCLUDED.orders_count,
      total_spent = EXCLUDED.total_spent,
      last_order_at = EXCLUDED.last_order_at,
      updated_at = now();
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_orders_sync_customer
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.sync_customer();

-- ========== SETTINGS (single row) ==========
CREATE TABLE public.settings (
  id text PRIMARY KEY DEFAULT 'default',
  store_name text NOT NULL DEFAULT 'Nova Store',
  logo text NOT NULL DEFAULT '',
  banner text NOT NULL DEFAULT '',
  favicon text NOT NULL DEFAULT '/favicon.ico',
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  google_map text NOT NULL DEFAULT '',
  business_hours text NOT NULL DEFAULT '',
  facebook text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  tiktok text NOT NULL DEFAULT '',
  primary_color text NOT NULL DEFAULT '#6d28d9',
  secondary_color text NOT NULL DEFAULT '#0ea5e9',
  button_color text NOT NULL DEFAULT '#6d28d9',
  text_color text NOT NULL DEFAULT '#0f172a',
  background_color text NOT NULL DEFAULT '#ffffff',
  font text NOT NULL DEFAULT 'Inter',
  dark_mode boolean NOT NULL DEFAULT false,
  free_shipping_threshold numeric(12,2) NOT NULL DEFAULT 1500,
  shipping_fee numeric(12,2) NOT NULL DEFAULT 60,
  currency text NOT NULL DEFAULT 'EGP',
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT settings_single_row CHECK (id = 'default')
);
GRANT SELECT ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.settings (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- ========== TRACK ORDER (secure, no public order exposure) ==========
CREATE OR REPLACE FUNCTION public.track_order(_number text, _phone text)
RETURNS TABLE (
  number text, status public.order_status, created_at timestamptz,
  full_name text, governorate text, city text,
  subtotal numeric, shipping numeric, discount numeric, total numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.number, o.status, o.created_at, o.full_name, o.governorate, o.city,
         o.subtotal, o.shipping, o.discount, o.total
  FROM public.orders o
  WHERE lower(o.number) = lower(trim(_number))
    AND regexp_replace(o.phone, '\D', '', 'g') = regexp_replace(_phone, '\D', '', 'g')
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;

-- ========== ATOMIC STOCK DECREMENT (used by order placement) ==========
CREATE OR REPLACE FUNCTION public.decrement_stock(_product_id uuid, _qty integer)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.products SET stock = GREATEST(0, stock - _qty) WHERE id = _product_id;
$$;