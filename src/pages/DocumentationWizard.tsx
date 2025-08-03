import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, Search, Download, FileText, Clock, AlertCircle, Bot, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  hsCode: string;
  category: string;
}

interface Document {
  id: string;
  name: string;
  status: 'completed' | 'partial' | 'required';
  autofillPercentage: number;
  required: boolean;
}

const categories: Category[] = [
  { id: 'agro', name: 'Agro & Food Products', icon: '🌾', description: 'Rice, spices, processed foods' },
  { id: 'apparel', name: 'Apparel & Textiles', icon: '👕', description: 'Garments, fabrics, accessories' },
  { id: 'electronics', name: 'Electronics', icon: '📱', description: 'Consumer electronics, components' },
  { id: 'machinery', name: 'Machinery', icon: '⚙️', description: 'Industrial equipment, tools' },
  { id: 'chemicals', name: 'Chemicals', icon: '🧪', description: 'Industrial chemicals, dyes' },
  { id: 'pharma', name: 'Pharmaceutical', icon: '💊', description: 'Medicines, health products' },
  { id: 'handicrafts', name: 'Handicrafts', icon: '🎨', description: 'Art, crafts, decorative items' },
  { id: 'services', name: 'Services', icon: '💼', description: 'IT, consulting, other services' }
];

const productsByCategory: Record<string, Product[]> = {
  agro: [
    { id: 'basmati-rice', name: 'Basmati Rice', hsCode: '1006.30', category: 'agro' },
    { id: 'turmeric-powder', name: 'Turmeric Powder', hsCode: '0910.30', category: 'agro' },
    { id: 'cashew-nuts', name: 'Cashew Nuts', hsCode: '0801.32', category: 'agro' }
  ],
  electronics: [
    { id: 'led-lights', name: 'LED Lights', hsCode: '9405.40', category: 'electronics' },
    { id: 'electric-motors', name: 'Electric Motors', hsCode: '8501.10', category: 'electronics' },
    { id: 'smartphones', name: 'Smartphones', hsCode: '8517.12', category: 'electronics' }
  ],
  apparel: [
    { id: 'cotton-tshirts', name: 'Cotton T-Shirts', hsCode: '6109.10', category: 'apparel' },
    { id: 'denim-jeans', name: 'Denim Jeans', hsCode: '6203.42', category: 'apparel' },
    { id: 'silk-sarees', name: 'Silk Sarees', hsCode: '6204.44', category: 'apparel' }
  ]
};

const documentTemplates: Document[] = [
  { id: 'proforma-invoice', name: 'Proforma Invoice', status: 'completed', autofillPercentage: 95, required: true },
  { id: 'packing-list', name: 'Packing List', status: 'partial', autofillPercentage: 70, required: true },
  { id: 'bill-of-lading', name: 'Bill of Lading', status: 'required', autofillPercentage: 40, required: true },
  { id: 'certificate-origin', name: 'Certificate of Origin', status: 'partial', autofillPercentage: 60, required: true },
  { id: 'ebrc', name: 'eBRC', status: 'required', autofillPercentage: 30, required: false },
  { id: 'bank-letter', name: 'Bank Letter', status: 'completed', autofillPercentage: 100, required: true },
  { id: 'shipping-line', name: 'Shipping Line Instructions', status: 'required', autofillPercentage: 45, required: false }
];

