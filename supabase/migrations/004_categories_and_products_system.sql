-- Categories System & Database Setup
-- Version: 1.0
-- Date: August 12, 2025
-- Purpose: Create proper categories and products system

-- =====================================================
-- 1. CATEGORIES TABLE
-- =====================================================

CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
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
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);

-- =====================================================
-- 3. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read access for active items
CREATE POLICY "Allow public read access to active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active products" ON products
    FOR SELECT USING (is_active = true);

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to get all active categories with product counts
CREATE OR REPLACE FUNCTION get_categories_with_counts()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    description TEXT,
    icon_url TEXT,
    image_url TEXT,
    sort_order INTEGER,
    product_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.icon_url,
        c.image_url,
        c.sort_order,
        COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
    WHERE c.is_active = true
    GROUP BY c.id, c.name, c.slug, c.description, c.icon_url, c.image_url, c.sort_order
    ORDER BY c.sort_order, c.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get products by category slug
CREATE OR REPLACE FUNCTION get_products_by_category_slug(category_slug VARCHAR)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    description TEXT,
    short_description TEXT,
    price DECIMAL,
    image_url TEXT,
    sort_order INTEGER,
    category_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.price,
        p.image_url,
        p.sort_order,
        c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = category_slug 
    AND p.is_active = true 
    AND c.is_active = true
    ORDER BY p.sort_order, p.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get category by slug
CREATE OR REPLACE FUNCTION get_category_by_slug(category_slug VARCHAR)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    description TEXT,
    icon_url TEXT,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.icon_url,
        c.image_url
    FROM categories c
    WHERE c.slug = category_slug AND c.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. INSERT ORIGINAL CATEGORIES (FROM HEADER)
-- =====================================================

-- Insert the original categories that were in the header navigation
INSERT INTO categories (name, slug, description, icon_url, image_url, is_active, sort_order) VALUES
('Agriculture', 'agriculture', 'Agricultural products, farming equipment, seeds, fertilizers, and organic produce for export', '/src/assets/agriculture.jpg', '/src/assets/agriculture.jpg', true, 1),
('Electronics', 'electronics', 'Electronic devices, components, consumer electronics, and technology products', '/src/assets/electronics.jpg', '/src/assets/electronics.jpg', true, 2),
('Textiles', 'textiles', 'Textile products, fabrics, garments, home textiles, and fashion accessories', '/src/assets/textiles.jpg', '/src/assets/textiles.jpg', true, 3),
('Pharmaceuticals', 'pharmaceuticals', 'Pharmaceutical products, medicines, healthcare supplies, and medical equipment', '/src/assets/pharmaceuticals.jpg', '/src/assets/pharmaceuticals.jpg', true, 4),
('Chemicals', 'chemicals', 'Industrial chemicals, specialty chemicals, petrochemicals, and chemical compounds', '/src/assets/chemicals.jpg', '/src/assets/chemicals.jpg', true, 5),
('Auto Parts', 'autoparts', 'Automotive parts, components, accessories, and vehicle maintenance products', '/src/assets/autoparts.jpg', '/src/assets/autoparts.jpg', true, 6),
('Handicrafts', 'handicrafts', 'Traditional handicrafts, artisan products, decorative items, and cultural artifacts', '/src/assets/handicrafts.jpg', '/src/assets/handicrafts.jpg', true, 7),
('Organic Products', 'organic', 'Organic food products, natural cosmetics, eco-friendly items, and sustainable goods', '/src/assets/organic.jpg', '/src/assets/organic.jpg', true, 8);

-- =====================================================
-- 7. INSERT SAMPLE PRODUCTS FOR ORIGINAL CATEGORIES
-- =====================================================

-- Add comprehensive sample products for each original category
INSERT INTO products (category_id, name, slug, description, short_description, price, is_active, sort_order) VALUES

