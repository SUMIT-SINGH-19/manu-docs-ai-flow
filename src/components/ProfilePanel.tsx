import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  Building, 
  CreditCard, 
  Eye, 
  EyeOff,
  Edit2,
  CheckCircle,
  Download,
  Upload,
  FileText,
  X
} from "lucide-react";

interface ProfileField {
  id: string;
  label: string;
  value: string;
  isPrivate: boolean;
  isCompleted: boolean;
  type: 'text' | 'email' | 'tel' | 'date' | 'textarea';
}

const ProfilePanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [profileType, setProfileType] = useState<'exporter' | 'importer' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  
  const [profileData, setProfileData] = useState<ProfileField[]>([
    // Personal Information
    { id: 'fullName', label: 'Full Name', value: 'Rajesh Kumar', isPrivate: false, isCompleted: true, type: 'text' },
    { id: 'email', label: 'Email', value: 'rajesh@exportindia.com', isPrivate: false, isCompleted: true, type: 'email' },
    { id: 'mobile', label: 'Mobile', value: '+91 9876543210', isPrivate: true, isCompleted: true, type: 'tel' },
    { id: 'dateOfBirth', label: 'Date of Birth', value: '15/08/1985', isPrivate: true, isCompleted: true, type: 'date' },
    { id: 'aadhaar', label: 'Aadhaar Number', value: '1234 5678 9012', isPrivate: true, isCompleted: true, type: 'text' },
    { id: 'pan', label: 'PAN Number', value: 'ABCDE1234F', isPrivate: true, isCompleted: true, type: 'text' },
    
    // Company Information
    { id: 'companyName', label: 'Company Name', value: 'Export India Pvt Ltd', isPrivate: false, isCompleted: true, type: 'text' },
    { id: 'businessType', label: 'Business Type', value: 'Private Limited', isPrivate: false, isCompleted: true, type: 'text' },
    { id: 'gstNumber', label: 'GST Number', value: '22AAAAA0000A1Z5', isPrivate: false, isCompleted: true, type: 'text' },
    { id: 'iecNumber', label: 'IEC Number', value: '1234567890', isPrivate: false, isCompleted: true, type: 'text' },
    { id: 'address', label: 'Business Address', value: '123 Export Street, Mumbai', isPrivate: false, isCompleted: true, type: 'textarea' },
    
    // Bank Details
    { id: 'bankName', label: 'Bank Name', value: 'State Bank of India', isPrivate: true, isCompleted: true, type: 'text' },
    { id: 'accountNumber', label: 'Account Number', value: '1234567890123456', isPrivate: true, isCompleted: true, type: 'text' },
    { id: 'ifscCode', label: 'IFSC Code', value: 'SBIN0001234', isPrivate: true, isCompleted: true, type: 'text' },
  ]);

  const updateField = (id: string, value: string) => {
    setProfileData(prev =>
      prev.map(field =>
        field.id === id ? { ...field, value, isCompleted: !!value } : field
      )
    );
  };

  const togglePrivacy = (id: string) => {
    setProfileData(prev =>
      prev.map(field =>
        field.id === id ? { ...field, isPrivate: !field.isPrivate } : field
      )
    );
  };

  const handleFileUpload = (documentType: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [documentType]: file }));
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const completedFields = profileData.filter(field => field.isCompleted).length;
  const totalFields = profileData.length;
  const progress = Math.round((completedFields / totalFields) * 100);

  // Document upload component
  const DocumentUpload = ({ title, type, required = false }: { title: string; type: string; required?: boolean }) => (
    <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{title}</h4>
        {required && <span className="text-red-500 text-xs">*Required</span>}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="file"
          id={type}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(type, file);
          }}
          className="hidden"
        />
        <label htmlFor={type}>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </label>
        {uploadedFiles[type] && (
          <span className="text-sm text-green-600 font-medium">
            ✓ {uploadedFiles[type]?.name}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Setup
          </DialogTitle>
          <DialogDescription>
            Choose your profile type and upload required documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!profileType ? (
            // Profile Type Selection
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Choose Your Profile Type</h3>
                <p className="text-sm text-muted-foreground">Select whether you are an exporter or importer to customize your experience</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <Button
                  variant="outline"
                  className="h-32 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5"
                  onClick={() => setProfileType('exporter')}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Exporter</div>
                    <div className="text-xs text-muted-foreground">Export goods globally</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-32 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5"
                  onClick={() => setProfileType('importer')}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Importer</div>
                    <div className="text-xs text-muted-foreground">Import goods from abroad</div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="bg-card p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {profileType === 'exporter' ? 'Exporter' : 'Importer'} Profile Completion
                  </span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setProfileType(null)}
                  className="mt-2 text-xs"
                >
                  ← Change Profile Type
                </Button>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Required Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentUpload title="Aadhaar Card" type="aadhaar" required />
                  <DocumentUpload title="PAN Card" type="pan" required />
                  <DocumentUpload title="GST Certificate" type="gst" required />
                  <DocumentUpload title={profileType === 'exporter' ? 'IEC Certificate' : 'Import License'} type="license" required />
                  <DocumentUpload title="Company Registration" type="registration" />
                  <DocumentUpload title="Bank Certificate" type="bank" />
                  <DocumentUpload title="MSME Certificate" type="msme" />
                  <DocumentUpload title="Company Logo" type="logo" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                </div>
              </div>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {profileData.slice(0, 6).map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{field.label}</span>
                            {field.isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          {isEditing ? (
                            <Input
                              type={field.type}
                              value={field.value}
                              onChange={(e) => updateField(field.id, e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">{field.value}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePrivacy(field.id)}
                            className="flex items-center gap-1"
                          >
                            {field.isPrivate ? (
                              <EyeOff className="w-4 h-4 text-orange-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-xs">
                              {field.isPrivate ? 'Private' : 'Public'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {profileData.slice(6, 11).map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{field.label}</span>
                            {field.isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          {isEditing ? (
                            field.type === 'textarea' ? (
                              <Textarea
                                value={field.value}
                                onChange={(e) => updateField(field.id, e.target.value)}
                                className="mt-1"
                                rows={2}
                              />
                            ) : (
                              <Input
                                type={field.type}
                                value={field.value}
                                onChange={(e) => updateField(field.id, e.target.value)}
                                className="mt-1"
                              />
                            )
                          ) : (
                            <span className="text-sm text-muted-foreground">{field.value}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePrivacy(field.id)}
                            className="flex items-center gap-1"
                          >
                            {field.isPrivate ? (
                              <EyeOff className="w-4 h-4 text-orange-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-xs">
                              {field.isPrivate ? 'Private' : 'Public'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {profileData.slice(11).map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{field.label}</span>
                            {field.isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          {isEditing ? (
                            <Input
                              type={field.type}
                              value={field.value}
                              onChange={(e) => updateField(field.id, e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">{field.value}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePrivacy(field.id)}
                            className="flex items-center gap-1"
                          >
                            {field.isPrivate ? (
                              <EyeOff className="w-4 h-4 text-orange-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-xs">
                              {field.isPrivate ? 'Private' : 'Public'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePanel;