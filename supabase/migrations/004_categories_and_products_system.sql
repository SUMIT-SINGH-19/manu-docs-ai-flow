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
-- 6. INSERT SAMPLE CATEGORIES
-- =====================================================

-- Insert sample categories (these will show Document Summary feature since no products)
INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
('Electronics', 'electronics', 'Electronic devices, gadgets, and technology products', true, 1),
('Books & Education', 'books', 'Educational materials, textbooks, and reference books', true, 2),
('Software & Tools', 'software', 'Software applications, development tools, and digital products', true, 3),
('Health & Wellness', 'health', 'Health products, supplements, and wellness solutions', true, 4),
('Home & Garden', 'home-garden', 'Home improvement, gardening, and household products', true, 5),
('Fashion & Apparel', 'fashion', 'Clothing, accessories, and fashion items', true, 6),
('Sports & Fitness', 'sports', 'Sports equipment, fitness gear, and outdoor activities', true, 7),
('Automotive', 'automotive', 'Car parts, accessories, and automotive products', true, 8);

-- =====================================================
-- 7. INSERT SAMPLE PRODUCTS (CRITICAL FIX)
-- =====================================================

-- Add sample products to prevent empty pages
INSERT INTO products (category_id, name, slug, description, short_description, price, is_active, sort_order) VALUES
-- Electronics Category
((SELECT id FROM categories WHERE slug = 'electronics'), 'Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for music lovers and professionals.', 'Premium wireless headphones with noise cancellation', 199.99, true, 1),
((SELECT id FROM categories WHERE slug = 'electronics'), 'Smart Fitness Watch', 'smart-fitness-watch', 'Advanced fitness tracking watch with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Compatible with iOS and Android.', 'Advanced fitness tracking smartwatch', 299.99, true, 2),
((SELECT id FROM categories WHERE slug = 'electronics'), '4K Webcam for Streaming', '4k-webcam-streaming', 'Professional 4K webcam with auto-focus, built-in microphone, and low-light correction. Ideal for streaming, video calls, and content creation.', 'Professional 4K streaming webcam', 149.99, true, 3),
((SELECT id FROM categories WHERE slug = 'electronics'), 'Portable Power Bank 20000mAh', 'portable-power-bank-20000mah', 'High-capacity power bank with fast charging, multiple USB ports, and LED display. Charges smartphones up to 6 times on a single charge.', 'High-capacity portable power bank', 79.99, true, 4),
((SELECT id FROM categories WHERE slug = 'electronics'), 'Wireless Charging Pad', 'wireless-charging-pad', 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator and overcharge protection.', 'Fast wireless charging pad', 39.99, true, 5),

-- Books & Education Category
((SELECT id FROM categories WHERE slug = 'books'), 'Complete Python Programming Guide', 'complete-python-programming-guide', 'Comprehensive guide to Python programming from basics to advanced topics. Includes practical projects, best practices, and real-world applications.', 'Complete Python programming reference', 59.99, true, 1),
((SELECT id FROM categories WHERE slug = 'books'), 'Digital Marketing Mastery', 'digital-marketing-mastery', 'Master digital marketing strategies including SEO, social media, content marketing, and analytics. Updated with latest trends and tools.', 'Complete digital marketing guide', 49.99, true, 2),
((SELECT id FROM categories WHERE slug = 'books'), 'Data Science Fundamentals', 'data-science-fundamentals', 'Learn data science from scratch with Python, statistics, machine learning, and data visualization. Includes hands-on projects and datasets.', 'Data science learning guide', 69.99, true, 3),
((SELECT id FROM categories WHERE slug = 'books'), 'Business Strategy Handbook', 'business-strategy-handbook', 'Essential guide to business strategy, planning, and execution. Covers market analysis, competitive positioning, and growth strategies.', 'Business strategy reference book', 45.99, true, 4),
((SELECT id FROM categories WHERE slug = 'books'), 'Web Development Complete Course', 'web-development-complete-course', 'Full-stack web development course covering HTML, CSS, JavaScript, React, Node.js, and databases. Build real projects from scratch.', 'Complete web development course', 79.99, true, 5),

-- Software & Tools Category
((SELECT id FROM categories WHERE slug = 'software'), 'Project Management Pro', 'project-management-pro', 'Advanced project management software with team collaboration, time tracking, resource planning, and reporting features. Perfect for teams of all sizes.', 'Professional project management tool', 29.99, true, 1),
((SELECT id FROM categories WHERE slug = 'software'), 'Design Studio Suite', 'design-studio-suite', 'Complete design software suite including vector graphics, photo editing, and UI/UX design tools. Professional-grade features for designers.', 'Complete design software suite', 99.99, true, 2),
((SELECT id FROM categories WHERE slug = 'software'), 'Code Editor Plus', 'code-editor-plus', 'Advanced code editor with syntax highlighting, debugging tools, Git integration, and plugin support. Supports 50+ programming languages.', 'Advanced code editor with debugging', 39.99, true, 3),
((SELECT id FROM categories WHERE slug = 'software'), 'Database Management Tool', 'database-management-tool', 'Powerful database management and administration tool supporting MySQL, PostgreSQL, MongoDB, and more. Visual query builder included.', 'Professional database management tool', 59.99, true, 4),
((SELECT id FROM categories WHERE slug = 'software'), 'API Testing Platform', 'api-testing-platform', 'Comprehensive API testing and monitoring platform with automated testing, performance monitoring, and team collaboration features.', 'Complete API testing solution', 49.99, true, 5),

-- Health & Wellness Category
((SELECT id FROM categories WHERE slug = 'health'), 'Premium Protein Powder', 'premium-protein-powder', 'High-quality whey protein powder with 25g protein per serving. Available in multiple flavors, perfect for muscle building and recovery.', 'High-quality whey protein powder', 49.99, true, 1),
((SELECT id FROM categories WHERE slug = 'health'), 'Yoga Mat Pro', 'yoga-mat-pro', 'Professional-grade yoga mat with superior grip, cushioning, and durability. Non-slip surface and eco-friendly materials.', 'Professional non-slip yoga mat', 79.99, true, 2),
((SELECT id FROM categories WHERE slug = 'health'), 'Multivitamin Complex', 'multivitamin-complex', 'Complete daily multivitamin with essential vitamins and minerals. Supports immune system, energy levels, and overall health.', 'Complete daily multivitamin supplement', 29.99, true, 3),
((SELECT id FROM categories WHERE slug = 'health'), 'Resistance Bands Set', 'resistance-bands-set', 'Complete resistance bands set with multiple resistance levels, door anchor, and exercise guide. Perfect for home workouts.', 'Complete resistance bands workout set', 34.99, true, 4),
((SELECT id FROM categories WHERE slug = 'health'), 'Essential Oils Starter Kit', 'essential-oils-starter-kit', 'Premium essential oils starter kit with 10 popular oils, diffuser, and usage guide. Perfect for aromatherapy and relaxation.', 'Premium essential oils starter kit', 89.99, true, 5),

-- Home & Garden Category
((SELECT id FROM categories WHERE slug = 'home-garden'), 'Smart Home Security Camera', 'smart-home-security-camera', 'Wireless security camera with 1080p HD video, night vision, motion detection, and smartphone app control. Easy installation.', 'Wireless HD security camera system', 129.99, true, 1),
((SELECT id FROM categories WHERE slug = 'home-garden'), 'Indoor Plant Growing Kit', 'indoor-plant-growing-kit', 'Complete indoor gardening kit with LED grow lights, planters, seeds, and nutrients. Grow fresh herbs and vegetables year-round.', 'Complete indoor gardening kit', 89.99, true, 2),
((SELECT id FROM categories WHERE slug = 'home-garden'), 'Smart Thermostat', 'smart-thermostat', 'Energy-efficient smart thermostat with WiFi connectivity, learning algorithms, and smartphone control. Save up to 20% on energy bills.', 'Energy-efficient smart thermostat', 199.99, true, 3),
((SELECT id FROM categories WHERE slug = 'home-garden'), 'Robotic Vacuum Cleaner', 'robotic-vacuum-cleaner', 'Intelligent robotic vacuum with mapping technology, app control, and automatic charging. Perfect for busy households.', 'Intelligent robotic vacuum cleaner', 299.99, true, 4),
((SELECT id FROM categories WHERE slug = 'home-garden'), 'Air Purifier HEPA', 'air-purifier-hepa', 'High-efficiency air purifier with HEPA filter, removes 99.97% of airborne particles. Quiet operation and smart sensors.', 'HEPA air purifier with smart sensors', 179.99, true, 5),

-- Fashion & Apparel Category
((SELECT id FROM categories WHERE slug = 'fashion'), 'Premium Leather Wallet', 'premium-leather-wallet', 'Handcrafted genuine leather wallet with RFID blocking, multiple card slots, and coin pocket. Elegant design for everyday use.', 'Handcrafted leather wallet with RFID', 69.99, true, 1),
((SELECT id FROM categories WHERE slug = 'fashion'), 'Luxury Watch Collection', 'luxury-watch-collection', 'Elegant luxury watch with Swiss movement, sapphire crystal, and water resistance. Available in multiple styles and colors.', 'Elegant luxury watch with Swiss movement', 299.99, true, 2),
((SELECT id FROM categories WHERE slug = 'fashion'), 'Designer Sunglasses', 'designer-sunglasses', 'Premium designer sunglasses with UV protection, polarized lenses, and durable frames. Perfect blend of style and functionality.', 'Premium designer sunglasses UV protection', 149.99, true, 3),
((SELECT id FROM categories WHERE slug = 'fashion'), 'Casual Sneakers Premium', 'casual-sneakers-premium', 'Comfortable premium sneakers with breathable materials, cushioned sole, and modern design. Perfect for daily wear and light exercise.', 'Comfortable premium casual sneakers', 119.99, true, 4),
((SELECT id FROM categories WHERE slug = 'fashion'), 'Business Laptop Bag', 'business-laptop-bag', 'Professional laptop bag with padded compartments, multiple pockets, and water-resistant material. Fits laptops up to 15.6 inches.', 'Professional water-resistant laptop bag', 89.99, true, 5),

-- Sports & Fitness Category
((SELECT id FROM categories WHERE slug = 'sports'), 'Adjustable Dumbbell Set', 'adjustable-dumbbell-set', 'Space-saving adjustable dumbbell set with quick weight changes from 5-50 lbs per dumbbell. Perfect for home gym setups.', 'Adjustable dumbbell set 5-50 lbs', 299.99, true, 1),
((SELECT id FROM categories WHERE slug = 'sports'), 'Professional Tennis Racket', 'professional-tennis-racket', 'High-performance tennis racket with carbon fiber construction, perfect balance, and comfortable grip. Suitable for intermediate to advanced players.', 'Professional carbon fiber tennis racket', 179.99, true, 2),
((SELECT id FROM categories WHERE slug = 'sports'), 'Mountain Bike Helmet', 'mountain-bike-helmet', 'Lightweight mountain bike helmet with advanced ventilation, adjustable fit, and MIPS technology for enhanced protection.', 'Lightweight mountain bike helmet MIPS', 89.99, true, 3),
((SELECT id FROM categories WHERE slug = 'sports'), 'Camping Tent 4-Person', 'camping-tent-4-person', 'Waterproof 4-person camping tent with easy setup, spacious interior, and durable materials. Perfect for family camping trips.', 'Waterproof 4-person camping tent', 199.99, true, 4),
((SELECT id FROM categories WHERE slug = 'sports'), 'Swimming Goggles Pro', 'swimming-goggles-pro', 'Professional swimming goggles with anti-fog coating, UV protection, and comfortable silicone seals. Perfect for competitive swimming.', 'Professional anti-fog swimming goggles', 39.99, true, 5),

-- Automotive Category
((SELECT id FROM categories WHERE slug = 'automotive'), 'Car Dash Camera HD', 'car-dash-camera-hd', 'High-definition dash camera with night vision, loop recording, and G-sensor. Provides security and evidence in case of accidents.', 'HD dash camera with night vision', 129.99, true, 1),
((SELECT id FROM categories WHERE slug = 'automotive'), 'Wireless Car Charger', 'wireless-car-charger', 'Fast wireless car charger with automatic clamping, 360-degree rotation, and dashboard/vent mounting options. Compatible with all Qi devices.', 'Fast wireless car charger mount', 49.99, true, 2),
((SELECT id FROM categories WHERE slug = 'automotive'), 'Car Emergency Kit', 'car-emergency-kit', 'Complete car emergency kit with jumper cables, tire pressure gauge, emergency blanket, flashlight, and first aid supplies.', 'Complete car emergency safety kit', 79.99, true, 3),
((SELECT id FROM categories WHERE slug = 'automotive'), 'Bluetooth Car Adapter', 'bluetooth-car-adapter', 'Bluetooth car adapter with hands-free calling, music streaming, and dual USB charging ports. Easy plug-and-play installation.', 'Bluetooth car adapter hands-free', 34.99, true, 4),
((SELECT id FROM categories WHERE slug = 'automotive'), 'Car Seat Organizer', 'car-seat-organizer', 'Multi-pocket car seat organizer with tablet holder, tissue box, and storage compartments. Keeps your car tidy and organized.', 'Multi-pocket car seat organizer', 29.99, true, 5);

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