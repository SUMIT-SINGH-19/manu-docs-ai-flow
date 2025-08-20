import { n8nWebhookService, type N8NDocumentResponse } from './n8nWebhookService';
import { supabase } from './supabase';

// Updated ProcessedDocument interface to match n8n response
export interface ProcessedDocument {
  id: string;
  filename: string;
  fileType: string;
  summary: string;
  wordCount: number;
  processingTime: number;
}

export interface DocumentSummaryOptions {
  maxLength?: number;
  language?: string;
  style?: 'concise' | 'detailed' | 'bullet-points';
  sendToWhatsApp?: boolean;
  phoneNumber?: string;
}

export interface ProcessingProgress {
  stage: 'uploading' | 'extracting' | 'summarizing' | 'sending' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  currentFile?: string;
  error?: string;
}

export interface DocumentSummaryResult {
  documents: ProcessedDocument[];
  whatsappDelivery?: {
    success: boolean;
    messageId?: string;
    error?: string;
  };
  totalProcessingTime: number;
  success: boolean;
  error?: string;
}

export class DocumentSummaryService {
  private progressCallback?: (progress: ProcessingProgress) => void;

  /**
   * Set progress callback for real-time updates
   */
  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Process documents via N8N webhook and optionally send to WhatsApp
   */
  async processDocuments(
    files: File[], 
    options: DocumentSummaryOptions = {}
  ): Promise<DocumentSummaryResult> {
    const startTime = Date.now();
    
    try {
      // Validate inputs
      if (!files || files.length === 0) {
        throw new Error('No files provided for processing');
      }

      if (options.sendToWhatsApp && !options.phoneNumber) {
        throw new Error('Phone number required for WhatsApp delivery');
      }

      // Stage 1: Upload and validate files
      this.updateProgress({
        stage: 'uploading',
        progress: 10,
        message: 'Validating and preparing files...'
      });

      await this.validateFiles(files);

      // Stage 2: Send to N8N webhook for processing
      this.updateProgress({
        stage: 'extracting',
        progress: 30,
        message: 'Sending documents to N8N for processing...'
      });

      // Prepare request for N8N webhook
      const n8nRequest = {
        files,
        phoneNumber: options.sendToWhatsApp ? options.phoneNumber : undefined,
        options: {
          language: options.language || 'en',
          style: options.style || 'detailed',
          maxLength: options.maxLength
        }
      };

      // Stage 3: Processing via N8N
      this.updateProgress({
        stage: 'summarizing',
        progress: 50,
        message: 'N8N is processing document and generating AI summary... (this may take up to 1 minute)'
      });

      // Send to N8N webhook (this will take about 1 minute)
      const n8nResponse = await n8nWebhookService.processDocuments(n8nRequest);

      if (!n8nResponse.success) {
        throw new Error(n8nResponse.error || 'N8N processing failed');
      }

      // Stage 4: Processing WhatsApp delivery (handled by N8N)
      if (options.sendToWhatsApp && options.phoneNumber) {
        this.updateProgress({
          stage: 'sending',
          progress: 80,
          message: 'N8N is formatting and sending summary to WhatsApp...'
        });
      }

      // Stage 5: Convert N8N response to our format
      const documents: ProcessedDocument[] = n8nResponse.documents?.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        fileType: files.find(f => f.name === doc.filename)?.type || 'application/octet-stream',
        summary: doc.summary,
        wordCount: doc.wordCount,
        processingTime: doc.processingTime
      })) || [];

      // Stage 6: Save to database (optional - for local tracking)
      this.updateProgress({
        stage: 'summarizing',
        progress: 90,
        message: 'Saving processing results...'
      });

      await this.saveToDatabase(documents);

      // Stage 7: Complete
      this.updateProgress({
        stage: 'complete',
        progress: 100,
        message: 'Processing complete! Check in your WhatsApp.'
      });

      const totalProcessingTime = Date.now() - startTime;

      return {
        documents,
        whatsappDelivery: n8nResponse.whatsappDelivery,
        totalProcessingTime,
        success: true
      };

    } catch (error) {
      console.error('N8N document processing failed:', error);
      
      this.updateProgress({
        stage: 'error',
        progress: 0,
        message: 'Processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        documents: [],
        totalProcessingTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate uploaded files
   */
  private async validateFiles(files: File[]): Promise<void> {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed per session`);
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        throw new Error(`File ${file.name} exceeds maximum size of 10MB`);
      }

      const isSupported = supportedTypes.includes(file.type) || 
                         file.name.endsWith('.txt') || 
                         file.name.endsWith('.docx') || 
                         file.name.endsWith('.pdf');

      if (!isSupported) {
        throw new Error(`File type not supported: ${file.name}. Supported types: PDF, DOCX, TXT`);
      }
    }
  }

  /**
   * Save processed documents to database
   */
  private async saveToDatabase(documents: ProcessedDocument[]): Promise<void> {
    try {
      for (const doc of documents) {
        // Save document metadata
        const { error: docError } = await supabase
          .from('documents')
          .insert({
            id: doc.id,
            filename: doc.filename,
            file_type: doc.fileType,
            word_count: doc.wordCount,
            processing_time: doc.processingTime,
            status: 'completed',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          });

        if (docError) {
          console.error('Failed to save document:', docError);
        }

        // Save summary
        const { error: summaryError } = await supabase
          .from('document_summaries')
          .insert({
            id: crypto.randomUUID(),
            document_id: doc.id,
            summary_text: doc.summary,
            word_count: doc.summary.split(/\s+/).length,
            created_at: new Date().toISOString()
          });

        if (summaryError) {
          console.error('Failed to save summary:', summaryError);
        }
      }
    } catch (error) {
      console.error('Database save failed:', error);
      // Don't throw error here as the processing was successful
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<{
    totalDocuments: number;
    totalSummaries: number;
    avgProcessingTime: number;
    successRate: number;
  }> {
    try {
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('processing_time, status');

      if (docError) throw docError;

      const { data: summaries, error: summaryError } = await supabase
        .from('document_summaries')
        .select('id');

      if (summaryError) throw summaryError;

      const totalDocuments = documents?.length || 0;
      const totalSummaries = summaries?.length || 0;
      const completedDocs = documents?.filter(d => d.status === 'completed') || [];
      const avgProcessingTime = completedDocs.length > 0 
        ? completedDocs.reduce((sum, doc) => sum + doc.processing_time, 0) / completedDocs.length
        : 0;
      const successRate = totalDocuments > 0 ? (completedDocs.length / totalDocuments) * 100 : 0;

      return {
        totalDocuments,
        totalSummaries,
        avgProcessingTime,
        successRate
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        totalDocuments: 0,
        totalSummaries: 0,
        avgProcessingTime: 0,
        successRate: 0
      };
    }
  }

  /**
   * Test N8N webhook connection
   */
  async testWhatsAppConnection(): Promise<{ success: boolean; error?: string }> {
    return await n8nWebhookService.testConnection();
  }

  /**
   * Send test message via N8N webhook
   */
  async sendTestMessage(phoneNumber: string): Promise<{ success: boolean; error?: string; phoneNumber: string; timestamp: number }> {
    try {
      const result = await n8nWebhookService.sendTestDocument(phoneNumber);
      
      return {
        success: result.success,
        error: result.error,
        phoneNumber,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test message failed',
        phoneNumber,
        timestamp: Date.now()
      };
    }
  }
}

// Export singleton instance
export const documentSummaryService = new DocumentSummaryService();