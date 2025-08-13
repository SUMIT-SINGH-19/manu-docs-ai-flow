import { documentProcessor, type ProcessedDocument } from './documentProcessor';
import { twilioWhatsAppService, type WhatsAppDeliveryResult } from './twilioWhatsAppService';
import { supabase } from './supabase';

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
  whatsappDelivery?: WhatsAppDeliveryResult[];
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
   * Process documents and optionally send to WhatsApp
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

      // Stage 2: Extract text from files
      this.updateProgress({
        stage: 'extracting',
        progress: 30,
        message: 'Extracting text from documents...'
      });

      const documents: ProcessedDocument[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        this.updateProgress({
          stage: 'extracting',
          progress: 30 + (i / files.length) * 30,
          message: `Extracting text from ${file.name}...`,
          currentFile: file.name
        });

        try {
          const processed = await documentProcessor.processDocument(file, {
            maxLength: options.maxLength,
            language: options.language,
            style: options.style
          });
          documents.push(processed);
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
          // Add error document to results
          documents.push({
            id: crypto.randomUUID(),
            filename: file.name,
            fileType: file.type,
            extractedText: '',
            summary: `❌ Error processing document: ${error.message}`,
            wordCount: 0,
            processingTime: 0
          });
        }
      }

      // Stage 3: Save to database
      this.updateProgress({
        stage: 'summarizing',
        progress: 70,
        message: 'Saving summaries to database...'
      });

      await this.saveToDatabase(documents);

      // Stage 4: Send to WhatsApp (if requested)
      let whatsappDelivery: WhatsAppDeliveryResult[] | undefined;
      
      if (options.sendToWhatsApp && options.phoneNumber && twilioWhatsAppService) {
        this.updateProgress({
          stage: 'sending',
          progress: 85,
          message: 'Sending summaries to WhatsApp...'
        });

        whatsappDelivery = await twilioWhatsAppService.sendMultipleSummaries(
          options.phoneNumber,
          documents
        );
      }

      // Stage 5: Complete
      this.updateProgress({
        stage: 'complete',
        progress: 100,
        message: 'Processing complete!'
      });

      const totalProcessingTime = Date.now() - startTime;

      return {
        documents,
        whatsappDelivery,
        totalProcessingTime,
        success: true
      };

    } catch (error) {
      console.error('Document processing failed:', error);
      
      this.updateProgress({
        stage: 'error',
        progress: 0,
        message: 'Processing failed',
        error: error.message
      });

      return {
        documents: [],
        totalProcessingTime: Date.now() - startTime,
        success: false,
        error: error.message
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
   * Test WhatsApp connection
   */
  async testWhatsAppConnection(): Promise<{ success: boolean; error?: string }> {
    if (!twilioWhatsAppService) {
      return {
        success: false,
        error: 'Twilio WhatsApp service not configured. Please set VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, and VITE_TWILIO_WHATSAPP_NUMBER'
      };
    }

    return await twilioWhatsAppService.checkStatus();
  }

  /**
   * Send test message to WhatsApp
   */
  async sendTestMessage(phoneNumber: string): Promise<WhatsAppDeliveryResult> {
    if (!twilioWhatsAppService) {
      return {
        success: false,
        error: 'Twilio WhatsApp service not configured',
        phoneNumber,
        timestamp: Date.now()
      };
    }

    return await twilioWhatsAppService.sendTestMessage(phoneNumber);
  }
}

// Export singleton instance
export const documentSummaryService = new DocumentSummaryService();