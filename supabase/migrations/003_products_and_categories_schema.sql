-- Products and Categories Database Schema
-- Version: 1.0
-- Date: August 12, 2025
-- Purpose: Replace hardcoded dummy data with database-driven content

-- =====================================================
-- 1. CATEGORIES TABLE
-- =====================================================

CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- =====================================================
-- 2. PRODUCTS TABLE
-- =====================================================

CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    hs_code VARCHAR(20),
    popularity INTEGER DEFAULT 0 CHECK (popularity >= 0 AND popularity <= 100),
    is_trending BOOLEAN DEFAULT false,
    documents_required INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique slug per category
    UNIQUE(category_id, slug)
);

-- Add indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_trending ON products(is_trending);
CREATE INDEX idx_products_popularity ON products(popularity DESC);

-- =====================================================
-- 3. PRODUCT REGIONS TABLE (Many-to-Many)
-- =====================================================

CREATE TABLE product_regions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    region_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate regions per product
    UNIQUE(product_id, region_name)
);

-- Add indexes
CREATE INDEX idx_product_regions_product ON product_regions(product_id);
CREATE INDEX idx_product_regions_region ON product_regions(region_name);

-- =====================================================
-- 4. DOCUMENT REQUIREMENTS TABLE
-- =====================================================

CREATE TABLE document_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    document_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT true,
    can_auto_fill BOOLEAN DEFAULT false,
    estimated_time VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_document_requirements_product ON document_requirements(product_id);
CREATE INDEX idx_document_requirements_required ON document_requirements(is_required);

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Categories trigger
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Products trigger
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requirements ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to product_regions" ON product_regions
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to document_requirements" ON document_requirements
    FOR SELECT USING (true);

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to get products with all related data
CREATE OR REPLACE FUNCTION get_products_by_category(category_slug VARCHAR)
RETURNS TABLE (
    id UUID,
    slug VARCHAR,
    name VARCHAR,
    description TEXT,
    hs_code VARCHAR,
    popularity INTEGER,
    is_trending BOOLEAN,
    documents_required INTEGER,
    thumbnail_url TEXT,
    regions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.slug,
        p.name,
        p.description,
        p.hs_code,
        p.popularity,
        p.is_trending,
        p.documents_required,
        p.thumbnail_url,
        ARRAY_AGG(pr.region_name ORDER BY pr.region_name) as regions
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_regions pr ON p.id = pr.product_id
    WHERE c.slug = category_slug AND p.is_active = true
    GROUP BY p.id, p.slug, p.name, p.description, p.hs_code, p.popularity, p.is_trending, p.documents_required, p.thumbnail_url
    ORDER BY p.sort_order, p.popularity DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get product details with documents
CREATE OR REPLACE FUNCTION get_product_details(category_slug VARCHAR, product_slug VARCHAR)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    hs_code VARCHAR,
    category_name VARCHAR,
    regions TEXT[],
    documents JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.hs_code,
        c.name as category_name,
        ARRAY_AGG(DISTINCT pr.region_name ORDER BY pr.region_name) as regions,
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'id', dr.id,
                'name', dr.document_name,
                'description', dr.description,
                'isRequired', dr.is_required,
                'canAutoFill', dr.can_auto_fill,
                'estimatedTime', dr.estimated_time
            ) ORDER BY dr.sort_order, dr.document_name
        ) as documents
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_regions pr ON p.id = pr.product_id
    LEFT JOIN document_requirements dr ON p.id = dr.product_id
    WHERE c.slug = category_slug AND p.slug = product_slug AND p.is_active = true
    GROUP BY p.id, p.name, p.description, p.hs_code, c.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get all categories
