-- Document Summary Feature Database Schema
-- Run this in your Supabase SQL editor

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  processing_time INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_summaries table
CREATE TABLE IF NOT EXISTS document_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  language TEXT DEFAULT 'English',
  style TEXT DEFAULT 'concise',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create whatsapp_deliveries table
CREATE TABLE IF NOT EXISTS whatsapp_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  message_id TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  document_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expires_at ON documents(expires_at);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_document_summaries_document_id ON document_summaries(document_id);
CREATE INDEX IF NOT EXISTS idx_document_summaries_created_at ON document_summaries(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_deliveries_phone ON whatsapp_deliveries(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_deliveries_created_at ON whatsapp_deliveries(created_at);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - adjust based on your auth requirements)
CREATE POLICY "Allow all operations on documents" ON documents
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on document_summaries" ON document_summaries
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on whatsapp_deliveries" ON whatsapp_deliveries
  FOR ALL USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for documents table
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired documents
CREATE OR REPLACE FUNCTION cleanup_expired_documents()
RETURNS void AS $$
BEGIN
    DELETE FROM documents 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- Create a scheduled job to run cleanup (if you have pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-docs', '0 2 * * *', 'SELECT cleanup_expired_documents();');

-- Insert some sample data for testing (optional)
-- INSERT INTO documents (filename, file_type, word_count, processing_time, status) VALUES
-- ('sample.pdf', 'application/pdf', 1500, 3000, 'completed'),
-- ('test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 800, 2500, 'completed');

-- Create view for document statistics
CREATE OR REPLACE VIEW document_stats AS
SELECT 
    COUNT(*) as total_documents,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_documents,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_documents,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_documents,
    AVG(CASE WHEN processing_time > 0 THEN processing_time END) as avg_processing_time,
    SUM(word_count) as total_words_processed,
    DATE_TRUNC('day', created_at) as date
FROM documents
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant necessary permissions (adjust based on your setup)
-- GRANT ALL ON documents TO authenticated;
-- GRANT ALL ON document_summaries TO authenticated;
-- GRANT ALL ON whatsapp_deliveries TO authenticated;
-- GRANT SELECT ON document_stats TO authenticated;