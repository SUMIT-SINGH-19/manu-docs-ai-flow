-- Document Summary & WhatsApp Delivery Feature - Production Database Schema
-- Version: 1.0
-- Date: August 12, 2025
-- Target Database: Supabase PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =====================================================
-- 1. DATABASE TABLES
-- =====================================================

-- Table 1: document_uploads
CREATE TABLE document_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_session_id VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('pdf', 'docx', 'txt')),
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    upload_status VARCHAR(20) DEFAULT 'uploaded' CHECK (upload_status IN ('uploaded', 'processing', 'completed', 'failed')),
    whatsapp_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_document_uploads_session ON document_uploads(user_session_id);
CREATE INDEX idx_document_uploads_status ON document_uploads(upload_status);
CREATE INDEX idx_document_uploads_expires ON document_uploads(expires_at);
CREATE INDEX idx_document_uploads_created ON document_uploads(created_at);

-- Table 2: document_summaries
CREATE TABLE document_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_upload_id UUID REFERENCES document_uploads(id) ON DELETE CASCADE,
    extracted_text TEXT,
    summary_text TEXT NOT NULL,
    summary_word_count INTEGER,
    processing_time_seconds INTEGER,
    ai_model_used VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_summaries_document_id ON document_summaries(document_upload_id);
CREATE INDEX idx_summaries_created ON document_summaries(created_at);

-- Table 3: pdf_deliveries
CREATE TABLE pdf_deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_upload_id UUID REFERENCES document_uploads(id) ON DELETE CASCADE,
    pdf_file_url TEXT NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
    delivery_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    whatsapp_message_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_deliveries_document_id ON pdf_deliveries(document_upload_id);
CREATE INDEX idx_deliveries_status ON pdf_deliveries(delivery_status);
CREATE INDEX idx_deliveries_whatsapp ON pdf_deliveries(whatsapp_number);
CREATE INDEX idx_deliveries_created ON pdf_deliveries(created_at);

-- Table 4: processing_logs
CREATE TABLE processing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_upload_id UUID REFERENCES document_uploads(id) ON DELETE CASCADE,
    process_step VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    message TEXT,
    processing_time_ms INTEGER,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_logs_document_id ON processing_logs(document_upload_id);
CREATE INDEX idx_logs_step_status ON processing_logs(process_step, status);
CREATE INDEX idx_logs_created ON processing_logs(created_at);

-- Table 5: user_sessions (Optional - for better session management)
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    total_uploads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Add indexes
CREATE INDEX idx_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- =====================================================
-- 2. ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for session-based access
CREATE POLICY "Users can access their own uploads" ON document_uploads
    FOR ALL USING (user_session_id = current_setting('app.current_session_id', true));

CREATE POLICY "Users can access their own summaries" ON document_summaries
    FOR ALL USING (document_upload_id IN (
        SELECT id FROM document_uploads WHERE user_session_id = current_setting('app.current_session_id', true)
    ));

CREATE POLICY "Users can access their own deliveries" ON pdf_deliveries
    FOR ALL USING (document_upload_id IN (
        SELECT id FROM document_uploads WHERE user_session_id = current_setting('app.current_session_id', true)
    ));

CREATE POLICY "Users can access their own logs" ON processing_logs
    FOR ALL USING (document_upload_id IN (
        SELECT id FROM document_uploads WHERE user_session_id = current_setting('app.current_session_id', true)
    ));

CREATE POLICY "Users can access their own sessions" ON user_sessions
    FOR ALL USING (session_id = current_setting('app.current_session_id', true));

-- =====================================================
-- 3. DATABASE FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-Update Timestamp Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_document_uploads_updated_at
    BEFORE UPDATE ON document_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdf_deliveries_updated_at
    BEFORE UPDATE ON pdf_deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cleanup Expired Data Function
CREATE OR REPLACE FUNCTION cleanup_expired_uploads()
RETURNS void AS $$
BEGIN
    -- Delete expired uploads (cascades to related tables)
    DELETE FROM document_uploads WHERE expires_at < NOW();
    
    -- Delete expired sessions
    DELETE FROM user_sessions WHERE expires_at < NOW();
    
    -- Log cleanup activity
    RAISE NOTICE 'Cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily at 2 AM
-- Note: This requires pg_cron extension to be enabled
SELECT cron.schedule('cleanup-expired-uploads', '0 2 * * *', 'SELECT cleanup_expired_uploads();');

