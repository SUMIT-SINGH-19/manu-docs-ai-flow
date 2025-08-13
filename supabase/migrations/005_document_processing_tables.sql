-- Document Processing Tables
-- Version: 1.0
-- Date: August 13, 2025
-- Purpose: Create tables for document processing and summaries

-- =====================================================
-- 1. DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT,
    word_count INTEGER DEFAULT 0,
    processing_time INTEGER DEFAULT 0, -- in milliseconds
    status VARCHAR(50) DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expires_at ON documents(expires_at);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- =====================================================
-- 2. DOCUMENT SUMMARIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS document_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    style VARCHAR(50) DEFAULT 'detailed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_summaries_document_id ON document_summaries(document_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON document_summaries(created_at);

-- =====================================================
-- 3. WHATSAPP DELIVERIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    message_id VARCHAR(100), -- Twilio message SID
    status VARCHAR(50) DEFAULT 'pending',
    delivery_time TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_document_id ON whatsapp_deliveries(document_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_phone_number ON whatsapp_deliveries(phone_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON whatsapp_deliveries(status);

-- =====================================================
-- 4. PROCESSING STATISTICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS processing_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    total_documents INTEGER DEFAULT 0,
    successful_documents INTEGER DEFAULT 0,
    failed_documents INTEGER DEFAULT 0,
    total_processing_time BIGINT DEFAULT 0, -- in milliseconds
    avg_processing_time INTEGER DEFAULT 0, -- in milliseconds
    whatsapp_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_stats_date ON processing_stats(date);

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables
CREATE TRIGGER IF NOT EXISTS update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_summaries_updated_at
    BEFORE UPDATE ON document_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_deliveries_updated_at
    BEFORE UPDATE ON whatsapp_deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_stats_updated_at
    BEFORE UPDATE ON processing_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_stats ENABLE ROW LEVEL SECURITY;

-- Public access policies (adjust based on your auth requirements)
CREATE POLICY IF NOT EXISTS "Allow public read access to documents" ON documents
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public insert to documents" ON documents
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to summaries" ON document_summaries
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public insert to summaries" ON document_summaries
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to deliveries" ON whatsapp_deliveries
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public insert to deliveries" ON whatsapp_deliveries
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to stats" ON processing_stats
    FOR SELECT USING (true);

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to clean up expired documents
CREATE OR REPLACE FUNCTION cleanup_expired_documents()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM documents 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily statistics
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS VOID AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    doc_stats RECORD;
    delivery_stats RECORD;
BEGIN
    -- Get document statistics for today
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COALESCE(SUM(processing_time), 0) as total_time,
        COALESCE(AVG(processing_time), 0) as avg_time
    INTO doc_stats
    FROM documents 
    WHERE DATE(created_at) = today_date;
    
    -- Get delivery statistics for today
    SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as successful_deliveries
    INTO delivery_stats
    FROM whatsapp_deliveries 
    WHERE DATE(created_at) = today_date;
    
    -- Insert or update statistics
    INSERT INTO processing_stats (
        date, 
        total_documents, 
        successful_documents, 
        failed_documents,
        total_processing_time,
        avg_processing_time,
        whatsapp_deliveries,
        successful_deliveries
    ) VALUES (
        today_date,
        doc_stats.total,
        doc_stats.successful,
        doc_stats.failed,
        doc_stats.total_time,
        doc_stats.avg_time::INTEGER,
        delivery_stats.total_deliveries,
        delivery_stats.successful_deliveries
    )
    ON CONFLICT (date) DO UPDATE SET
        total_documents = EXCLUDED.total_documents,
        successful_documents = EXCLUDED.successful_documents,
        failed_documents = EXCLUDED.failed_documents,
        total_processing_time = EXCLUDED.total_processing_time,
        avg_processing_time = EXCLUDED.avg_processing_time,
        whatsapp_deliveries = EXCLUDED.whatsapp_deliveries,
        successful_deliveries = EXCLUDED.successful_deliveries,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample document for testing
INSERT INTO documents (
    id,
    filename,
    file_type,
    file_size,
    word_count,
    processing_time,
    status,
    expires_at
) VALUES (
    gen_random_uuid(),
    'sample-document.pdf',
    'application/pdf',
    1024000,
    1250,
    3000,
    'completed',
    NOW() + INTERVAL '24 hours'
) ON CONFLICT DO NOTHING;

-- Insert sample summary
INSERT INTO document_summaries (
    document_id,
    summary_text,
    word_count,
    language,
    style
) VALUES (
    (SELECT id FROM documents WHERE filename = 'sample-document.pdf' LIMIT 1),
    'This is a sample document summary generated for testing purposes. The document contains information about system testing, integration verification, and quality assurance processes. Key findings include successful implementation of core features, proper error handling, and comprehensive test coverage.',
    45,
    'en',
    'detailed'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Test the functions and verify data
SELECT 'Testing document processing tables:' as test;

SELECT 
    'Documents table: ' || COUNT(*) || ' records' as status
FROM documents;

SELECT 
    'Summaries table: ' || COUNT(*) || ' records' as status
FROM document_summaries;

SELECT 
    'Deliveries table: ' || COUNT(*) || ' records' as status
FROM whatsapp_deliveries;

SELECT 
    'Stats table: ' || COUNT(*) || ' records' as status
FROM processing_stats;

-- Test cleanup function
SELECT 'Cleanup function test: ' || cleanup_expired_documents() || ' expired documents cleaned' as status;

-- Test stats update function
SELECT update_daily_stats();
SELECT 'Stats updated for today' as status;

RAISE NOTICE 'Document processing tables setup completed successfully!';
RAISE NOTICE 'Tables created: documents, document_summaries, whatsapp_deliveries, processing_stats';
RAISE NOTICE 'Helper functions created: cleanup_expired_documents(), update_daily_stats()';
RAISE NOTICE 'Sample data inserted for testing purposes';