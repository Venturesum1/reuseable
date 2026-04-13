
CREATE POLICY "Anyone can read orders"
ON public.orders FOR SELECT
TO public
USING (true);
