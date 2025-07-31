import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, User, Building, FileText, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProfileData {
  // Personal Information
  fullName: string;
  dateOfBirth: Date | undefined;
  aadhaarNumber: string;
  panNumber: string;
  email: string;
  mobile: string;
  
  // Company Information
  businessName: string;
  businessType: string;
  panCard: string;
  gstNumber: string;
  iecNumber: string;
  incorporationDate: Date | undefined;
  registrationCountry: string;
  
  // Address Information
  businessAddress: string;
  city: string;
  state: string;
  pincode: string;
  
  // Bank Details
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
  
  // Port Information
  preferredPort: string;
}

interface UploadedFiles {
  aadhaarCard: File | null;
  panCard: File | null;
  gstCertificate: File | null;
  iecCertificate: File | null;
  msmeUdyam: File | null;
  cancelledCheque: File | null;
  companyLogo: File | null;
}

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    dateOfBirth: undefined,
    aadhaarNumber: "",
    panNumber: "",
    email: "",
    mobile: "",
    businessName: "",
    businessType: "",
    panCard: "",
    gstNumber: "",
    iecNumber: "",
    incorporationDate: undefined,
    registrationCountry: "India",
    businessAddress: "",
    city: "",
    state: "",
    pincode: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    ifscCode: "",
    preferredPort: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    aadhaarCard: null,
    panCard: null,
    gstCertificate: null,
    iecCertificate: null,
    msmeUdyam: null,
    cancelledCheque: null,
    companyLogo: null,
  });

  const businessTypes = [
    "Proprietorship",
    "Partnership",
    "Private Limited",
    "LLP",
    "MSME",
    "Government Organization"
  ];

  const indianPorts = [
    "JNPT (Mumbai)",
    "Chennai Port",
    "Kolkata Port",
    "Kandla Port",
    "Cochin Port",
    "Visakhapatnam Port",
    "Paradip Port",
    "Tuticorin Port"
  ];

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: keyof UploadedFiles, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [field]: file }));
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const calculateProgress = () => {
    const requiredFields = [
      profileData.fullName,
      profileData.dateOfBirth,
      profileData.aadhaarNumber,
      profileData.panNumber,
      profileData.email,
      profileData.mobile,
      profileData.businessName,
      profileData.businessType,
      profileData.gstNumber,
      profileData.iecNumber,
    ];
    
    const requiredFiles = [
      uploadedFiles.aadhaarCard,
      uploadedFiles.panCard,
      uploadedFiles.gstCertificate,
      uploadedFiles.iecCertificate,
    ];

    const filledFields = requiredFields.filter(field => field && field !== "").length;
    const uploadedRequiredFiles = requiredFiles.filter(file => file !== null).length;
    
    return Math.round(((filledFields + uploadedRequiredFiles) / (requiredFields.length + requiredFiles.length)) * 100);
  };

  const handleSubmit = () => {
    toast({
      title: "Profile Created Successfully!",
      description: "Your exporter profile has been set up. You can now access all documentation features.",
    });
    navigate("/dashboard");
  };

  const FileUploadCard = ({ 
    title, 
    description, 
    field, 
    required = false 
  }: {
    title: string;
    description: string;
    field: keyof UploadedFiles;
    required?: boolean;
  }) => (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {required && <span className="text-red-500 text-xs">*Required</span>}
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="file"
            id={field}
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(field, file);
            }}
            className="hidden"
          />
          <label htmlFor={field}>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </label>
          {uploadedFiles[field] && (
            <span className="text-sm text-green-600 font-medium">
              ✓ {uploadedFiles[field]?.name}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-surface py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Setup Your Exporter Profile</h1>
          <p className="text-text-secondary">Complete your profile to access all export documentation features</p>
          
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Profile Completion</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </div>

        <Tabs value={currentStep.toString()} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="0" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="1" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="2" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="3" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Bank & Address
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="0">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Enter your personal details for KYC verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => updateProfileData("fullName", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !profileData.dateOfBirth && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {profileData.dateOfBirth ? format(profileData.dateOfBirth, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={profileData.dateOfBirth}
                          onSelect={(date) => updateProfileData("dateOfBirth", date)}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                    <Input
                      id="aadhaar"
                      value={profileData.aadhaarNumber}
                      onChange={(e) => updateProfileData("aadhaarNumber", e.target.value)}
                      placeholder="1234 5678 9012"
                      maxLength={12}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN Number *</Label>
                    <Input
                      id="pan"
                      value={profileData.panNumber}
                      onChange={(e) => updateProfileData("panNumber", e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => updateProfileData("email", e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input
                      id="mobile"
                      value={profileData.mobile}
                      onChange={(e) => updateProfileData("mobile", e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Information */}
          <TabsContent value="1">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Enter your business details and registration information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={profileData.businessName}
                      onChange={(e) => updateProfileData("businessName", e.target.value)}
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select onValueChange={(value) => updateProfileData("businessType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gst">GST Number *</Label>
                    <Input
                      id="gst"
                      value={profileData.gstNumber}
                      onChange={(e) => updateProfileData("gstNumber", e.target.value.toUpperCase())}
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iec">IEC Number *</Label>
                    <Input
                      id="iec"
                      value={profileData.iecNumber}
                      onChange={(e) => updateProfileData("iecNumber", e.target.value)}
                      placeholder="1234567890"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Incorporation</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !profileData.incorporationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {profileData.incorporationDate ? format(profileData.incorporationDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={profileData.incorporationDate}
                          onSelect={(date) => updateProfileData("incorporationDate", date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country of Registration</Label>
                    <Input
                      id="country"
                      value={profileData.registrationCountry}
                      onChange={(e) => updateProfileData("registrationCountry", e.target.value)}
                      placeholder="India"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Uploads */}
          <TabsContent value="2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Uploads</CardTitle>
                  <CardDescription>Upload your KYC and business documents (PDF, JPG, PNG accepted)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileUploadCard
                      title="Aadhaar Card"
                      description="Upload your Aadhaar card"
                      field="aadhaarCard"
                      required
                    />
                    <FileUploadCard
                      title="PAN Card"
                      description="Upload your PAN card"
                      field="panCard"
                      required
                    />
                    <FileUploadCard
                      title="GST Certificate"
                      description="Upload GST registration certificate"
                      field="gstCertificate"
                      required
                    />
                    <FileUploadCard
                      title="IEC Certificate"
                      description="Upload Import Export Code certificate"
                      field="iecCertificate"
                      required
                    />
                    <FileUploadCard
                      title="MSME/Udyam Certificate"
                      description="Upload MSME or Udyam certificate (optional)"
                      field="msmeUdyam"
                    />
                    <FileUploadCard
                      title="Cancelled Cheque"
                      description="Upload cancelled cheque for bank verification"
                      field="cancelledCheque"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bank & Address Details */}
          <TabsContent value="3">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Address</CardTitle>
                  <CardDescription>Enter your registered business address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={profileData.businessAddress}
                      onChange={(e) => updateProfileData("businessAddress", e.target.value)}
                      placeholder="Enter complete business address"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => updateProfileData("city", e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileData.state}
                        onChange={(e) => updateProfileData("state", e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={profileData.pincode}
                        onChange={(e) => updateProfileData("pincode", e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                  <CardDescription>Enter your business bank account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={profileData.bankName}
                        onChange={(e) => updateProfileData("bankName", e.target.value)}
                        placeholder="Bank Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchName">Branch Name</Label>
                      <Input
                        id="branchName"
                        value={profileData.branchName}
                        onChange={(e) => updateProfileData("branchName", e.target.value)}
                        placeholder="Branch Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={profileData.accountNumber}
                        onChange={(e) => updateProfileData("accountNumber", e.target.value)}
                        placeholder="Account Number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc">IFSC Code</Label>
                      <Input
                        id="ifsc"
                        value={profileData.ifscCode}
                        onChange={(e) => updateProfileData("ifscCode", e.target.value.toUpperCase())}
                        placeholder="ABCD0123456"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Preferences</CardTitle>
                  <CardDescription>Set your preferred export port</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="port">Preferred Port of Export</Label>
                    <Select onValueChange={(value) => updateProfileData("preferredPort", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred port" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianPorts.map((port) => (
                          <SelectItem key={port} value={port}>
                            {port}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Complete Profile Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;