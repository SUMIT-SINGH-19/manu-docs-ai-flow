-- Document Summary & WhatsApp Delivery Feature Schema
-- This migration creates the necessary tables for the document processing feature

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table for storing uploaded files
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'error')),
    upload_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document summaries table for storing AI-generated summaries
CREATE TABLE document_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    processing_time INTEGER NOT NULL, -- in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated PDFs table for tracking PDF files
CREATE TABLE generated_pdfs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_id UUID NOT NULL REFERENCES document_summaries(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- WhatsApp deliveries table for tracking message deliveries
CREATE TABLE whatsapp_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    summary_ids UUID[] NOT NULL,
    pdf_urls TEXT[] NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_expires_at ON documents(expires_at);
CREATE INDEX idx_document_summaries_document_id ON document_summaries(document_id);
CREATE INDEX idx_generated_pdfs_summary_id ON generated_pdfs(summary_id);
CREATE INDEX idx_generated_pdfs_expires_at ON generated_pdfs(expires_at);
CREATE INDEX idx_whatsapp_deliveries_status ON whatsapp_deliveries(status);
CREATE INDEX idx_whatsapp_deliveries_phone ON whatsapp_deliveries(phone_number);

-- Create updated_at trigger for documents table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_deliveries ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust based on your auth requirements)
CREATE POLICY "Allow all operations for authenticated users" ON documents
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON document_summaries
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON generated_pdfs
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON whatsapp_deliveries
    FOR ALL USING (true);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public access" ON storage.objects
    FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
    FOR DELETE USING (bucket_id = 'documents');

-- Function to clean up expired documents (to be called by a scheduled job)
CREATE OR REPLACE FUNCTION cleanup_expired_documents()
RETURNS void AS $$
BEGIN
    -- Delete expired documents and their related data
    DELETE FROM documents WHERE expires_at < NOW();
    
    -- Delete expired PDFs
    DELETE FROM generated_pdfs WHERE expires_at < NOW();
    
    -- Note: File cleanup from storage should be handled by the application
    -- as it requires storage API calls
END;
$$ LANGUAGE plpgsql;

-- Create a function to get document processing statistics
CREATE OR REPLACE FUNCTION get_processing_stats(time_period INTERVAL DEFAULT '24 hours')
RETURNS TABLE (
    total_documents BIGINT,
    completed_documents BIGINT,
    processing_documents BIGINT,
    failed_documents BIGINT,
    total_summaries BIGINT,
    total_deliveries BIGINT,
    successful_deliveries BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE d.created_at >= NOW() - time_period) as total_documents,
        COUNT(*) FILTER (WHERE d.status = 'completed' AND d.created_at >= NOW() - time_period) as completed_documents,
        COUNT(*) FILTER (WHERE d.status = 'processing' AND d.created_at >= NOW() - time_period) as processing_documents,
        COUNT(*) FILTER (WHERE d.status = 'error' AND d.created_at >= NOW() - time_period) as failed_documents,
        COUNT(ds.*) FILTER (WHERE ds.created_at >= NOW() - time_period) as total_summaries,
        COUNT(wd.*) FILTER (WHERE wd.created_at >= NOW() - time_period) as total_deliveries,
        COUNT(wd.*) FILTER (WHERE wd.status IN ('sent', 'delivered') AND wd.created_at >= NOW() - time_period) as successful_deliveries
    FROM documents d
    LEFT JOIN document_summaries ds ON d.id = ds.document_id
    LEFT JOIN whatsapp_deliveries wd ON ds.id = ANY(wd.summary_ids);
END;
$$ LANGUAGE plpgsql;