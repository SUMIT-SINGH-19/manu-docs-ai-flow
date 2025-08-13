import React, { useState } from 'react';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Send, TestTube, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export const DocumentProcessingDemo: React.FC = () => {
  const {
    files,
    isProcessing,
    currentProgress,
    addFiles,
    processAndSendToWhatsApp,
    sendToWhatsApp,
    testWhatsAppConnection,
    sendTestMessage,
    removeFile,
    clearFiles,
    getStats,
    validatePhoneNumber
  } = useDocumentProcessing();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [summaryOptions, setSummaryOptions] = useState({
    maxLength: 500,
    language: 'English',
    style: 'concise' as 'concise' | 'detailed' | 'bullet-points'
  });

  const stats = getStats();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles, summaryOptions);
    }
  };

  const handleProcessAndSend = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid phone number (international format)');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.docx,.txt';
    input.onchange = (e) => {
      const selectedFiles = Array.from((e.target as HTMLInputElement).files || []);
      if (selectedFiles.length > 0) {
        processAndSendToWhatsApp(selectedFiles, phoneNumber, summaryOptions);
      }
    };
    input.click();
  };

  const handleSendExisting = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid phone number (international format)');
      return;
    }

    await sendToWhatsApp(phoneNumber);
  };

  const handleTestConnection = async () => {
    await testWhatsAppConnection();
  };

  const handleSendTestMessage = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid phone number (international format)');
      return;
    }

    await sendTestMessage(phoneNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'uploading': return 'bg-blue-500';
      case 'extracting': return 'bg-yellow-500';
      case 'summarizing': return 'bg-purple-500';
      case 'sending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Processing with Gemini AI & WhatsApp
          </CardTitle>
          <CardDescription>
            Upload documents, get AI summaries using Google Gemini, and send them via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Summary Length</label>
              <Input
                type="number"
                value={summaryOptions.maxLength}
                onChange={(e) => setSummaryOptions(prev => ({ ...prev, maxLength: parseInt(e.target.value) }))}
                min={100}
                max={1000}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Language</label>
              <select
                className="w-full p-2 border rounded-md"
                value={summaryOptions.language}
                onChange={(e) => setSummaryOptions(prev => ({ ...prev, language: e.target.value }))}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Style</label>
              <select
                className="w-full p-2 border rounded-md"
                value={summaryOptions.style}
                onChange={(e) => setSummaryOptions(prev => ({ ...prev, style: e.target.value as any }))}
              >
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
                <option value="bullet-points">Bullet Points</option>
              </select>
            </div>
          </div>

          <Separator />

          {/* WhatsApp Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">WhatsApp Configuration</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter WhatsApp number (e.g., +1234567890)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTestConnection} variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              <Button onClick={handleSendTestMessage} variant="outline" disabled={!phoneNumber}>
                Send Test
              </Button>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => document.getElementById('file-upload')?.click()} disabled={isProcessing}>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Process Files
            </Button>
            <Button onClick={handleProcessAndSend} disabled={isProcessing || !phoneNumber} variant="secondary">
              <Send className="h-4 w-4 mr-2" />
              Process & Send to WhatsApp
            </Button>
            <Button onClick={handleSendExisting} disabled={stats.completed === 0 || !phoneNumber} variant="outline">
              Send Existing Summaries
            </Button>
            <Button onClick={clearFiles} disabled={files.length === 0} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Current Progress */}
          {currentProgress && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentProgress.message}</span>
                    <span>{currentProgress.progress}%</span>
                  </div>
                  <Progress value={currentProgress.progress} />
                  {currentProgress.currentFile && (
                    <p className="text-xs text-muted-foreground">
                      Processing: {currentProgress.currentFile}
                    </p>
                  )}
                  {currentProgress.error && (
                    <p className="text-xs text-red-500">
                      Error: {currentProgress.error}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          {files.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                    <div className="text-xs text-muted-foreground">Processing</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.extracting}</div>
                    <div className="text-xs text-muted-foreground">Extracting</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.summarizing}</div>
                    <div className="text-xs text-muted-foreground">Summarizing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{file.file.name}</span>
                          <Badge className={getStatusColor(file.status)}>
                            {file.status}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-2" />
                        </div>
                        {file.summary && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Summary:</strong> {file.summary.substring(0, 200)}...
                          </div>
                        )}
                        {file.error && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                            <strong>Error:</strong> {file.error}
                          </div>
                        )}
                        {file.wordCount && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Words: {file.wordCount.toLocaleString()} | 
                            Processing time: {file.processingTime ? Math.round(file.processingTime / 1000) : 0}s
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => removeFile(file.id)}
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};