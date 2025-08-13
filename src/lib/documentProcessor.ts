import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';

// PDF parsing function - we'll implement a simple version
const parsePDF = async (buffer: ArrayBuffer): Promise<string> => {
  try {
    // Try to use pdf-parse if available
    const pdfParse = await import('pdf-parse');
    const data = await pdfParse.default(buffer);
    return data.text;
  } catch (error) {
    // Fallback: basic text extraction attempt
    const text = new TextDecoder().decode(buffer);
    // Very basic PDF text extraction - this is a fallback
    const matches = text.match(/BT\s*(.*?)\s*ET/g);
    if (matches) {
      return matches.map(match => match.replace(/BT\s*|\s*ET/g, '')).join(' ');
    }
    throw new Error('PDF parsing library not available. Please install pdf-parse or use TXT/DOCX files.');
  }
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyA7vRsB78F8a92J4VdnE5imVd4-TpO3Xfc');

export interface ProcessedDocument {
  id: string;
  filename: string;
  fileType: string;
  extractedText: string;
  summary: string;
  wordCount: number;
  processingTime: number;
}

export class DocumentProcessor {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Extract text from different file types
   */
  async extractText(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();
    
    try {
      if (fileType.includes('pdf')) {
        return await this.extractFromPDF(file);
      } else if (fileType.includes('word') || fileType.includes('document') || file.name.endsWith('.docx')) {
        return await this.extractFromDOCX(file);
      } else if (fileType.includes('text') || file.name.endsWith('.txt')) {
        return await this.extractFromTXT(file);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Text extraction failed:', error);
      throw new Error(`Failed to extract text from ${file.name}: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  private async extractFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = await parsePDF(arrayBuffer);
      return text.trim();
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX files
   */
  private async extractFromDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  }

  /**
   * Extract text from TXT files
   */
  private async extractFromTXT(file: File): Promise<string> {
    return await file.text();
  }

  /**
   * Generate AI summary using Gemini
   */
  async generateSummary(text: string, options?: {
    maxLength?: number;
    language?: string;
    style?: 'concise' | 'detailed' | 'bullet-points';
  }): Promise<string> {
    const { maxLength = 500, language = 'English', style = 'concise' } = options || {};
    
    const prompt = this.buildSummaryPrompt(text, maxLength, language, style);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Build the prompt for Gemini API
   */
  private buildSummaryPrompt(text: string, maxLength: number, language: string, style: string): string {
    const styleInstructions = {
      'concise': 'Create a concise, paragraph-style summary',
      'detailed': 'Create a detailed summary with key points and context',
      'bullet-points': 'Create a summary using bullet points for easy reading'
    };

    return `
Please analyze the following document and create a ${style} summary in ${language}.

Requirements:
- Maximum length: ${maxLength} words
- ${styleInstructions[style]}
- Focus on the main ideas, key findings, and important conclusions
- Maintain the original context and meaning
- Use clear, professional language

Document text:
${text}

Summary:`;
  }

  /**
   * Process complete document workflow
   */
  async processDocument(file: File, options?: {
    maxLength?: number;
    language?: string;
    style?: 'concise' | 'detailed' | 'bullet-points';
  }): Promise<ProcessedDocument> {
    const startTime = Date.now();
    
    try {
      // Extract text from file
      const extractedText = await this.extractText(file);
      
      if (!extractedText || extractedText.length < 50) {
        throw new Error('Document appears to be empty or too short to summarize');
      }

      // Generate summary using Gemini
      const summary = await this.generateSummary(extractedText, options);
      
      const processingTime = Date.now() - startTime;
      const wordCount = extractedText.split(/\s+/).length;

      return {
        id: crypto.randomUUID(),
        filename: file.name,
        fileType: file.type,
        extractedText,
        summary,
        wordCount,
        processingTime
      };
    } catch (error) {
      console.error('Document processing failed:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple documents
   */
  async processDocuments(files: File[], options?: {
    maxLength?: number;
    language?: string;
    style?: 'concise' | 'detailed' | 'bullet-points';
  }): Promise<ProcessedDocument[]> {
    const results: ProcessedDocument[] = [];
    
    for (const file of files) {
      try {
        const processed = await this.processDocument(file, options);
        results.push(processed);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        // Continue with other files even if one fails
        results.push({
          id: crypto.randomUUID(),
          filename: file.name,
          fileType: file.type,
          extractedText: '',
          summary: `Error processing document: ${error.message}`,
          wordCount: 0,
          processingTime: 0
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();