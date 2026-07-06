-- Trigger helper functions never need to be directly callable
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_customer() FROM PUBLIC, anon, authenticated;

-- Stock decrement is only invoked by trusted server-side (service role) code
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) TO service_role;