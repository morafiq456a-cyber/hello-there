DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
REVOKE SELECT ON public.settings FROM anon;
CREATE OR REPLACE VIEW public.storefront_settings AS
SELECT
  store_name,
  logo,
  banner,
  favicon,
  phone,
  whatsapp,
  email,
  address,
  google_map,
  business_hours,
  facebook,
  instagram,
  tiktok,
  primary_color,
  secondary_color,
  button_color,
  text_color,
  background_color,
  font,
  dark_mode,
  free_shipping_threshold,
  shipping_fee,
  currency,
  seo_title,
  seo_description,
  pay_cod_enabled,
  pay_card_enabled,
  pay_wallet_enabled,
  pay_bank_enabled,
  wallet_numbers,
  bank_details
FROM public.settings
WHERE id = 'default';
GRANT SELECT ON public.storefront_settings TO anon, authenticated;