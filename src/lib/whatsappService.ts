import axios from 'axios';
import type { ProcessedDocument } from './documentProcessor';

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  version?: string;
}

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'document';
  text?: {
    body: string;
  };
  document?: {
    link: string;
    filename: string;
    caption?: string;
  };
}

export interface WhatsAppDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  phoneNumber: string;
  timestamp: number;
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    this.config = {
      version: 'v18.0',
      ...config
    };
    this.baseUrl = `https://graph.facebook.com/${this.config.version}/${this.config.phoneNumberId}/messages`;
  }

  /**
   * Validate phone number format for WhatsApp
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid international format (7-15 digits)
    if (cleaned.length < 7 || cleaned.length > 15) {
      return false;
    }
    
    // Should not start with 0 (international format)
    if (cleaned.startsWith('0')) {
      return false;
    }
    
    return true;
  }

  /**
   * Format phone number for WhatsApp API
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if missing (assuming US +1 if no country code)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Send text message via WhatsApp
   */
  async sendTextMessage(phoneNumber: string, message: string): Promise<WhatsAppDeliveryResult> {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    
    if (!this.validatePhoneNumber(formattedNumber)) {
      return {
        success: false,
        error: 'Invalid phone number format',
        phoneNumber,
        timestamp: Date.now()
      };
    }

    const payload: WhatsAppMessage = {
      to: formattedNumber,
      type: 'text',
      text: {
        body: message
      }
    };

    try {
      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages[0]?.id,
        phoneNumber: formattedNumber,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('WhatsApp API error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        phoneNumber: formattedNumber,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Send document summary to WhatsApp
   */
  async sendDocumentSummary(phoneNumber: string, document: ProcessedDocument): Promise<WhatsAppDeliveryResult> {
    const message = this.formatSummaryMessage(document);
    return await this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send multiple document summaries to WhatsApp
   */
  async sendMultipleSummaries(phoneNumber: string, documents: ProcessedDocument[]): Promise<WhatsAppDeliveryResult[]> {
    const results: WhatsAppDeliveryResult[] = [];
    
    // Send a header message
    const headerMessage = `📄 Document Summary Report\n\nI've processed ${documents.length} document(s) for you. Here are the summaries:\n\n`;
    const headerResult = await this.sendTextMessage(phoneNumber, headerMessage);
    results.push(headerResult);

    // Send each document summary
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      const message = this.formatSummaryMessage(document, i + 1, documents.length);
      
      // Add small delay between messages to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const result = await this.sendTextMessage(phoneNumber, message);
      results.push(result);
    }

    // Send footer message with stats
    const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0);
    const avgProcessingTime = documents.reduce((sum, doc) => sum + doc.processingTime, 0) / documents.length;
    
    const footerMessage = `\n✅ Summary Complete!\n\n📊 Processing Stats:\n• Total words processed: ${totalWords.toLocaleString()}\n• Average processing time: ${Math.round(avgProcessingTime / 1000)}s\n• Documents processed: ${documents.length}\n\nThank you for using our AI document summary service! 🤖`;
    
    const footerResult = await this.sendTextMessage(phoneNumber, footerMessage);
    results.push(footerResult);

    return results;
  }

  /**
   * Format document summary for WhatsApp message
   */
  private formatSummaryMessage(document: ProcessedDocument, index?: number, total?: number): string {
    const header = index && total ? `📄 Document ${index}/${total}\n` : '📄 Document Summary\n';
    
    return `${header}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
           `📋 **${document.filename}**\n\n` +
           `📝 **Summary:**\n${document.summary}\n\n` +
           `📊 **Details:**\n` +
           `• Word count: ${document.wordCount.toLocaleString()}\n` +
           `• Processing time: ${Math.round(document.processingTime / 1000)}s\n` +
           `• File type: ${document.fileType}\n\n` +
           `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }

  /**
   * Check WhatsApp API status
   */
  async checkStatus(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.config.version}/${this.config.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

// Factory function to create WhatsApp service instance
export function createWhatsAppService(): WhatsAppService | null {
  const accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

  // Check for placeholder values
  const isPlaceholder = (value: string) => 
    !value || 
    value === 'your-whatsapp-access-token-here' || 
    value === 'your-phone-number-id-here' ||
    value.includes('your-') ||
    value.includes('placeholder');

  if (!accessToken || !phoneNumberId || isPlaceholder(accessToken) || isPlaceholder(phoneNumberId)) {
    console.warn('WhatsApp credentials not configured properly. Please set valid VITE_WHATSAPP_ACCESS_TOKEN and VITE_WHATSAPP_PHONE_NUMBER_ID in your .env file');
    return null;
  }

  return new WhatsAppService({
    accessToken,
    phoneNumberId
  });
}

// Export singleton instance
export const whatsappService = createWhatsAppService();