-- Agriculture Category Products
((SELECT id FROM categories WHERE slug = 'agriculture'), 'Organic Basmati Rice', 'organic-basmati-rice', 'Premium quality organic basmati rice grown without pesticides or chemicals. Long grain, aromatic, and perfect for export. Certified organic and sustainably farmed.', 'Premium organic basmati rice for export', 45.99, true, 1),
((SELECT id FROM categories WHERE slug = 'agriculture'), 'Fresh Turmeric Powder', 'fresh-turmeric-powder', 'High-quality turmeric powder with high curcumin content. Sourced directly from farms, processed hygienically, and packed for international markets.', 'High-curcumin turmeric powder', 12.99, true, 2),
((SELECT id FROM categories WHERE slug = 'agriculture'), 'Premium Tea Leaves', 'premium-tea-leaves', 'Hand-picked premium tea leaves from high-altitude gardens. Available in black, green, and white varieties. Perfect for international tea markets.', 'Hand-picked premium tea leaves', 28.99, true, 3),
((SELECT id FROM categories WHERE slug = 'agriculture'), 'Cashew Nuts Grade A', 'cashew-nuts-grade-a', 'Grade A cashew nuts, carefully processed and sorted. Rich in nutrients, perfect for snacking and culinary use. Export quality with international certifications.', 'Grade A export quality cashew nuts', 89.99, true, 4),
((SELECT id FROM categories WHERE slug = 'agriculture'), 'Coconut Oil Virgin', 'coconut-oil-virgin', 'Cold-pressed virgin coconut oil with natural aroma and taste. Rich in MCTs, perfect for cooking and cosmetic applications. Export grade quality.', 'Cold-pressed virgin coconut oil', 24.99, true, 5),

-- Electronics Category Products
((SELECT id FROM categories WHERE slug = 'electronics'), 'LED Display Modules', 'led-display-modules', 'High-resolution LED display modules for digital signage and advertising. Energy-efficient, long-lasting, and suitable for indoor/outdoor applications.', 'High-resolution LED display modules', 299.99, true, 1),
((SELECT id FROM categories WHERE slug = 'electronics'), 'PCB Circuit Boards', 'pcb-circuit-boards', 'Custom PCB circuit boards manufactured to international standards. Multi-layer options available, perfect for electronic device manufacturers.', 'Custom PCB circuit boards', 15.99, true, 2),
((SELECT id FROM categories WHERE slug = 'electronics'), 'Power Adapters Universal', 'power-adapters-universal', 'Universal power adapters with multiple voltage options. CE, FCC certified, suitable for various electronic devices and international markets.', 'Universal power adapters certified', 19.99, true, 3),
((SELECT id FROM categories WHERE slug = 'electronics'), 'Bluetooth Speakers Portable', 'bluetooth-speakers-portable', 'High-quality portable Bluetooth speakers with excellent sound quality. Waterproof design, long battery life, perfect for consumer markets.', 'Portable waterproof Bluetooth speakers', 79.99, true, 4),
((SELECT id FROM categories WHERE slug = 'electronics'), 'USB Cables Premium', 'usb-cables-premium', 'Premium USB cables with fast charging and data transfer capabilities. Durable construction, multiple connector types available for bulk orders.', 'Premium fast-charging USB cables', 8.99, true, 5),

-- Textiles Category Products
((SELECT id FROM categories WHERE slug = 'textiles'), 'Cotton Bed Sheets Set', 'cotton-bed-sheets-set', '100% pure cotton bed sheet sets with high thread count. Soft, breathable, and durable. Available in various sizes and colors for international markets.', '100% pure cotton bed sheet sets', 49.99, true, 1),
((SELECT id FROM categories WHERE slug = 'textiles'), 'Silk Scarves Handwoven', 'silk-scarves-handwoven', 'Handwoven silk scarves with traditional patterns and modern designs. Premium quality silk, perfect for fashion accessories and gift markets.', 'Handwoven silk scarves premium quality', 89.99, true, 2),
((SELECT id FROM categories WHERE slug = 'textiles'), 'Denim Fabric Premium', 'denim-fabric-premium', 'Premium denim fabric in various weights and washes. High-quality cotton blend, perfect for garment manufacturers and fashion brands.', 'Premium denim fabric for garments', 12.99, true, 3),
((SELECT id FROM categories WHERE slug = 'textiles'), 'Embroidered Table Runners', 'embroidered-table-runners', 'Beautiful embroidered table runners with traditional motifs. Hand-crafted by skilled artisans, perfect for home décor and hospitality markets.', 'Hand-embroidered table runners', 34.99, true, 4),
((SELECT id FROM categories WHERE slug = 'textiles'), 'Organic Cotton T-Shirts', 'organic-cotton-t-shirts', 'Organic cotton t-shirts in various sizes and colors. Soft, comfortable, and eco-friendly. Perfect for private label and retail markets.', 'Organic cotton t-shirts eco-friendly', 15.99, true, 5),

