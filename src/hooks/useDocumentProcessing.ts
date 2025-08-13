import { useState, useCallback, useEffect } from 'react';
import { documentSummaryService, type ProcessingProgress, type DocumentSummaryOptions, type DocumentSummaryResult } from '@/lib/documentSummaryService';
import { type ProcessedDocument } from '@/lib/documentProcessor';
import { type WhatsAppDeliveryResult } from '@/lib/twilioWhatsAppService';
import { toast } from 'sonner';

export interface ProcessingFile {
  id: string;
  file: File;
  status: 'uploading' | 'extracting' | 'summarizing' | 'sending' | 'completed' | 'failed';
  progress: number;
  summary?: string;
  wordCount?: number;
  processingTime?: number;
  error?: string;
}

// Storage keys for persistence
const STORAGE_KEYS = {
  FILES: 'manu_docs_processing_files',
  PROGRESS: 'manu_docs_current_progress',
  LAST_RESULT: 'manu_docs_last_result'
};

// Helper functions for session storage
const saveToStorage = (key: string, data: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to session storage:', error);
  }
};

const loadFromStorage = (key: string) => {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to load from session storage:', error);
    return null;
  }
};

const clearStorage = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear session storage:', error);
  }
};

export const useDocumentProcessing = () => {
  // Initialize state from session storage
  const [files, setFiles] = useState<ProcessingFile[]>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.FILES);
    return stored || [];
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [currentProgress, setCurrentProgress] = useState<ProcessingProgress | null>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.PROGRESS);
    return stored || null;
  });
  
  const [lastResult, setLastResult] = useState<DocumentSummaryResult | null>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.LAST_RESULT);
    return stored || null;
  });

  // Persist files to session storage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FILES, files);
  }, [files]);

  // Persist progress to session storage
  useEffect(() => {
    if (currentProgress) {
      saveToStorage(STORAGE_KEYS.PROGRESS, currentProgress);
    } else {
      clearStorage(STORAGE_KEYS.PROGRESS);
    }
  }, [currentProgress]);

  // Persist last result to session storage
  useEffect(() => {
    if (lastResult) {
      saveToStorage(STORAGE_KEYS.LAST_RESULT, lastResult);
    }
  }, [lastResult]);

  // Set up progress callback
  useEffect(() => {
    documentSummaryService.setProgressCallback((progress: ProcessingProgress) => {
      setCurrentProgress(progress);
      
      // Update file statuses based on progress
      if (progress.currentFile) {
        setFiles(prev => prev.map(file => 
          file.file.name === progress.currentFile 
            ? { 
                ...file, 
                status: progress.stage as ProcessingFile['status'], 
                progress: progress.progress,
                error: progress.error 
              }
            : file
        ));
      } else {
        // Update all files with the same progress
        setFiles(prev => prev.map(file => ({
          ...file,
          status: progress.stage as ProcessingFile['status'],
          progress: progress.progress,
          error: progress.error
        })));
      }
    });
  }, []);

  // Add files to processing queue and start processing
  const addFiles = useCallback(async (newFiles: File[], options?: DocumentSummaryOptions) => {
    const processingFiles: ProcessingFile[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...processingFiles]);
    setIsProcessing(true);

    try {
      const result = await documentSummaryService.processDocuments(newFiles, options);
      setLastResult(result);

      if (result.success) {
        // Update files with results
        setFiles(prev => prev.map(file => {
          const processedDoc = result.documents.find(doc => doc.filename === file.file.name);
          if (processedDoc) {
            return {
              ...file,
              status: 'completed',
              progress: 100,
              summary: processedDoc.summary,
              wordCount: processedDoc.wordCount,
              processingTime: processedDoc.processingTime
            };
          }
          return file;
        }));

        toast.success(`Successfully processed ${result.documents.length} document(s)`);
      } else {
        setFiles(prev => prev.map(file => ({
          ...file,
          status: 'failed',
          error: result.error
        })));
        toast.error(`Processing failed: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'failed',
        error: errorMessage
      })));
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setCurrentProgress(null);
    }
  }, []);

  // Process files with WhatsApp delivery
  const processAndSendToWhatsApp = useCallback(async (
    newFiles: File[], 
    phoneNumber: string, 
    options?: Omit<DocumentSummaryOptions, 'sendToWhatsApp' | 'phoneNumber'>
  ) => {
    const fullOptions: DocumentSummaryOptions = {
      ...options,
      sendToWhatsApp: true,
      phoneNumber
    };

    await addFiles(newFiles, fullOptions);
  }, [addFiles]);

  // Send existing summaries to WhatsApp
  const sendToWhatsApp = useCallback(async (phoneNumber: string): Promise<WhatsAppDeliveryResult[] | null> => {
    const completedFiles = files.filter(file => file.status === 'completed' && file.summary);
    
    if (completedFiles.length === 0) {
      toast.error('No completed summaries to send');
      return null;
    }

    try {
      setIsProcessing(true);
      
      // Convert to ProcessedDocument format
      const documents: ProcessedDocument[] = completedFiles.map(file => ({
        id: file.id,
        filename: file.file.name,
        fileType: file.file.type,
        extractedText: '', // Not needed for WhatsApp sending
        summary: file.summary || '',
        wordCount: file.wordCount || 0,
        processingTime: file.processingTime || 0
      }));

      // Use the Twilio WhatsApp service directly to send existing summaries
      const { twilioWhatsAppService } = await import('@/lib/twilioWhatsAppService');
      
      if (!twilioWhatsAppService) {
        toast.error('Twilio WhatsApp service not configured');
        return null;
      }

      const deliveryResults = await twilioWhatsAppService.sendMultipleSummaries(phoneNumber, documents);
      
      toast.success(`Successfully sent ${completedFiles.length} summary${completedFiles.length > 1 ? 'ies' : ''} to ${phoneNumber}`);
      return deliveryResults;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send to WhatsApp';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  // Test WhatsApp connection
  const testWhatsAppConnection = useCallback(async () => {
    try {
      const result = await documentSummaryService.testWhatsAppConnection();
      if (result.success) {
        toast.success('WhatsApp connection is working!');
      } else {
        toast.error(`WhatsApp connection failed: ${result.error}`);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Send test message
  const sendTestMessage = useCallback(async (phoneNumber: string) => {
    try {
      const result = await documentSummaryService.sendTestMessage(phoneNumber);
      if (result.success) {
        toast.success(`Test message sent to ${phoneNumber}`);
      } else {
        toast.error(`Failed to send test message: ${result.error}`);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test message failed';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        phoneNumber,
        timestamp: Date.now()
      };
    }
  }, []);

  // Remove file from processing queue
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
    setCurrentProgress(null);
    setLastResult(null);
  }, []);

  // Get processing statistics
  const getStats = useCallback(() => {
    const total = files.length;
    const uploading = files.filter(f => f.status === 'uploading').length;
    const extracting = files.filter(f => f.status === 'extracting').length;
    const summarizing = files.filter(f => f.status === 'summarizing').length;
    const sending = files.filter(f => f.status === 'sending').length;
    const completed = files.filter(f => f.status === 'completed').length;
    const failed = files.filter(f => f.status === 'failed').length;

    return {
      total,
      uploading,
      extracting,
      summarizing,
      sending,
      completed,
      failed,
      inProgress: uploading + extracting + summarizing + sending
    };
  }, [files]);

  // Validate phone number for WhatsApp
  const validatePhoneNumber = useCallback((phone: string): boolean => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid international format (7-15 digits)
    if (cleaned.length < 7 || cleaned.length > 15) {
      return false;
    }
    
    // Should not start with 0 (international format)
    if (cleaned.startsWith('0')) {
      return false;
    }
    
    return true;
  }, []);

  // Get processing statistics from database
  const getProcessingStats = useCallback(async () => {
    try {
      return await documentSummaryService.getProcessingStats();
    } catch (error) {
      console.error('Failed to get processing stats:', error);
      return {
        totalDocuments: 0,
        totalSummaries: 0,
        avgProcessingTime: 0,
        successRate: 0
      };
    }
  }, []);

  // Generate PDF for a specific summary
  const generatePDF = useCallback(async (summaryId: string): Promise<string | null> => {
    try {
      // Find the file with the matching summary
      const file = files.find(f => f.id === summaryId && f.status === 'completed' && f.summary);
      
      if (!file) {
        toast.error('Summary not found or not completed');
        return null;
      }

      // Create a simple PDF blob with the summary content
      const pdfContent = `
        Document Summary Report
        =====================
        
        File: ${file.file.name}
        Processed: ${new Date().toLocaleString()}
        Word Count: ${file.wordCount || 0}
        Processing Time: ${file.processingTime ? Math.round(file.processingTime / 1000) : 0}s
        
        Summary:
        --------
        ${file.summary}
        
        Generated by ManuDocs AI
      `;

      // Create a blob and URL for download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.file.name.replace(/\.[^/.]+$/, '')}_summary.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success('Summary downloaded successfully');
      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
      toast.error(errorMessage);
      return null;
    }
  }, [files]);

  // Clear session storage on component unmount or manual clear
  const clearAllData = useCallback(() => {
    setFiles([]);
    setCurrentProgress(null);
    setLastResult(null);
    clearStorage(STORAGE_KEYS.FILES);
    clearStorage(STORAGE_KEYS.PROGRESS);
    clearStorage(STORAGE_KEYS.LAST_RESULT);
    toast.success('All data cleared');
  }, []);

  return {
    files,
    isProcessing,
    currentProgress,
    lastResult,
    addFiles,
    processAndSendToWhatsApp,
    removeFile,
    sendToWhatsApp,
    testWhatsAppConnection,
    sendTestMessage,
    clearFiles,
    clearAllData,
    getStats,
    getProcessingStats,
    validatePhoneNumber,
    generatePDF
  };
};