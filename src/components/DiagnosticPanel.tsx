import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  MessageCircle, 
  Database, 
  Cloud, 
  Bot,
  FileText,
  Settings,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { twilioWhatsAppService } from '@/lib/twilioWhatsAppService';
import { documentSummaryService } from '@/lib/documentSummaryService';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'testing';
  message: string;
  details?: string;
}

export const DiagnosticPanel = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('+919491392074');

  const updateResult = (name: string, status: DiagnosticResult['status'], message: string, details?: string) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      const newResult = { name, status, message, details };
      
      if (existing) {
        return prev.map(r => r.name === name ? newResult : r);
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Environment Variables
    updateResult('Environment Variables', 'testing', 'Checking configuration...');
    
    const envVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
      VITE_TWILIO_ACCOUNT_SID: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
      VITE_TWILIO_AUTH_TOKEN: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
      VITE_TWILIO_WHATSAPP_NUMBER: import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER
    };

    const missingVars = Object.entries(envVars).filter(([key, value]) => 
      !value || 
      value.includes('your-') || 
      value.includes('placeholder') ||
      value === 'your-supabase-anon-key-here' ||
      value === 'your-whatsapp-access-token-here' ||
      value === 'your-phone-number-id-here'
    );

    if (missingVars.length === 0) {
      updateResult('Environment Variables', 'success', 'All environment variables configured');
    } else {
      updateResult('Environment Variables', 'error', 
        `Missing or placeholder values: ${missingVars.map(([key]) => key).join(', ')}`,
        'Please update your .env file with actual API credentials'
      );
    }

    // Test 2: Supabase Connection
    updateResult('Supabase Connection', 'testing', 'Testing database connection...');
    
    try {
      const { data, error } = await supabase.from('documents').select('count').limit(1);
      if (error) throw error;
      updateResult('Supabase Connection', 'success', 'Database connection working');
    } catch (error: any) {
      updateResult('Supabase Connection', 'error', 
        'Database connection failed', 
        error.message
      );
    }

    // Test 3: Storage Buckets
    updateResult('Storage Buckets', 'testing', 'Checking storage configuration...');
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      
      const requiredBuckets = ['documents', 'docs'];
      const existingBuckets = buckets.map(b => b.name);
      const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
      
      if (missingBuckets.length === 0) {
        updateResult('Storage Buckets', 'success', 'All storage buckets exist');
      } else {
        updateResult('Storage Buckets', 'warning', 
          `Missing buckets: ${missingBuckets.join(', ')}`,
          'Some file operations may fail'
        );
      }
    } catch (error: any) {
      updateResult('Storage Buckets', 'error', 
        'Storage check failed', 
        error.message
      );
    }

    // Test 4: Gemini AI API
    updateResult('Gemini AI API', 'testing', 'Testing AI service...');
    
    try {
      const testFile = new File(['This is a test document for AI processing.'], 'test.txt', { type: 'text/plain' });
      const { documentProcessor } = await import('@/lib/documentProcessor');
      
      const result = await documentProcessor.processDocument(testFile, {
        maxLength: 100,
        style: 'concise'
      });
      
      if (result.summary) {
        updateResult('Gemini AI API', 'success', 'AI processing working');
      } else {
        updateResult('Gemini AI API', 'error', 'AI processing failed - no summary generated');
      }
    } catch (error: any) {
      updateResult('Gemini AI API', 'error', 
        'AI service failed', 
        error.message
      );
    }

    // Test 5: Twilio WhatsApp Service
    updateResult('Twilio WhatsApp Service', 'testing', 'Testing Twilio WhatsApp integration...');
    
    if (!twilioWhatsAppService) {
      updateResult('Twilio WhatsApp Service', 'error', 
        'Twilio WhatsApp service not initialized',
        'Check VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, and VITE_TWILIO_WHATSAPP_NUMBER'
      );
    } else {
      try {
        const status = await twilioWhatsAppService.checkStatus();
        if (status.success) {
          updateResult('Twilio WhatsApp Service', 'success', 'Twilio WhatsApp API connection working');
        } else {
          updateResult('Twilio WhatsApp Service', 'error', 
            'Twilio WhatsApp API connection failed',
            status.error
          );
        }
      } catch (error: any) {
        updateResult('Twilio WhatsApp Service', 'error', 
          'Twilio WhatsApp service error',
          error.message
        );
      }
    }

    // Test 6: File Upload Test
    updateResult('File Upload Test', 'testing', 'Testing file upload...');
    
    try {
      const testFile = new File(['Test content'], 'diagnostic-test.txt', { type: 'text/plain' });
      const fileName = `diagnostic-test-${Date.now()}.txt`;
      
      // Try uploading to docs bucket first
      const { data, error } = await supabase.storage
        .from('docs')
        .upload(`test/${fileName}`, testFile);
      
      if (error) {
        // Try documents bucket as fallback
        const fallbackResult = await supabase.storage
          .from('documents')
          .upload(`test/${fileName}`, testFile);
        
        if (fallbackResult.error) {
          throw fallbackResult.error;
        }
        
        updateResult('File Upload Test', 'warning', 
          'Upload works with documents bucket only',
          'Consider standardizing bucket names'
        );
        
        // Clean up
        await supabase.storage.from('documents').remove([`test/${fileName}`]);
      } else {
        updateResult('File Upload Test', 'success', 'File upload working');
        
        // Clean up
        await supabase.storage.from('docs').remove([`test/${fileName}`]);
      }
    } catch (error: any) {
      updateResult('File Upload Test', 'error', 
        'File upload failed',
        error.message
      );
    }

    setIsRunning(false);
  };

  const sendTestMessage = async () => {
    if (!twilioWhatsAppService) {
      toast.error('Twilio WhatsApp service not configured');
      return;
    }

    if (!testPhoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      const result = await documentSummaryService.sendTestMessage(testPhoneNumber);
      if (result.success) {
        toast.success(`Test message sent to ${testPhoneNumber}`);
      } else {
        toast.error(`Failed to send test message: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Test message failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'testing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="w-5 h-5" />
            <span>System Diagnostics</span>
          </CardTitle>
          <CardDescription>
            Run comprehensive tests to identify and resolve system issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Run Full Diagnostic
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <h3 className="font-medium">Diagnostic Results</h3>
              
              {results.map((result, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{result.name}</h4>
                      <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-xs text-gray-600 mt-1">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Test Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <span>WhatsApp Test</span>
          </CardTitle>
          <CardDescription>
            Send a test message to verify WhatsApp integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-phone">Test Phone Number</Label>
            <Input
              id="test-phone"
              placeholder="+1234567890"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={sendTestMessage}
            disabled={!twilioWhatsAppService || !testPhoneNumber}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Test Message
          </Button>

          {!twilioWhatsAppService && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Twilio WhatsApp service not configured. Please check your Twilio environment variables.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Fixes */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Fixes</CardTitle>
          <CardDescription>
            Common solutions for identified issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-red-600">🚨 Document Preview/Download Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Check storage bucket configuration in Supabase</li>
                <li>Ensure files are uploaded to the correct bucket</li>
                <li>Verify storage policies allow public access</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-red-600">🚨 Twilio WhatsApp Integration Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Get Twilio credentials from console.twilio.com</li>
                <li>Update VITE_TWILIO_ACCOUNT_SID in .env</li>
                <li>Update VITE_TWILIO_AUTH_TOKEN in .env</li>
                <li>Update VITE_TWILIO_WHATSAPP_NUMBER in .env</li>
                <li>Verify Twilio WhatsApp sandbox is configured</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-amber-600">⚠️ AI Processing Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Verify VITE_GEMINI_API_KEY is valid</li>
                <li>Check Gemini API quota and billing</li>
                <li>Ensure file formats are supported (PDF, DOCX, TXT)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};