CREATE OR REPLACE FUNCTION get_categories()
RETURNS TABLE (
    id UUID,
    slug VARCHAR,
    name VARCHAR,
    description TEXT,
    icon_name VARCHAR,
    image_url TEXT,
    product_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.slug,
        c.name,
        c.description,
        c.icon_name,
        c.image_url,
        COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
    WHERE c.is_active = true
    GROUP BY c.id, c.slug, c.name, c.description, c.icon_name, c.image_url
    ORDER BY c.sort_order, c.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. INSERT DUMMY DATA
-- =====================================================

-- Insert Categories
INSERT INTO categories (slug, name, description, icon_name, sort_order) VALUES
('agriculture', 'Agriculture', 'Fresh produce, grains, and agricultural products for global export', 'Wheat', 1),
('electronics', 'Electronics', 'Electronic components, devices, and technology products', 'Cpu', 2),
('textiles', 'Textiles', 'Fabrics, garments, and textile products', 'Shirt', 3),
('pharmaceuticals', 'Pharmaceuticals', 'Medical products, drugs, and healthcare items', 'Pill', 4),
('chemicals', 'Chemicals', 'Industrial chemicals, specialty chemicals, and raw materials', 'Flask', 5),
('handicrafts', 'Handicrafts', 'Traditional crafts, artisan products, and cultural items', 'Palette', 6),
('autoparts', 'Auto Parts', 'Automotive components, spare parts, and accessories', 'Car', 7),
('organic', 'Organic Products', 'Certified organic and eco-friendly products', 'Leaf', 8);

-- Insert Products for Agriculture
INSERT INTO products (category_id, slug, name, description, hs_code, popularity, is_trending, documents_required, sort_order)
SELECT 
    c.id,
    'fresh-mangoes',
    'Fresh Mangoes',
    'Premium Alphonso and Kesar varieties for international export',
    '0804.50.00',
    95,
    true,
    8,
    1
FROM categories c WHERE c.slug = 'agriculture';

INSERT INTO products (category_id, slug, name, description, hs_code, popularity, is_trending, documents_required, sort_order)
SELECT 
    c.id,
    'basmati-rice',
    'Basmati Rice',
    'Aromatic long-grain rice, premium quality grades',
    '1006.30.00',
    92,
    false,
    6,
    2
FROM categories c WHERE c.slug = 'agriculture';

INSERT INTO products (category_id, slug, name, description, hs_code, popularity, is_trending, documents_required, sort_order)
SELECT 
    c.id,
    'organic-spices',
    'Organic Spices',
    'Certified organic turmeric, cardamom, black pepper',
    '0904.11.00',
    88,
    true,
    10,
    3
FROM categories c WHERE c.slug = 'agriculture';

INSERT INTO products (category_id, slug, name, description, hs_code, popularity, is_trending, documents_required, sort_order)
SELECT 
    c.id,
    'fresh-bananas',
    'Fresh Bananas',
    'Cavendish variety, optimal ripeness for export',
    '0803.90.00',
    75,
    false,
    7,
    4
FROM categories c WHERE c.slug = 'agriculture';

-- Insert Products for Electronics
INSERT INTO products (category_id, slug, name, description, hs_code, popularity, is_trending, documents_required, sort_order)
SELECT 
    c.id,
    'electronic-resistors',
    'Electronic Resistors',
    'Precision resistors for electronic circuits',
    '8533.21.00',
    89,
    true,
    5,
    1
FROM categories c WHERE c.slug = 'electronics';

INSERT INTO products (category_id, slug, name, description, hs_code, popularity, is_trending, documents_required, sort_order)
SELECT 
    c.id,
    'capacitors',
    'Capacitors',
    'Electrolytic and ceramic capacitors for various applications',
    '8532.24.00',
    86,
    false,
    5,
    2
FROM categories c WHERE c.slug = 'electronics';

INSERT INTO products (category_id, slug, name, description, hs_code, popularity, is_trending, documents_required, sort_order)
SELECT 
    c.id,
    'led-displays',
    'LED Displays',
    'High-resolution LED display panels and modules',
    '8531.20.00',
    82,
    true,
    6,
    3
FROM categories c WHERE c.slug = 'electronics';

-- Insert Products for Textiles
INSERT INTO products (category_id, slug, name, description, hs_code, popularity, is_trending, documents_required, sort_order)
SELECT 
    c.id,
    'cotton-fabric',
    'Cotton Fabric',
    'Premium quality cotton fabric for garment manufacturing',
    '5208.11.00',
    78,
    false,
    4,
    1
FROM categories c WHERE c.slug = 'textiles';

INSERT INTO products (category_id, slug, name, description, hs_code, popularity, is_trending, documents_required, sort_order)
SELECT 
    c.id,
    'silk-sarees',
    'Silk Sarees',
    'Traditional handwoven silk sarees with intricate designs',
    '6204.41.00',
    85,
    true,
    7,
    2
FROM categories c WHERE c.slug = 'textiles';

-- Insert Product Regions
INSERT INTO product_regions (product_id, region_name)
SELECT p.id, region FROM products p, unnest(ARRAY['UAE', 'USA', 'EU']) AS region
WHERE p.slug = 'fresh-mangoes';

INSERT INTO product_regions (product_id, region_name)
SELECT p.id, region FROM products p, unnest(ARRAY['Middle East', 'Europe', 'USA']) AS region
WHERE p.slug = 'basmati-rice';

INSERT INTO product_regions (product_id, region_name)
SELECT p.id, region FROM products p, unnest(ARRAY['USA', 'EU', 'Japan']) AS region
WHERE p.slug = 'organic-spices';

INSERT INTO product_regions (product_id, region_name)
SELECT p.id, region FROM products p, unnest(ARRAY['Middle East', 'Russia']) AS region
WHERE p.slug = 'fresh-bananas';

INSERT INTO product_regions (product_id, region_name)
SELECT p.id, region FROM products p, unnest(ARRAY['USA', 'Germany', 'China']) AS region
WHERE p.slug = 'electronic-resistors';

INSERT INTO product_regions (product_id, region_name)
SELECT p.id, region FROM products p, unnest(ARRAY['Japan', 'South Korea', 'USA']) AS region
WHERE p.slug = 'capacitors';

INSERT INTO product_regions (product_id, region_name)
SELECT p.id, region FROM products p, unnest(ARRAY['USA', 'EU', 'Asia']) AS region
WHERE p.slug = 'led-displays';

INSERT INTO product_regions (product_id, region_name)
SELECT p.id, region FROM products p, unnest(ARRAY['USA', 'EU', 'Bangladesh']) AS region
WHERE p.slug = 'cotton-fabric';

INSERT INTO product_regions (product_id, region_name)
SELECT p.id, region FROM products p, unnest(ARRAY['USA', 'EU', 'Japan', 'Australia']) AS region
WHERE p.slug = 'silk-sarees';

-- Insert Document Requirements for Fresh Mangoes
INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Phytosanitary Certificate', 'Certificate ensuring mangoes are free from pests and diseases', true, false, '5-7 days', 1
FROM products p WHERE p.slug = 'fresh-mangoes';

INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Commercial Invoice', 'Detailed invoice with product specifications and pricing', true, true, 'Instant', 2
FROM products p WHERE p.slug = 'fresh-mangoes';

INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Packing List', 'Detailed list of packages, weights, and dimensions', true, true, 'Instant', 3
FROM products p WHERE p.slug = 'fresh-mangoes';

INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Certificate of Origin', 'Document certifying the country of origin', true, true, 'Instant', 4
FROM products p WHERE p.slug = 'fresh-mangoes';

INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Export License', 'Government permit for exporting mangoes', true, false, '3-5 days', 5
FROM products p WHERE p.slug = 'fresh-mangoes';

INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Fumigation Certificate', 'Certificate of fumigation treatment if required', false, false, '1-2 days', 6
FROM products p WHERE p.slug = 'fresh-mangoes';

-- Insert Document Requirements for Electronic Resistors
INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Commercial Invoice', 'Detailed invoice with product specifications', true, true, 'Instant', 1
FROM products p WHERE p.slug = 'electronic-resistors';

INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Packing List', 'List of electronic components and quantities', true, true, 'Instant', 2
FROM products p WHERE p.slug = 'electronic-resistors';

INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Certificate of Origin', 'Document certifying manufacturing origin', true, true, 'Instant', 3
FROM products p WHERE p.slug = 'electronic-resistors';

INSERT INTO document_requirements (product_id, document_name, description, is_required, can_auto_fill, estimated_time, sort_order)
SELECT p.id, 'Technical Specifications', 'Detailed technical specs and compliance certificates', true, false, '2-3 days', 4
FROM products p WHERE p.slug = 'electronic-resistors';

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Verify data insertion
DO $$
DECLARE
    category_count INTEGER;
    product_count INTEGER;
    region_count INTEGER;
    document_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO product_regions FROM product_regions;
    SELECT COUNT(*) INTO document_count FROM document_requirements;
    
    RAISE NOTICE 'Data insertion completed:';
    RAISE NOTICE '- Categories: %', category_count;
    RAISE NOTICE '- Products: %', product_count;
    RAISE NOTICE '- Product Regions: %', region_count;
    RAISE NOTICE '- Document Requirements: %', document_count;
END $$;

-- Test the helper functions
SELECT 'Testing get_categories function:' as test;
SELECT * FROM get_categories() LIMIT 3;

SELECT 'Testing get_products_by_category function:' as test;
SELECT * FROM get_products_by_category('agriculture') LIMIT 3;

RAISE NOTICE 'Database schema and dummy data setup completed successfully!';