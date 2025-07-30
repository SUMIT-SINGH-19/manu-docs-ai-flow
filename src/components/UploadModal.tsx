import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Image, 
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedData?: any;
  error?: string;
}

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'uploading' as const,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and AI processing
    newFiles.forEach((uploadedFile) => {
      simulateUpload(uploadedFile);
    });
  }, []);

  const simulateUpload = async (uploadedFile: UploadedFile) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, progress }
            : f
        )
      );
    }

    // Switch to processing
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'processing', progress: 0 }
          : f
      )
    );

    // Simulate AI processing
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, progress }
            : f
        )
      );
    }

    // Complete with extracted data
    const mockExtractedData = {
      invoiceNumber: "INV-2024-001",
      exporterName: "ABC Exports Pvt Ltd",
      portOfExport: "MUMBAI",
      totalValue: "₹2,50,000",
      itemCount: 3
    };

    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              extractedData: mockExtractedData
            }
          : f
      )
    );

    toast({
      title: "Document processed successfully",
      description: `Extracted data from ${uploadedFile.file.name}`,
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
      case 'docx':
        return FileText;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return Image;
      default:
        return FileText;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      case 'uploading':
      case 'processing':
        return Loader2;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'uploading':
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload your invoice, order sheet, or other export documents for AI-powered data extraction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-text-secondary mb-4">
              or click to browse from your computer
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="outline">.PDF</Badge>
              <Badge variant="outline">.JPG</Badge>
              <Badge variant="outline">.PNG</Badge>
              <Badge variant="outline">.DOCX</Badge>
            </div>
            <p className="text-xs text-text-secondary">
              Maximum file size: 10MB per file
            </p>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-text-primary">Uploaded Files</h4>
              {uploadedFiles.map((uploadedFile) => {
                const FileIcon = getFileIcon(uploadedFile.file.name);
                const StatusIcon = getStatusIcon(uploadedFile.status);
                
                return (
                  <div
                    key={uploadedFile.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <FileIcon className="w-8 h-8 text-text-secondary mt-1" />
                        <div className="flex-1">
                          <h5 className="font-medium text-text-primary text-sm">
                            {uploadedFile.file.name}
                          </h5>
                          <p className="text-xs text-text-secondary">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIcon 
                          className={`w-5 h-5 ${getStatusColor(uploadedFile.status)} ${
                            uploadedFile.status === 'uploading' || uploadedFile.status === 'processing' 
                              ? 'animate-spin' 
                              : ''
                          }`} 
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(uploadedFile.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                      <div className="space-y-2">
                        <Progress value={uploadedFile.progress} className="h-2" />
                        <p className="text-xs text-text-secondary">
                          {uploadedFile.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                          {' '}({uploadedFile.progress}%)
                        </p>
                      </div>
                    )}

                    {/* Extracted Data Preview */}
                    {uploadedFile.status === 'completed' && uploadedFile.extractedData && (
                      <div className="bg-accent rounded-lg p-3 space-y-2">
                        <h6 className="text-xs font-medium text-text-primary">Extracted Data:</h6>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Invoice #: {uploadedFile.extractedData.invoiceNumber}</div>
                          <div>Exporter: {uploadedFile.extractedData.exporterName}</div>
                          <div>Port: {uploadedFile.extractedData.portOfExport}</div>
                          <div>Value: {uploadedFile.extractedData.totalValue}</div>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {uploadedFile.status === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs text-red-800">
                          {uploadedFile.error || 'Failed to process file'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              disabled={uploadedFiles.length === 0 || uploadedFiles.some(f => f.status !== 'completed')}
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};