-- Pharmaceuticals Category Products
((SELECT id FROM categories WHERE slug = 'pharmaceuticals'), 'Ayurvedic Herbal Capsules', 'ayurvedic-herbal-capsules', 'Traditional Ayurvedic herbal capsules made from pure herbs. GMP certified, tested for quality and purity. Perfect for natural health markets.', 'GMP certified Ayurvedic herbal capsules', 29.99, true, 1),
((SELECT id FROM categories WHERE slug = 'pharmaceuticals'), 'Vitamin D3 Tablets', 'vitamin-d3-tablets', 'High-potency Vitamin D3 tablets manufactured under strict quality controls. WHO-GMP certified facility, suitable for international pharmaceutical markets.', 'High-potency Vitamin D3 tablets', 19.99, true, 2),
((SELECT id FROM categories WHERE slug = 'pharmaceuticals'), 'Antiseptic Hand Sanitizer', 'antiseptic-hand-sanitizer', 'WHO-formula antiseptic hand sanitizer with 70% alcohol content. Bulk packaging available, perfect for healthcare and institutional markets.', 'WHO-formula antiseptic hand sanitizer', 8.99, true, 3),
((SELECT id FROM categories WHERE slug = 'pharmaceuticals'), 'Surgical Face Masks', 'surgical-face-masks', '3-ply surgical face masks with high filtration efficiency. CE marked, FDA approved, suitable for medical and healthcare applications.', '3-ply surgical face masks CE marked', 0.25, true, 4),
((SELECT id FROM categories WHERE slug = 'pharmaceuticals'), 'Paracetamol Tablets', 'paracetamol-tablets', 'High-quality paracetamol tablets manufactured in WHO-GMP certified facility. Various strengths available, perfect for pharmaceutical distributors.', 'WHO-GMP paracetamol tablets', 5.99, true, 5),

-- Chemicals Category Products
((SELECT id FROM categories WHERE slug = 'chemicals'), 'Sodium Bicarbonate Food Grade', 'sodium-bicarbonate-food-grade', 'Food grade sodium bicarbonate with high purity levels. Suitable for food processing, pharmaceutical, and industrial applications. Bulk quantities available.', 'Food grade sodium bicarbonate', 299.99, true, 1),
((SELECT id FROM categories WHERE slug = 'chemicals'), 'Citric Acid Anhydrous', 'citric-acid-anhydrous', 'High purity citric acid anhydrous for food, pharmaceutical, and industrial use. Kosher and Halal certified, perfect for international markets.', 'High purity citric acid anhydrous', 189.99, true, 2),
((SELECT id FROM categories WHERE slug = 'chemicals'), 'Calcium Carbonate Powder', 'calcium-carbonate-powder', 'Precipitated calcium carbonate powder with various mesh sizes. Suitable for paint, plastic, rubber, and pharmaceutical industries.', 'Precipitated calcium carbonate powder', 149.99, true, 3),
((SELECT id FROM categories WHERE slug = 'chemicals'), 'Titanium Dioxide Rutile', 'titanium-dioxide-rutile', 'High-grade titanium dioxide rutile for paint, coating, and plastic applications. Excellent opacity and brightness, suitable for premium applications.', 'High-grade titanium dioxide rutile', 899.99, true, 4),
((SELECT id FROM categories WHERE slug = 'chemicals'), 'Acetic Acid Glacial', 'acetic-acid-glacial', 'Glacial acetic acid with 99.8% purity. Industrial grade for chemical synthesis, textile processing, and pharmaceutical intermediate applications.', 'Glacial acetic acid 99.8% purity', 199.99, true, 5),

-- Auto Parts Category Products
((SELECT id FROM categories WHERE slug = 'autoparts'), 'Brake Pads Premium', 'brake-pads-premium', 'Premium quality brake pads with excellent stopping power and durability. Suitable for various car models, manufactured to international standards.', 'Premium quality brake pads', 45.99, true, 1),
((SELECT id FROM categories WHERE slug = 'autoparts'), 'Air Filters Engine', 'air-filters-engine', 'High-efficiency engine air filters with superior filtration. Compatible with multiple vehicle models, perfect for aftermarket distribution.', 'High-efficiency engine air filters', 12.99, true, 2),
((SELECT id FROM categories WHERE slug = 'autoparts'), 'Shock Absorbers Heavy Duty', 'shock-absorbers-heavy-duty', 'Heavy-duty shock absorbers for commercial and passenger vehicles. Excellent ride comfort and handling, suitable for various terrains.', 'Heavy-duty shock absorbers', 89.99, true, 3),
((SELECT id FROM categories WHERE slug = 'autoparts'), 'LED Headlight Bulbs', 'led-headlight-bulbs', 'High-brightness LED headlight bulbs with long lifespan. Energy-efficient, easy installation, compatible with most vehicle models.', 'High-brightness LED headlight bulbs', 29.99, true, 4),
((SELECT id FROM categories WHERE slug = 'autoparts'), 'Radiator Cooling System', 'radiator-cooling-system', 'Efficient radiator cooling systems for various vehicle types. Aluminum construction, excellent heat dissipation, OEM quality standards.', 'Efficient radiator cooling systems', 199.99, true, 5),

