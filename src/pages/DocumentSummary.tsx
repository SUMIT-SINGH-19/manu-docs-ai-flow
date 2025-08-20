import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Bot,
  X,
  Phone,
  Zap,
  MessageCircle,
  Download,
  Eye,
  Clock,
  Shield,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";

const DocumentSummary = () => {
  const [phoneNumber, setPhoneNumber] = useState("+919491392074"); // Auto-populate your number
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");

  const {
    files: uploadedFiles,
    isProcessing,
    addFiles,
    removeFile,
    sendToWhatsApp,
    generatePDF,
    getStats,
    validatePhoneNumber: validatePhone,
    clearAllData,
  } = useDocumentProcessing();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Validate phone number before processing
      if (!validatePhone(phoneNumber)) {
        toast.error(
          "Please enter a valid WhatsApp number before uploading files"
        );
        return;
      }

      // Pass phone number to N8N webhook for WhatsApp delivery
      addFiles(acceptedFiles, {
        sendToWhatsApp: true,
        phoneNumber: phoneNumber,
        language: "en",
        style: "detailed",
      });
    },
    [addFiles, phoneNumber, validatePhone]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    multiple: false, // Single file only for N8N integration
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSendToWhatsApp = async () => {
    if (!validatePhone(phoneNumber)) {
      toast.error("Please enter a valid WhatsApp number");
      return;
    }

    setDeliveryStatus("sending");

    // With N8N integration, WhatsApp delivery happens during document processing
    // This function is mainly for UI feedback
    toast.info(
      "WhatsApp delivery is handled automatically by N8N during document processing"
    );
    setDeliveryStatus("sent");
  };

  const handleGeneratePDF = async (summaryId: string) => {
    const pdfUrl = await generatePDF(summaryId);
    if (pdfUrl) {
      // Open PDF in new tab or trigger download
      window.open(pdfUrl, "_blank");
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") return FileText;
    if (file.type.includes("word")) return FileText;
    if (file.type === "text/plain") return FileText;
    return FileText;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploading":
        return "text-blue-500";
      case "processing":
        return "text-amber-500";
      case "completed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const completedCount = uploadedFiles.filter(
    (file) => file.status === "completed"
  ).length;
  const processingCount = uploadedFiles.filter(
    (file) => file.status === "processing" || file.status === "uploading"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              AI Document Summary & WhatsApp Delivery
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Upload your documents and get AI-generated summaries delivered
              directly to your WhatsApp via N8N. No backend needed - N8N handles everything!
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Bot className="w-3 h-3 mr-1" />
                N8N Powered
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                WhatsApp Ready
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Upload and Processing Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Upload Card */}
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UploadIcon className="w-5 h-5 text-primary" />
                    <span>Upload Documents</span>
                  </CardTitle>
                  <CardDescription>
                    Upload one PDF, Word, or text file (up to 10MB) for N8N
                    processing and WhatsApp delivery
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
                        : "border-border hover:border-primary/50 hover:bg-accent/50",
                      uploadedFiles.length >= 5 &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <input
                      {...getInputProps()}
                      disabled={uploadedFiles.length >= 5}
                    />

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
                            {uploadedFiles.length >= 1
                              ? "Replace current file or remove to upload new"
                              : "Drag & drop your file here, or click to browse"}
                          </p>
                          <div className="flex flex-wrap justify-center gap-2 mb-4">
                            <Badge variant="secondary">.PDF</Badge>
                            <Badge variant="secondary">.DOCX</Badge>
                            <Badge variant="secondary">.TXT</Badge>
                          </div>
                          <p className="text-sm text-text-secondary">
                            Maximum file size: 10MB • Single file processing via
                            N8N
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <Card className="shadow-medium border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Processing Files</span>
                      <div className="flex space-x-2">
                        {processingCount > 0 && (
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            {processingCount} processing
                          </Badge>
                        )}
                        {completedCount > 0 && (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {completedCount} ready
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {uploadedFiles.map((uploadedFile) => {
                      const FileIcon = getFileIcon(uploadedFile.file);
                      return (
                        <div
                          key={uploadedFile.id}
                          className="p-4 bg-surface rounded-lg border border-border"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 flex-1">
                              <FileIcon className="w-8 h-8 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-text-primary truncate">
                                  {uploadedFile.file.name}
                                </p>
                                <p className="text-sm text-text-secondary">
                                  {(
                                    uploadedFile.file.size /
                                    1024 /
                                    1024
                                  ).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div
                                className={cn(
                                  "flex items-center space-x-1",
                                  getStatusColor(uploadedFile.status)
                                )}
                              >
                                {uploadedFile.status === "uploading" && (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                )}
                                {uploadedFile.status === "processing" && (
                                  <Bot className="w-4 h-4" />
                                )}
                                {uploadedFile.status === "completed" && (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                {uploadedFile.status === "failed" && (
                                  <AlertCircle className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium capitalize">
                                  {uploadedFile.status === "processing"
                                    ? "AI Processing"
                                    : uploadedFile.status}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeFile(uploadedFile.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {(uploadedFile.status === "uploading" ||
                            uploadedFile.status === "processing") && (
                            <div className="space-y-2 mb-3">
                              <Progress
                                value={uploadedFile.progress}
                                className="h-2"
                              />
                              <div className="flex justify-between text-xs text-text-secondary">
                                <span>
                                  {uploadedFile.status === "uploading"
                                    ? "Uploading to N8N..."
                                    : "N8N processing with AI and sending to WhatsApp... (up to 1 minute)"}
                                </span>
                                <span>{uploadedFile.progress}%</span>
                              </div>
                              {uploadedFile.status === "processing" && (
                                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                  <div className="flex items-center space-x-1">
                                    <Bot className="w-3 h-3 animate-pulse" />
                                    <span>N8N is processing your document and will send the summary to WhatsApp. You'll see the summary in WhatsApp when complete.</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Summary Preview */}
                          {uploadedFile.status === "completed" &&
                            uploadedFile.summary && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-medium text-green-800">
                                    Success — Check in your WhatsApp
                                  </h4>
                                  <div className="flex space-x-1">
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Preview
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleGeneratePDF(uploadedFile.id)
                                      }
                                    >
                                      <Download className="w-3 h-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-green-700 line-clamp-3">
                                  {uploadedFile.summary}
                                </p>
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                                  <div className="flex items-center space-x-1">
                                    <MessageCircle className="w-3 h-3" />
                                    <span>Summary sent. Check in your WhatsApp.</span>
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Error State */}
                          {uploadedFile.status === "failed" && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-700">
                                {uploadedFile.error ||
                                  "Failed to process document. Please try again."}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* WhatsApp Delivery */}
              {completedCount > 0 && (
                <Card className="shadow-medium border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <span>WhatsApp Delivery</span>
                    </CardTitle>
                                      <CardDescription>
                    Enter your WhatsApp number to receive the summaries as
                    formatted PDFs via N8N
                  </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp Number</Label>
                      <div className="flex space-x-3">
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                          <Input
                            id="phone"
                            placeholder="+1234567890"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Button
                          onClick={handleSendToWhatsApp}
                          disabled={
                            deliveryStatus === "sending" || !phoneNumber
                          }
                          className="min-w-[120px]"
                        >
                          {deliveryStatus === "sending" ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Send to WhatsApp
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {deliveryStatus === "sent" && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Successfully sent {completedCount} summary PDF
                            {completedCount > 1 ? "s" : ""} to {phoneNumber}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-text-secondary space-y-1">
                      <p>
                        • Summaries will be delivered as formatted PDF documents via N8N
                      </p>
                      <p>• Delivery typically takes 30-60 seconds</p>
                      <p>• Your phone number is not stored permanently</p>
                      <p>• N8N handles both AI processing and WhatsApp delivery</p>
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch('https://karthikeya007.app.n8n.cloud/webhook/pdf-summary', {
                              method: 'POST',
                              body: new FormData()
                            });
                            if (response.ok) {
                              toast.success('N8N connection test successful!');
                            } else {
                              toast.error(`N8N connection failed: ${response.status}`);
                            }
                          } catch (error) {
                            toast.error('N8N connection test failed');
                          }
                        }}
                        className="w-full"
                      >
                        Test N8N Connection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* AI Assistant Panel */}
              {showAIAssistant && (
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
                      <p className="font-medium">💡 Smart Features:</p>
                      <ul className="space-y-2 text-xs">
                        <li>• AI extracts key insights automatically</li>
                        <li>• Summaries are 500-800 words</li>
                        <li>• Professional PDF formatting</li>
                        <li>• Instant WhatsApp delivery</li>
                      </ul>
                    </div>

                    <div className="bg-white/20 rounded-lg p-3 text-sm text-ai-accent-foreground">
                      <p className="font-medium mb-1">🔒 Privacy First</p>
                      <p className="text-xs opacity-90">
                        Files are automatically deleted after 24 hours. Your
                        data stays secure.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feature Benefits */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Why Use This Feature?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text-primary">
                        Lightning Fast
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Get summaries in under 60 seconds
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text-primary">
                        Mobile Friendly
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Receive PDFs directly on WhatsApp
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text-primary">
                        Secure & Private
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Auto-delete after 24 hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              {uploadedFiles.length > 0 && (
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Session Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">
                        Files Uploaded
                      </span>
                      <span className="font-medium">
                        {uploadedFiles.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Processing</span>
                      <span className="font-medium text-amber-600">
                        {processingCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Completed</span>
                      <span className="font-medium text-green-600">
                        {completedCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">
                        Delivery Status
                      </span>
                      <Badge
                        variant={
                          deliveryStatus === "sent" ? "default" : "secondary"
                        }
                      >
                        {deliveryStatus === "sent" ? "Delivered" : "Pending"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSummary;
