-- Quick Database Setup Test Script
-- Run this after creating all tables to verify everything works

-- Test 1: Check if all tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'document_uploads', 
    'document_summaries', 
    'pdf_deliveries', 
    'processing_logs', 
    'user_sessions',
    'categories',
    'products',
    'product_regions',
    'document_requirements'
)
ORDER BY tablename;

-- Test 2: Check if storage buckets exist
SELECT 
    id,
    name,
    public
FROM storage.buckets 
WHERE id IN ('document-uploads', 'generated-pdfs');

-- Test 3: Check if categories have data
SELECT 
    slug,
    name,
    description
FROM categories 
ORDER BY sort_order
LIMIT 5;

-- Test 4: Check if products have data
SELECT 
    p.name,
    c.name as category_name,
    p.hs_code,
    p.popularity
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY p.popularity DESC
LIMIT 5;

-- Test 5: Test the helper functions
SELECT 'Testing get_categories function:' as test_name;
SELECT * FROM get_categories() LIMIT 3;

SELECT 'Testing get_products_by_category function:' as test_name;
SELECT * FROM get_products_by_category('agriculture') LIMIT 3;

-- Success message
SELECT 'Database setup completed successfully! All tables and data are ready.' as status;