import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building, 
  CreditCard, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  Edit3,
  CheckCircle,
  AlertCircle,
  Download,
  Upload
} from "lucide-react";

interface ProfileField {
  id: string;
  label: string;
  value: string;
  isPrivate: boolean;
  isComplete: boolean;
  type: 'text' | 'textarea';
}

const ProfilePanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileField[]>([
    { id: 'iecCode', label: 'IEC Code', value: 'AAACO1234A1Z5', isPrivate: false, isComplete: true, type: 'text' },
    { id: 'gstin', label: 'GSTIN', value: '22AAAAA0000A1Z5', isPrivate: false, isComplete: true, type: 'text' },
    { id: 'adCode', label: 'AD Code', value: 'AD123456789', isPrivate: true, isComplete: true, type: 'text' },
    { id: 'companyName', label: 'Company Name', value: 'Sunrise Electronics Pvt. Ltd.', isPrivate: false, isComplete: true, type: 'text' },
    { id: 'address', label: 'Company Address', value: 'Plot 23, Industrial Area, Pune, Maharashtra 411006', isPrivate: false, isComplete: true, type: 'textarea' },
    { id: 'bankCert', label: 'Bank Certificate', value: '', isPrivate: true, isComplete: false, type: 'text' },
    { id: 'signature', label: 'Digital Signature', value: '', isPrivate: true, isComplete: false, type: 'text' },
  ]);

  const updateField = (id: string, value: string) => {
    setProfileData(prev => prev.map(field => 
      field.id === id ? { ...field, value, isComplete: value.length > 0 } : field
    ));
  };

  const togglePrivacy = (id: string) => {
    setProfileData(prev => prev.map(field => 
      field.id === id ? { ...field, isPrivate: !field.isPrivate } : field
    ));
  };

  const completedFields = profileData.filter(field => field.isComplete).length;
  const totalFields = profileData.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-elevated rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-ai-accent-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Export Profile</h2>
              <p className="text-sm text-text-secondary">Manage your persistent export data</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
              {completionPercentage}% Complete
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Profile Completion</span>
              <span className="text-text-primary font-medium">{completedFields}/{totalFields} fields</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="h-2 bg-gradient-primary rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant={isEditing ? "ai" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="surface" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="surface" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-6">
            {/* Company Information */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-text-primary">Company Information</h3>
              </div>
              <div className="space-y-4">
                {profileData.filter(field => ['companyName', 'address'].includes(field.id)).map((field) => (
                  <div key={field.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.label}
                      </Label>
                      <div className="flex items-center space-x-2">
                        {field.isComplete ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <Switch
                          checked={field.isPrivate}
                          onCheckedChange={() => togglePrivacy(field.id)}
                          disabled={!isEditing}
                        />
                        {field.isPrivate ? (
                          <EyeOff className="w-4 h-4 text-text-secondary" />
                        ) : (
                          <Eye className="w-4 h-4 text-text-secondary" />
                        )}
                      </div>
                    </div>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.id}
                        value={field.value}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        readOnly={!isEditing}
                        className={`${!isEditing ? 'bg-surface' : ''} ${field.isPrivate ? 'border-amber-200' : ''}`}
                        rows={2}
                      />
                    ) : (
                      <Input
                        id={field.id}
                        value={field.value}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        readOnly={!isEditing}
                        className={`${!isEditing ? 'bg-surface' : ''} ${field.isPrivate ? 'border-amber-200' : ''}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Registration Codes */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-text-primary">Registration Codes</h3>
              </div>
              <div className="space-y-4">
                {profileData.filter(field => ['iecCode', 'gstin', 'adCode'].includes(field.id)).map((field) => (
                  <div key={field.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.label}
                      </Label>
                      <div className="flex items-center space-x-2">
                        {field.isComplete ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <Switch
                          checked={field.isPrivate}
                          onCheckedChange={() => togglePrivacy(field.id)}
                          disabled={!isEditing}
                        />
                        {field.isPrivate ? (
                          <EyeOff className="w-4 h-4 text-text-secondary" />
                        ) : (
                          <Eye className="w-4 h-4 text-text-secondary" />
                        )}
                      </div>
                    </div>
                    <Input
                      id={field.id}
                      value={field.value}
                      onChange={(e) => updateField(field.id, e.target.value)}
                      readOnly={!isEditing}
                      className={`${!isEditing ? 'bg-surface' : ''} ${field.isPrivate ? 'border-amber-200' : ''} font-mono`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Certificates & Documents */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-text-primary">Certificates & Documents</h3>
              </div>
              <div className="space-y-4">
                {profileData.filter(field => ['bankCert', 'signature'].includes(field.id)).map((field) => (
                  <div key={field.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.label}
                      </Label>
                      <div className="flex items-center space-x-2">
                        {field.isComplete ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <Switch
                          checked={field.isPrivate}
                          onCheckedChange={() => togglePrivacy(field.id)}
                          disabled={!isEditing}
                        />
                        {field.isPrivate ? (
                          <EyeOff className="w-4 h-4 text-text-secondary" />
                        ) : (
                          <Eye className="w-4 h-4 text-text-secondary" />
                        )}
                      </div>
                    </div>
                    {field.isComplete ? (
                      <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                        <span className="text-sm text-text-secondary">Document uploaded</span>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" disabled={!isEditing}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload {field.label}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;