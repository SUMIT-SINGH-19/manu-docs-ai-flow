import axios from 'axios';
import type { ProcessedDocument } from './documentProcessor';

export interface TwilioWhatsAppConfig {
    accountSid: string;
    authToken: string;
    whatsappNumber: string; // Format: whatsapp:+14155238886
}

export interface WhatsAppDeliveryResult {
    success: boolean;
    messageId?: string;
    error?: string;
    phoneNumber: string;
    timestamp: number;
}

export class TwilioWhatsAppService {
    private config: TwilioWhatsAppConfig;
    private baseUrl: string;

    constructor(config: TwilioWhatsAppConfig) {
        this.config = config;
        this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
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

        return true;
    }

    /**
     * Format phone number for Twilio WhatsApp API
     */
    formatPhoneNumber(phoneNumber: string): string {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');

        // Add country code if missing (assuming US +1 if no country code)
        if (cleaned.length === 10) {
            cleaned = '1' + cleaned;
        }

        // Return in whatsapp: format
        return `whatsapp:+${cleaned}`;
    }

    /**
     * Send text message via Twilio WhatsApp
     */
    async sendTextMessage(phoneNumber: string, message: string): Promise<WhatsAppDeliveryResult> {
        const formattedNumber = this.formatPhoneNumber(phoneNumber);

        if (!this.validatePhoneNumber(phoneNumber)) {
            return {
                success: false,
                error: 'Invalid phone number format',
                phoneNumber,
                timestamp: Date.now()
            };
        }

        const payload = new URLSearchParams({
            From: this.config.whatsappNumber,
            To: formattedNumber,
            Body: message
        });

        try {
            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: {
                    username: this.config.accountSid,
                    password: this.config.authToken
                }
            });

            return {
                success: true,
                messageId: response.data.sid,
                phoneNumber: formattedNumber,
                timestamp: Date.now()
            };
        } catch (error: any) {
            console.error('Twilio WhatsApp API error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
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
        const headerMessage = `📄 *ManuDocs AI - Document Summary Report*\n\nI've processed ${documents.length} document(s) for you. Here are the summaries:\n\n`;
        const headerResult = await this.sendTextMessage(phoneNumber, headerMessage);
        results.push(headerResult);

        // Send each document summary
        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];
            const message = this.formatSummaryMessage(document, i + 1, documents.length);

            // Add small delay between messages to avoid rate limiting
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay for Twilio
            }

            const result = await this.sendTextMessage(phoneNumber, message);
            results.push(result);
        }

        // Send footer message with stats
        const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0);
        const avgProcessingTime = documents.reduce((sum, doc) => sum + doc.processingTime, 0) / documents.length;

        const footerMessage = `\n✅ *Summary Complete!*\n\n📊 *Processing Stats:*\n• Total words processed: ${totalWords.toLocaleString()}\n• Average processing time: ${Math.round(avgProcessingTime / 1000)}s\n• Documents processed: ${documents.length}\n\nThank you for using ManuDocs AI! 🤖\n\n_Powered by Twilio WhatsApp Business API_`;

        const footerResult = await this.sendTextMessage(phoneNumber, footerMessage);
        results.push(footerResult);

        return results;
    }

    /**
     * Format document summary for WhatsApp message (Twilio format)
     */
    private formatSummaryMessage(document: ProcessedDocument, index?: number, total?: number): string {
        const header = index && total ? `📄 *Document ${index}/${total}*\n` : '📄 *Document Summary*\n';

        return `${header}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `📋 *${document.filename}*\n\n` +
            `📝 *Summary:*\n${document.summary}\n\n` +
            `📊 *Details:*\n` +
            `• Word count: ${document.wordCount.toLocaleString()}\n` +
            `• Processing time: ${Math.round(document.processingTime / 1000)}s\n` +
            `• File type: ${document.fileType}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    /**
     * Check Twilio WhatsApp API status
     */
    async checkStatus(): Promise<{ success: boolean; error?: string }> {
        try {
            // Test by getting account info
            const response = await axios.get(
                `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}.json`,
                {
                    auth: {
                        username: this.config.accountSid,
                        password: this.config.authToken
                    }
                }
            );

            if (response.data.status === 'active') {
                return { success: true };
            } else {
                return { success: false, error: `Account status: ${response.data.status}` };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Send a test message
     */
    async sendTestMessage(phoneNumber: string): Promise<WhatsAppDeliveryResult> {
        const testMessage = `🤖 *Test message from ManuDocs AI*\n\nYour Twilio WhatsApp integration is working correctly!\n\n📱 From: ${this.config.whatsappNumber}\n📅 Timestamp: ${new Date().toLocaleString()}\n\n_This is an automated test message._`;

        return await this.sendTextMessage(phoneNumber, testMessage);
    }
}

// Factory function to create Twilio WhatsApp service instance
export function createTwilioWhatsAppService(): TwilioWhatsAppService | null {
    const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const whatsappNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;

    // Check for placeholder values
    const isPlaceholder = (value: string) =>
        !value ||
        value.includes('your-') ||
        value.includes('placeholder') ||
        value.includes('ACxxxxxxxx') ||
        value.includes('xxxxxxxx');

    if (!accountSid || !authToken || !whatsappNumber ||
        isPlaceholder(accountSid) || isPlaceholder(authToken) || isPlaceholder(whatsappNumber)) {
        console.warn('Twilio WhatsApp credentials not configured properly. Please set VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, and VITE_TWILIO_WHATSAPP_NUMBER in your .env file');
        return null;
    }

    return new TwilioWhatsAppService({
        accountSid,
        authToken,
        whatsappNumber
    });
}

// Export singleton instance
export const twilioWhatsAppService = createTwilioWhatsAppService();