-- Handicrafts Category Products
((SELECT id FROM categories WHERE slug = 'handicrafts'), 'Wooden Carved Sculptures', 'wooden-carved-sculptures', 'Handcrafted wooden sculptures by skilled artisans. Traditional and contemporary designs, perfect for home décor and gift markets worldwide.', 'Handcrafted wooden sculptures', 149.99, true, 1),
((SELECT id FROM categories WHERE slug = 'handicrafts'), 'Brass Decorative Items', 'brass-decorative-items', 'Traditional brass decorative items including vases, figurines, and ornaments. Hand-polished finish, perfect for interior decoration and collectibles.', 'Traditional brass decorative items', 79.99, true, 2),
((SELECT id FROM categories WHERE slug = 'handicrafts'), 'Handwoven Carpets', 'handwoven-carpets', 'Exquisite handwoven carpets with intricate patterns and vibrant colors. Made from premium wool and silk, perfect for luxury home markets.', 'Exquisite handwoven carpets', 599.99, true, 3),
((SELECT id FROM categories WHERE slug = 'handicrafts'), 'Ceramic Pottery Set', 'ceramic-pottery-set', 'Beautiful ceramic pottery sets including bowls, plates, and decorative pieces. Hand-painted designs, microwave and dishwasher safe.', 'Beautiful ceramic pottery sets', 89.99, true, 4),
((SELECT id FROM categories WHERE slug = 'handicrafts'), 'Bamboo Home Accessories', 'bamboo-home-accessories', 'Eco-friendly bamboo home accessories including storage boxes, serving trays, and decorative items. Sustainable and stylish for modern homes.', 'Eco-friendly bamboo home accessories', 34.99, true, 5),

-- Organic Products Category Products
((SELECT id FROM categories WHERE slug = 'organic'), 'Organic Honey Raw', 'organic-honey-raw', 'Pure raw organic honey harvested from pristine environments. Unprocessed, unfiltered, and rich in natural enzymes. Perfect for health-conscious consumers.', 'Pure raw organic honey unprocessed', 24.99, true, 1),
((SELECT id FROM categories WHERE slug = 'organic'), 'Organic Coconut Oil', 'organic-coconut-oil', 'Cold-pressed organic coconut oil with natural aroma. Virgin quality, perfect for cooking, skincare, and hair care applications.', 'Cold-pressed organic coconut oil', 19.99, true, 2),
((SELECT id FROM categories WHERE slug = 'organic'), 'Organic Spice Mix', 'organic-spice-mix', 'Certified organic spice mixes with authentic flavors. No artificial additives, perfect for gourmet cooking and international food markets.', 'Certified organic spice mixes', 15.99, true, 3),
((SELECT id FROM categories WHERE slug = 'organic'), 'Organic Skincare Set', 'organic-skincare-set', 'Natural organic skincare set with plant-based ingredients. Chemical-free, cruelty-free, perfect for premium beauty and wellness markets.', 'Natural organic skincare set', 89.99, true, 4),
((SELECT id FROM categories WHERE slug = 'organic'), 'Organic Herbal Tea', 'organic-herbal-tea', 'Premium organic herbal tea blends with medicinal properties. Caffeine-free, naturally flavored, perfect for health and wellness markets.', 'Premium organic herbal tea blends', 18.99, true, 5);

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Test the functions
SELECT 'Testing get_categories_with_counts function:' as test;
SELECT * FROM get_categories_with_counts() LIMIT 5;

SELECT 'Testing get_category_by_slug function:' as test;
SELECT * FROM get_category_by_slug('electronics');

SELECT 'Testing get_products_by_category_slug function:' as test;
SELECT * FROM get_products_by_category_slug('electronics');

-- Verify data
SELECT 
    'Categories created: ' || COUNT(*) as status
FROM categories WHERE is_active = true;

SELECT 
    'Products created: ' || COUNT(*) as status  
FROM products WHERE is_active = true;

RAISE NOTICE 'Categories and Products system setup completed successfully!';
RAISE NOTICE 'All categories will show Document Summary feature since no products are inserted by default.';
RAISE NOTICE 'To add products to a category, uncomment the INSERT statements above.';