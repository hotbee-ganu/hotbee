-- ==========================================================================
-- HOTBEE Commerce Platform - COMPLETE DATABASE SETUP
--
-- Run this ONCE in the Supabase SQL Editor:
--   Supabase dashboard -> SQL Editor -> New query -> paste -> Run
--
-- It creates every table, index, policy and the storage bucket the app needs.
-- Safe to run more than once.
-- ==========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------------
-- 1. CATEGORIES
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    item_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- --------------------------------------------------------------------------
-- 2. PRODUCTS
-- id is TEXT because the admin panel generates ids like hb-1756...
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    qikink_id VARCHAR(120),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    collection VARCHAR(100) DEFAULT 'General Drop',
    images TEXT[] NOT NULL DEFAULT '{}',
    colors JSONB NOT NULL DEFAULT '[]'::jsonb,
    sizes TEXT[] NOT NULL DEFAULT '{}',
    in_stock BOOLEAN DEFAULT true,
    is_trending BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT true,
    material TEXT,
    print_type TEXT,
    shipping_info TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- If products already existed with a UUID id, widen it to TEXT.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.products ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;
END $$;

-- --------------------------------------------------------------------------
-- 3. COUPONS
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- --------------------------------------------------------------------------
-- 4. ORDERS
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY,
    tracking_number VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address JSONB NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    razorpay_payment_id VARCHAR(100),
    qikink_order_id VARCHAR(100),
    qikink_sync_message TEXT,
    qikink_synced_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'placed',
    estimated_delivery VARCHAR(100),
    courier_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Add the newer columns if orders was created by an older schema.sql.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS qikink_sync_message TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS qikink_synced_at TIMESTAMPTZ;

-- --------------------------------------------------------------------------
-- 5. REVIEWS
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- --------------------------------------------------------------------------
-- 6. DESIGNS - the artwork uploaded in Admin > Designs
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    qikink_sku VARCHAR(120),
    published_product_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- --------------------------------------------------------------------------
-- 7. INDEXES
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS products_category_idx   ON public.products (category);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_created_at_idx   ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS designs_created_at_idx  ON public.designs (created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_product_idx     ON public.reviews (product_id);

-- --------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
-- Admin writes go through our API routes using the service-role key, which
-- bypasses RLS. Anonymous visitors get read-only access to the storefront.
-- --------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read categories" ON public.categories;
CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read products" ON public.products;
CREATE POLICY "public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read coupons" ON public.coupons;
CREATE POLICY "public read coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read reviews" ON public.reviews;
CREATE POLICY "public read reviews" ON public.reviews FOR SELECT USING (true);

-- Orders and designs deliberately have NO anonymous policy: customer
-- addresses and phone numbers must not be publicly readable. Order lookups
-- for /track-order run server-side with the service-role key.

-- --------------------------------------------------------------------------
-- 9. STORAGE BUCKET for design artwork (public read, service-role write)
-- --------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotbee-designs', 'hotbee-designs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public read hotbee designs" ON storage.objects;
CREATE POLICY "public read hotbee designs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hotbee-designs');

-- --------------------------------------------------------------------------
-- 10. STARTER COUPONS
-- --------------------------------------------------------------------------
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, active, description)
VALUES
  ('WELCOME200', 'fixed',      200, 999,  true, 'Flat Rs 200 off your first order'),
  ('HOTBEE10',   'percentage',  10, 1499, true, '10% off orders above Rs 1499'),
  ('GOLDVIP',    'percentage',  15, 2999, true, 'VIP 15% off orders above Rs 2999')
ON CONFLICT (code) DO NOTHING;

-- Done. Reload the admin panel - Designs and Products are now live.