-- Status Update Function
CREATE OR REPLACE FUNCTION update_upload_status(
    upload_id UUID,
    new_status VARCHAR(20),
    log_message TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Update the upload status
    UPDATE document_uploads 
    SET upload_status = new_status, updated_at = NOW()
    WHERE id = upload_id;
    
    -- Log the status change
    INSERT INTO processing_logs (
        document_upload_id,
        process_step,
        status,
        message,
        created_at
    ) VALUES (
        upload_id,
        'status_change',
        'completed',
        COALESCE(log_message, 'Status updated to ' || new_status),
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get processing statistics
CREATE OR REPLACE FUNCTION get_processing_statistics(
    session_id_param VARCHAR(255) DEFAULT NULL,
    time_period INTERVAL DEFAULT '24 hours'
)
RETURNS TABLE (
    total_uploads BIGINT,
    completed_uploads BIGINT,
    processing_uploads BIGINT,
    failed_uploads BIGINT,
    total_summaries BIGINT,
    total_deliveries BIGINT,
    successful_deliveries BIGINT,
    avg_processing_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE du.created_at >= NOW() - time_period) as total_uploads,
        COUNT(*) FILTER (WHERE du.upload_status = 'completed' AND du.created_at >= NOW() - time_period) as completed_uploads,
        COUNT(*) FILTER (WHERE du.upload_status = 'processing' AND du.created_at >= NOW() - time_period) as processing_uploads,
        COUNT(*) FILTER (WHERE du.upload_status = 'failed' AND du.created_at >= NOW() - time_period) as failed_uploads,
        COUNT(ds.*) FILTER (WHERE ds.created_at >= NOW() - time_period) as total_summaries,
        COUNT(pd.*) FILTER (WHERE pd.created_at >= NOW() - time_period) as total_deliveries,
        COUNT(pd.*) FILTER (WHERE pd.delivery_status IN ('sent', 'delivered') AND pd.created_at >= NOW() - time_period) as successful_deliveries,
        AVG(ds.processing_time_seconds) FILTER (WHERE ds.created_at >= NOW() - time_period) as avg_processing_time
    FROM document_uploads du
    LEFT JOIN document_summaries ds ON du.id = ds.document_upload_id
    LEFT JOIN pdf_deliveries pd ON du.id = pd.document_upload_id
    WHERE (session_id_param IS NULL OR du.user_session_id = session_id_param);
END;
$$ LANGUAGE plpgsql;

-- Function to increment delivery attempts
CREATE OR REPLACE FUNCTION increment_delivery_attempt(
    delivery_id UUID,
    error_msg TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    UPDATE pdf_deliveries 
    SET 
        delivery_attempts = delivery_attempts + 1,
        last_attempt_at = NOW(),
        error_message = COALESCE(error_msg, error_message),
        delivery_status = CASE 
            WHEN delivery_attempts >= 2 THEN 'failed'
            ELSE delivery_status
        END,
        updated_at = NOW()
    WHERE id = delivery_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. DATABASE VIEWS (Analytics)
-- =====================================================

-- Summary Analytics View
CREATE VIEW upload_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as upload_date,
    COUNT(*) as total_uploads,
    COUNT(CASE WHEN upload_status = 'completed' THEN 1 END) as successful_uploads,
    COUNT(CASE WHEN upload_status = 'failed' THEN 1 END) as failed_uploads,
    AVG(file_size) as avg_file_size,
    STRING_AGG(DISTINCT file_type, ', ') as file_types_uploaded
FROM document_uploads
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY upload_date DESC;

-- Delivery Success Rate View
CREATE VIEW delivery_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as delivery_date,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) as successful_deliveries,
    COUNT(CASE WHEN delivery_status = 'failed' THEN 1 END) as failed_deliveries,
    ROUND(
        (COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as success_rate_percent
FROM pdf_deliveries
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY delivery_date DESC;

-- Processing Performance View
CREATE VIEW processing_performance AS
SELECT 
    DATE_TRUNC('hour', ds.created_at) as processing_hour,
    COUNT(*) as summaries_generated,
    AVG(ds.processing_time_seconds) as avg_processing_time,
    MIN(ds.processing_time_seconds) as min_processing_time,
    MAX(ds.processing_time_seconds) as max_processing_time,
    AVG(ds.summary_word_count) as avg_word_count
FROM document_summaries ds
GROUP BY DATE_TRUNC('hour', ds.created_at)
ORDER BY processing_hour DESC;

-- Error Analysis View
CREATE VIEW error_analysis AS
SELECT 
    DATE_TRUNC('day', created_at) as error_date,
    process_step,
    COUNT(*) as error_count,
    STRING_AGG(DISTINCT message, '; ') as error_messages
FROM processing_logs
WHERE status = 'failed'
GROUP BY DATE_TRUNC('day', created_at), process_step
ORDER BY error_date DESC, error_count DESC;

-- =====================================================
-- 5. STORAGE BUCKET SETUP
-- =====================================================

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('document-uploads', 'document-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for generated PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-pdfs', 'generated-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for document uploads
CREATE POLICY "Allow authenticated uploads to document-uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'document-uploads');

CREATE POLICY "Allow authenticated access to document-uploads" ON storage.objects
    FOR SELECT USING (bucket_id = 'document-uploads');

CREATE POLICY "Allow authenticated deletes from document-uploads" ON storage.objects
    FOR DELETE USING (bucket_id = 'document-uploads');

-- Storage policies for generated PDFs
CREATE POLICY "Allow authenticated uploads to generated-pdfs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'generated-pdfs');

CREATE POLICY "Allow authenticated access to generated-pdfs" ON storage.objects
    FOR SELECT USING (bucket_id = 'generated-pdfs');

CREATE POLICY "Allow authenticated deletes from generated-pdfs" ON storage.objects
    FOR DELETE USING (bucket_id = 'generated-pdfs');

-- =====================================================
-- 6. ADDITIONAL HELPER FUNCTIONS
-- =====================================================

-- Function to create a new user session
CREATE OR REPLACE FUNCTION create_user_session(
    session_id_param VARCHAR(255),
    ip_addr INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    session_uuid UUID;
BEGIN
    INSERT INTO user_sessions (session_id, ip_address, user_agent)
    VALUES (session_id_param, ip_addr, user_agent_param)
    ON CONFLICT (session_id) DO UPDATE SET
        last_activity = NOW(),
        expires_at = NOW() + INTERVAL '7 days'
    RETURNING id INTO session_uuid;
    
    RETURN session_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(session_id_param VARCHAR(255))
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET 
        last_activity = NOW(),
        expires_at = NOW() + INTERVAL '7 days'
    WHERE session_id = session_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get upload quota for session
CREATE OR REPLACE FUNCTION get_session_upload_quota(
    session_id_param VARCHAR(255),
    quota_period INTERVAL DEFAULT '1 hour'
)
RETURNS TABLE (
    uploads_in_period BIGINT,
    max_uploads_allowed INTEGER,
    quota_exceeded BOOLEAN
) AS $$
DECLARE
    max_uploads CONSTANT INTEGER := 20; -- Max 20 uploads per hour per session
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as uploads_in_period,
        max_uploads as max_uploads_allowed,
        COUNT(*) >= max_uploads as quota_exceeded
    FROM document_uploads
    WHERE user_session_id = session_id_param
    AND created_at >= NOW() - quota_period;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. INITIAL DATA AND TESTING
-- =====================================================

-- Insert test data for development (remove in production)
DO $$
BEGIN
    IF current_setting('app.environment', true) = 'development' THEN
        -- Create test session
        INSERT INTO user_sessions (session_id, ip_address, user_agent)
        VALUES ('test-session-123', '127.0.0.1', 'Test User Agent')
        ON CONFLICT (session_id) DO NOTHING;
        
        -- Create test upload
        INSERT INTO document_uploads (
            user_session_id, 
            original_filename, 
            file_type, 
            file_size, 
            file_url, 
            whatsapp_number
        ) VALUES (
            'test-session-123', 
            'test-document.pdf', 
            'pdf', 
            1024000, 
            'https://example.com/test.pdf', 
            '+1234567890'
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =====================================================
-- 8. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE document_uploads IS 'Stores metadata for uploaded documents with 24-hour expiration';
COMMENT ON TABLE document_summaries IS 'Stores AI-generated summaries linked to uploaded documents';
COMMENT ON TABLE pdf_deliveries IS 'Tracks WhatsApp delivery status of generated PDF summaries';
COMMENT ON TABLE processing_logs IS 'Audit log for all document processing steps and errors';
COMMENT ON TABLE user_sessions IS 'Manages user sessions for rate limiting and access control';

COMMENT ON FUNCTION cleanup_expired_uploads() IS 'Scheduled function to clean up expired uploads and sessions';
COMMENT ON FUNCTION update_upload_status(UUID, VARCHAR, TEXT) IS 'Updates upload status and logs the change';
COMMENT ON FUNCTION get_processing_statistics(VARCHAR, INTERVAL) IS 'Returns processing statistics for analytics';

-- =====================================================
-- 9. FINAL VERIFICATION
-- =====================================================

-- Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('document_uploads', 'document_summaries', 'pdf_deliveries', 'processing_logs', 'user_sessions');
    
    IF table_count = 5 THEN
        RAISE NOTICE 'SUCCESS: All 5 tables created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: Expected 5 tables, found %', table_count;
    END IF;
END $$;

-- Verify all indexes exist
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE 'Created % performance indexes', index_count;
END $$;

RAISE NOTICE 'Database schema setup completed successfully!';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Update your environment variables with Supabase credentials';
RAISE NOTICE '2. Test the API endpoints with the new schema';
RAISE NOTICE '3. Configure WhatsApp Business API integration';
RAISE NOTICE '4. Set up monitoring and alerts for the new tables';