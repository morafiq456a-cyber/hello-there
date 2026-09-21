CREATE TYPE public.payment_method AS ENUM ('cod','card','wallet','bank');
CREATE TYPE public.payment_status AS ENUM ('unpaid','pending','paid','failed','refunded');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  governorate text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.raw_user_meta_data->>'phone',''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.orders
  ADD COLUMN user_id uuid,
  ADD COLUMN payment_method public.payment_method NOT NULL DEFAULT 'cod',
  ADD COLUMN payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  ADD COLUMN payment_reference text;

CREATE INDEX idx_orders_user_id ON public.orders (user_id);

GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;

CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Customers view own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));

ALTER TABLE public.settings
  ADD COLUMN pay_cod_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN pay_card_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN pay_wallet_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN pay_bank_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN wallet_numbers text NOT NULL DEFAULT '',
  ADD COLUMN bank_details text NOT NULL DEFAULT '';