export default function DocumentationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const steps = [
    { number: 1, title: 'Select Category', description: 'Choose export category' },
    { number: 2, title: 'Select Product', description: 'Find your product' },
    { number: 3, title: 'Required Documents', description: 'Review documentation' },
    { number: 4, title: 'Smart Autofill', description: 'Configure fields' },
    { number: 5, title: 'Generate & Download', description: 'Get your documents' }
  ];

  const getStepProgress = () => (currentStep / steps.length) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4 text-green-600" />;
      case 'partial': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'required': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✅ Already Filled</Badge>;
      case 'partial': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">⏳ Partially Filled</Badge>;
      case 'required': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">❗ Still Required</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableProducts = selectedCategory ? productsByCategory[selectedCategory.id] || [] : [];
  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedCategory !== null;
      case 2: return selectedProduct !== null;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ManuDocs Documentation Wizard
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Bot className="h-5 w-5" />
            Using AI + DGFT rules to simplify your workflow
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.number 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="min-h-[500px]">
          <CardContent className="p-6">
            {/* Step 1: Select Category */}
            {currentStep === 1 && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Select Export Category
                  </CardTitle>
                  <CardDescription>
                    Choose the category that best matches your export product
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCategories.map((category) => (
                      <Card
                        key={category.id}
                        className={`cursor-pointer transition-all border-2 ${
                          selectedCategory?.id === category.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <h3 className="font-semibold text-foreground">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Product */}
            {currentStep === 2 && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Select Product</CardTitle>
                  <CardDescription>
                    Find your specific product - HS Code will be auto-detected
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className={`cursor-pointer transition-all border-2 ${
                          selectedProduct?.id === product.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-foreground">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">HS Code: {product.hsCode}</p>
                            </div>
                            <Badge variant="outline">Auto-detected</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Required Documents */}
            {currentStep === 3 && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Required Documents</CardTitle>
                  <CardDescription>
                    Documents needed for {selectedProduct?.name} export
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  {documentTemplates.map((doc) => (
                    <Card key={doc.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(doc.status)}
                            <div>
                              <h3 className="font-semibold text-foreground">{doc.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(doc.status)}
                                {doc.required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {doc.autofillPercentage}% Auto-filled
                            </div>
                            <Progress value={doc.autofillPercentage} className="w-20 h-2 mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Smart Autofill */}
            {currentStep === 4 && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Smart Autofill Configuration</CardTitle>
                  <CardDescription>
                    Fields auto-filled from your profile vs manual input required
                  </CardDescription>
                </CardHeader>

                <div className="space-y-6">
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        Auto-filled from Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>• Exporter Name & Address</div>
                        <div>• IEC Code</div>
                        <div>• GSTIN</div>
                        <div>• Bank Details</div>
                        <div>• Company Registration</div>
                        <div>• Contact Information</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="text-yellow-800 flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Requires Manual Input
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>• Buyer Details</div>
                        <div>• Shipment Quantity</div>
                        <div>• Unit Price</div>
                        <div>• Shipping Terms</div>
                        <div>• Delivery Date</div>
                        <div>• Payment Terms</div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 font-medium">
                      🛡️ Your data is encrypted and used only for document autofill
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Generate & Download */}
            {currentStep === 5 && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Generate & Download Documents</CardTitle>
                  <CardDescription>
                    Preview and download your export documentation
                  </CardDescription>
                </CardHeader>

                <Tabs defaultValue="proforma-invoice" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="proforma-invoice">Proforma Invoice</TabsTrigger>
                    <TabsTrigger value="packing-list">Packing List</TabsTrigger>
                    <TabsTrigger value="certificates">Certificates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="proforma-invoice" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Proforma Invoice</CardTitle>
                            <CardDescription>95% auto-filled</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </TabsContent>

                  <TabsContent value="packing-list" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Packing List</CardTitle>
                            <CardDescription>70% auto-filled</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit Missing Fields</Button>
                            <Button variant="outline" size="sm">Preview</Button>
                            <Button size="sm">Download PDF</Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </TabsContent>

                  <TabsContent value="certificates" className="space-y-4">
                    {['Certificate of Origin', 'Bill of Lading', 'eBRC'].map((doc) => (
                      <Card key={doc}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle>{doc}</CardTitle>
                              <CardDescription>Ready for generation</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Preview</Button>
                              <Button size="sm">Download PDF</Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-center mt-6">
                  <Button size="lg" className="px-8">
                    <Download className="h-5 w-5 mr-2" />
                    Download All Documents
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length && (
              <Button 
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {currentStep === steps.length && (
              <Button>
                Start New Documentation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}