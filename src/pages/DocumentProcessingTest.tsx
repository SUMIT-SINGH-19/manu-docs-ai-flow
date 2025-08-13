import React from 'react';
import { DocumentProcessingDemo } from '@/components/DocumentProcessingDemo';

const DocumentProcessingTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Processing Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test the complete document processing pipeline with Gemini AI and WhatsApp integration.
            Upload documents, get AI summaries, and send them directly to WhatsApp.
          </p>
        </div>
        
        <DocumentProcessingDemo />
        
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900">1. Configure Environment Variables</h3>
                <p>Set up your <code className="bg-gray-100 px-1 rounded">.env</code> file with:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><code>VITE_GEMINI_API_KEY</code> - Your Google Gemini API key</li>
                  <li><code>VITE_WHATSAPP_ACCESS_TOKEN</code> - WhatsApp Business API access token</li>
                  <li><code>VITE_WHATSAPP_PHONE_NUMBER_ID</code> - Your WhatsApp phone number ID</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">2. Supported File Types</h3>
                <p>Upload any of these file types:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li><strong>PDF</strong> - Portable Document Format files</li>
                  <li><strong>DOCX</strong> - Microsoft Word documents</li>
                  <li><strong>TXT</strong> - Plain text files</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">3. WhatsApp Phone Number Format</h3>
                <p>Enter phone numbers in international format:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Include country code (e.g., +1 for US, +44 for UK)</li>
                  <li>No spaces or special characters</li>
                  <li>Example: <code>+1234567890</code></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">4. Processing Flow</h3>
                <ol className="list-decimal list-inside ml-4 mt-2">
                  <li>Upload documents (drag & drop or click to select)</li>
                  <li>Text extraction from files</li>
                  <li>AI summary generation using Gemini</li>
                  <li>Optional WhatsApp delivery</li>
                  <li>Results saved to database</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentProcessingTest;