import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload as UploadIcon, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle,
  Bot,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Upload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
    simulateUpload();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false
  });

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return FileText;
    if (file.type.startsWith('image/')) return Image;
    return FileText;
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              Upload Your Invoice or Order Sheet
            </h1>
            <p className="text-text-secondary text-lg">
              Let our AI extract and process your export documentation automatically
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Upload Area */}
            <div className="lg:col-span-3">
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UploadIcon className="w-5 h-5 text-primary" />
                    <span>Document Upload</span>
                  </CardTitle>
                  <CardDescription>
                    Upload your invoice, order sheet, or any export document for AI processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Dropzone */}
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
                      isDragActive 
                        ? "border-primary bg-primary/5 scale-105" 
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    )}
                  >
                    <input {...getInputProps()} />
                    
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <UploadIcon className="w-8 h-8 text-primary" />
                      </div>
                      
                      {isDragActive ? (
                        <p className="text-lg font-medium text-primary">
                          Drop your files here...
                        </p>
                      ) : (
                        <div>
                          <p className="text-lg font-medium text-text-primary mb-2">
                            Drag & drop your files here, or click to browse
                          </p>
                          <div className="flex flex-wrap justify-center gap-2 mb-4">
                            <Badge variant="secondary">.PDF</Badge>
                            <Badge variant="secondary">.JPG</Badge>
                            <Badge variant="secondary">.PNG</Badge>
                          </div>
                          <p className="text-sm text-text-secondary">
                            Maximum file size: 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-3">
                      {uploadedFiles.map((file, index) => {
                        const FileIcon = getFileIcon(file);
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                            <div className="flex items-center space-x-3">
                              <FileIcon className="w-8 h-8 text-primary" />
                              <div>
                                <p className="font-medium text-text-primary">{file.name}</p>
                                <p className="text-sm text-text-secondary">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {uploadProgress === 100 ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : isUploading ? (
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Progress Bar */}
                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Uploading...</span>
                            <span className="text-text-primary font-medium">{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-4">
                        <Button 
                          variant="ai" 
                          size="lg" 
                          className="w-full"
                          disabled={isUploading || uploadProgress < 100}
                        >
                          <Bot className="w-5 h-5 mr-2" />
                          {isUploading ? "Processing..." : "Extract Data with AI"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Assistant Panel */}
            {showAIAssistant && (
              <div className="lg:col-span-1">
                <Card className="shadow-medium border-0 bg-gradient-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-ai-accent-foreground" />
                        <CardTitle className="text-ai-accent-foreground text-base">
                          AI Assistant
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-ai-accent-foreground hover:bg-white/20"
                        onClick={() => setShowAIAssistant(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-ai-accent-foreground/90 space-y-3">
                      <p className="font-medium">💡 Quick Tips:</p>
                      <ul className="space-y-2 text-xs">
                        <li>• Upload clear, high-quality scans</li>
                        <li>• Ensure all text is readable</li>
                        <li>• PDF format works best</li>
                        <li>• Include complete invoice data</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/20 rounded-lg p-3 text-sm text-ai-accent-foreground">
                      <p className="font-medium mb-1">Need help?</p>
                      <p className="text-xs opacity-90">
                        Our AI can process invoices, purchase orders, and shipping documents automatically.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}