/**
 * N8N Webhook Service for Document Processing
 * Handles document upload and processing via n8n webhook
 */

export interface N8NDocumentRequest {
  files: File[];
  phoneNumber?: string;
  options?: {
    language?: string;
    style?: 'concise' | 'detailed' | 'bullet-points';
    maxLength?: number;
  };
}

export interface N8NDocumentResponse {
  success: boolean;
  message: string;
  documents?: {
    id: string;
    filename: string;
    summary: string;
    wordCount: number;
    processingTime: number;
  }[];
  whatsappDelivery?: {
    success: boolean;
    messageId?: string;
    error?: string;
  };
  error?: string;
}

export class N8NWebhookService {
  private webhookUrl = 'https://karthikeya007.app.n8n.cloud/webhook/pdf-summary';

  /**
   * Send single document to n8n webhook for processing
   */
  async processDocuments(request: N8NDocumentRequest): Promise<N8NDocumentResponse> {
    try {
      // Only process the first file (single file processing)
      const file = request.files[0];
      if (!file) {
        throw new Error('No file provided for processing');
      }

      // Create FormData to send file as "data"
      const formData = new FormData();
      
      // Add file as "data" parameter
      formData.append('data', file, file.name);
      
      // Add metadata
      if (request.phoneNumber) {
        formData.append('phoneNumber', request.phoneNumber);
      }
      
      if (request.options) {
        formData.append('options', JSON.stringify(request.options));
      }
      
      // Add timestamp and session info
      formData.append('timestamp', new Date().toISOString());
      formData.append('sessionId', crypto.randomUUID());
      formData.append('filename', file.name);
      formData.append('fileType', file.type);
      formData.append('fileSize', file.size.toString());

      console.log('Sending document to n8n webhook:', {
        url: this.webhookUrl,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        phoneNumber: request.phoneNumber,
        options: request.options
      });

      // Send to n8n webhook with extended timeout for processing
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          // Don't set Content-Type header - let browser set it with boundary for FormData
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`N8N webhook error: HTTP ${response.status} - ${response.statusText}`);
      }

      const result = await response.json() as N8NDocumentResponse;
      
      console.log('N8N webhook response:', result);
      
      // Check if N8N returned an error in the response body
      if (!result.success) {
        throw new Error(result.error || result.message || 'N8N processing failed');
      }
      
      return result;

    } catch (error) {
      console.error('N8N webhook error:', error);
      
      return {
        success: false,
        message: 'Failed to process document via n8n webhook',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Test the n8n webhook connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Send a simple test request
      const testData = new FormData();
      testData.append('test', 'true');
      testData.append('timestamp', new Date().toISOString());

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        body: testData
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error! status: ${response.status} - ${response.statusText}`
        };
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Send a test document to n8n webhook
   */
  async sendTestDocument(phoneNumber: string): Promise<N8NDocumentResponse> {
    // Create a simple test text file
    const testContent = `Test Document for N8N Integration

This is a test document to verify the n8n webhook integration is working correctly.

Key Information:
- Timestamp: ${new Date().toLocaleString()}
- Phone Number: ${phoneNumber}
- Integration: N8N Webhook
- Purpose: Testing document processing and WhatsApp delivery

The n8n workflow should:
1. Receive this document as "data" parameter
2. Process it and generate a summary
3. Send the summary to the provided WhatsApp number

If you receive this message on WhatsApp, the integration is working correctly!`;

    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const file = new File([testBlob], 'test-document.txt', { type: 'text/plain' });

    return await this.processDocuments({
      files: [file],
      phoneNumber,
      options: {
        language: 'en',
        style: 'detailed'
      }
    });
  }
}

// Export singleton instance
export const n8nWebhookService = new N8NWebhookService();