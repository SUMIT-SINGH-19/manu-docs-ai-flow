import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  Building, 
  CreditCard,
  Upload,
  X,
  ChevronDown,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Lock,
  UserCheck
} from "lucide-react";

interface ProfileField {
  id: string;
  label: string;
  value: string;
  required: boolean;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
}

interface DocumentStatus {
  status: 'verified' | 'not-uploaded' | 'pending';
  file?: File;
}

const ProfilePanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [profileType, setProfileType] = useState<"exporter" | "importer" | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  
  const [documents, setDocuments] = useState<{ [key: string]: DocumentStatus }>({
    iec: { status: 'not-uploaded' },
    gst: { status: 'not-uploaded' },
    pan: { status: 'not-uploaded' },
    udyam: { status: 'not-uploaded' },
    incorporation: { status: 'not-uploaded' },
    bank: { status: 'not-uploaded' },
    aadhaar: { status: 'not-uploaded' },
    factory: { status: 'not-uploaded' },
  });

  const [profileData, setProfileData] = useState<ProfileField[]>([
    { id: "name", label: "Full Name", value: "", required: true, type: "text", placeholder: "Enter your full name" },
    { id: "businessName", label: "Business Name", value: "", required: true, type: "text", placeholder: "Your business/company name" },
    { id: "iec", label: "IEC Code", value: "", required: true, type: "text", placeholder: "10-digit IEC code" },
    { id: "gstin", label: "GSTIN", value: "", required: true, type: "text", placeholder: "15-digit GSTIN" },
    { id: "pan", label: "PAN", value: "", required: true, type: "text", placeholder: "ABCDE1234F" },
    { id: "aadhaar", label: "Aadhaar (Optional)", value: "", required: false, type: "text", placeholder: "12-digit Aadhaar number" },
    { id: "businessType", label: "Business Type", value: "", required: true, type: "select", 
      options: ["Manufacturer", "Trader", "Merchant Exporter", "Service Exporter"] },
    { id: "industry", label: "Industry Category", value: "", required: true, type: "select",
      options: ["Textiles", "Electronics", "Pharmaceuticals", "Chemicals", "Food Products", "Engineering Goods", "Other"] },
    { id: "address", label: "Permanent Address", value: "", required: true, type: "textarea", placeholder: "Complete permanent business address" },
    { id: "email", label: "Contact Email", value: "", required: true, type: "email", placeholder: "business@company.com" },
    { id: "phone", label: "Contact Phone", value: "", required: true, type: "tel", placeholder: "+91 9876543210" },
    { id: "port", label: "Preferred Port", value: "", required: true, type: "select",
      options: ["Mumbai", "Chennai", "Kolkata", "Cochin", "Vizag", "Kandla", "JNPT", "Other"] },
  ]);

  const updateField = (id: string, value: string) => {
    setProfileData(prev => prev.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };

  const handleFileUpload = (documentType: string, file: File) => {
    setDocuments(prev => ({ 
      ...prev, 
      [documentType]: { status: 'pending', file } 
    }));
    
    // Simulate verification process
    setTimeout(() => {
      setDocuments(prev => ({ 
        ...prev, 
        [documentType]: { status: 'verified', file } 
      }));
    }, 2000);
  };

  const calculateProgress = () => {
    const completedFields = profileData.filter(field => 
      field.required ? field.value.trim() !== "" : true
    ).length;
    const totalRequiredFields = profileData.filter(field => field.required).length;
    const verifiedDocs = Object.values(documents).filter(doc => doc.status === 'verified').length;
    const totalDocs = Object.keys(documents).length;
    
    const fieldProgress = (completedFields / profileData.length) * 0.6;
    const docProgress = (verifiedDocs / totalDocs) * 0.4;
    
    return Math.round((fieldProgress + docProgress) * 100);
  };

  const getStatusIcon = (status: DocumentStatus['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: DocumentStatus['status']) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">❗ Not Uploaded</Badge>;
    }
  };

  const DocumentUpload = ({ 
    title, 
    description, 
    documentType, 
    required = true 
  }: { 
    title: string; 
    description: string; 
    documentType: string; 
    required?: boolean;
  }) => {
    const docStatus = documents[documentType];
    
    return (
      <Card className={`transition-all duration-200 ${
        docStatus.status === 'verified' 
          ? 'border-green-200 bg-green-50' 
          : 'border-dashed border-2 hover:border-primary'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{title}</h4>
                {!required && <Badge variant="outline" className="text-xs">Optional</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            {getStatusIcon(docStatus.status)}
          </div>
          
          <div className="space-y-2">
            {getStatusBadge(docStatus.status)}
            
            {docStatus.file && (
              <p className="text-xs text-muted-foreground truncate">
                📎 {docStatus.file.name}
              </p>
            )}
            
            <input
              type="file"
              id={documentType}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(documentType, file);
              }}
            />
            
            <Button 
              variant={docStatus.status === 'verified' ? "outline" : "default"}
              size="sm"
              className="w-full"
              onClick={() => document.getElementById(documentType)?.click()}
            >
              <Upload className="w-3 h-3 mr-1" />
              {docStatus.file ? "Replace" : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              Profile Management
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Profile Completion</span>
              <span className="text-sm font-bold text-primary">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Complete your profile to auto-fill 30+ export/import documents
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Profile Type Selection */}
          {!profileType && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Select Your Profile Type</CardTitle>
                <CardDescription className="text-base">
                  Choose your business category to customize your experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 p-6 text-left flex flex-col items-start justify-center hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={() => setProfileType("exporter")}
                  >
                    <span className="font-semibold text-lg">🚢 Exporter</span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Export goods and services internationally
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 p-6 text-left flex flex-col items-start justify-center hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={() => setProfileType("importer")}
                  >
                    <span className="font-semibold text-lg">📦 Importer</span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Import goods and services from abroad
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {profileType && (
            <>
              {/* Smart Autofill Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-blue-900 mb-2">💡 Smart Autofill Technology</h3>
                      <p className="text-blue-700 mb-3">
                        This information will be automatically filled in <strong>30+ export/import documents</strong>. 
                        Update once, use forever across all your documentation needs.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Saves 90% of form filling time</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Badge */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-green-900 mb-2">🛡️ Bank-Grade Security</h3>
                      <p className="text-green-700 mb-3">
                        Your data is encrypted with AES-256 encryption and used only for document autofill. 
                        We never share your information with third parties.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Lock className="w-4 h-4" />
                        <span>256-bit SSL encryption • GDPR compliant</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Profile Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    👤 User Profile Details
                  </CardTitle>
                  <CardDescription>
                    Essential information for document generation and compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profileData.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="flex items-center gap-2">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {field.type === "select" ? (
                          <Select 
                            value={field.value} 
                            onValueChange={(value) => updateField(field.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === "textarea" ? (
                          <Textarea
                            id={field.id}
                            value={field.value}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="min-h-[100px] md:col-span-2 lg:col-span-3"
                          />
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type}
                            value={field.value}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Permanent Documents Section */}
              <Collapsible open={documentsOpen} onOpenChange={setDocumentsOpen}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            📁 Permanent Documents Section
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Upload one-time documents for automatic form filling across all export/import paperwork
                          </CardDescription>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${documentsOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {/* Document Status Summary */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            {Object.values(documents).filter(d => d.status === 'verified').length} Verified
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">
                            {Object.values(documents).filter(d => d.status === 'pending').length} Pending
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {Object.values(documents).filter(d => d.status === 'not-uploaded').length} Not Uploaded
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <DocumentUpload 
                          title="IEC Certificate" 
                          description="Import Export Code certificate" 
                          documentType="iec" 
                        />
                        <DocumentUpload 
                          title="GST Certificate" 
                          description="GST registration certificate" 
                          documentType="gst" 
                        />
                        <DocumentUpload 
                          title="PAN Card" 
                          description="Permanent Account Number" 
                          documentType="pan" 
                        />
                        <DocumentUpload 
                          title="Udyam Registration" 
                          description="MSME registration certificate" 
                          documentType="udyam" 
                        />
                        <DocumentUpload 
                          title="Company Certificate" 
                          description="Incorporation certificate" 
                          documentType="incorporation" 
                        />
                        <DocumentUpload 
                          title="Bank Details" 
                          description="Cancelled cheque or bank letter" 
                          documentType="bank" 
                        />
                        <DocumentUpload 
                          title="Aadhaar Card" 
                          description="For individual proprietors" 
                          documentType="aadhaar"
                          required={false}
                        />
                        <DocumentUpload 
                          title="Factory License" 
                          description="For manufacturing units" 
                          documentType="factory"
                          required={false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <Button size="lg" className="h-12 text-base font-semibold">
                  💾 Save Profile
                </Button>
                <Button variant="outline" size="lg" className="h-12 text-base font-semibold">
                  🚀 Start Documentation
                </Button>
                <Button variant="secondary" size="lg" className="h-12 text-base font-semibold">
                  👁️ Preview Auto-Filled Docs
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePanel;