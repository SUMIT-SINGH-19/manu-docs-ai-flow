import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  FileText, 
  Edit3, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Send
} from "lucide-react";

// Mock extracted data
const extractedData = {
  exporterName: "Sunrise Electronics Pvt. Ltd.",
  exporterAddress: "Plot 23, Industrial Area, Pune, Maharashtra 411006",
  invoiceNumber: "SE/EXP/2024/001",
  invoiceDate: "2024-01-15",
  portOfExport: "JNPT, Mumbai",
  destinationCountry: "United States",
  buyer: "TechCorp Inc., 123 Tech Street, San Francisco, CA 94105",
  items: [
    {
      description: "Electronic Components - Resistors",
      hsCode: "8533.21.00",
      quantity: "10000 pieces",
      unitPrice: "₹2.50",
      totalValue: "₹25,000"
    },
    {
      description: "Electronic Components - Capacitors", 
      hsCode: "8532.24.00",
      quantity: "5000 pieces",
      unitPrice: "₹8.50",
      totalValue: "₹42,500"
    }
  ],
  totalInvoiceValue: "₹67,500",
  currency: "INR",
  paymentTerms: "30 days from BL date"
};

const documentTypes = [
  { id: "boe", name: "Bill of Entry", status: "ready" },
  { id: "sb", name: "Shipping Bill", status: "ready" },
  { id: "firc", name: "FIRC", status: "pending" }
];

export default function AIExtraction() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("boe");
  const [editMode, setEditMode] = useState(false);

  const generateDocument = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-ai-accent-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary">
                AI Data Extraction & Document Preview
              </h1>
            </div>
            <p className="text-text-secondary text-lg">
              Review extracted data and generate your export documents
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Extracted Data Form */}
            <div className="space-y-6">
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Extracted Invoice Data</span>
                      </CardTitle>
                      <CardDescription>
                        AI has extracted the following information. Review and edit if needed.
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {editMode ? "Save" : "Edit"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Exporter Information */}
                  <div>
                    <h3 className="font-semibold text-text-primary mb-3">Exporter Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="exporterName">Company Name</Label>
                        <Input 
                          id="exporterName" 
                          value={extractedData.exporterName}
                          readOnly={!editMode}
                          className={editMode ? "" : "bg-surface"}
                        />
                      </div>
                      <div>
                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                        <Input 
                          id="invoiceNumber" 
                          value={extractedData.invoiceNumber}
                          readOnly={!editMode}
                          className={editMode ? "" : "bg-surface"}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="exporterAddress">Address</Label>
                      <Textarea 
                        id="exporterAddress" 
                        value={extractedData.exporterAddress}
                        readOnly={!editMode}
                        className={editMode ? "" : "bg-surface"}
                        rows={2}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Export Details */}
                  <div>
                    <h3 className="font-semibold text-text-primary mb-3">Export Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="portOfExport">Port of Export</Label>
                        <Input 
                          id="portOfExport" 
                          value={extractedData.portOfExport}
                          readOnly={!editMode}
                          className={editMode ? "" : "bg-surface"}
                        />
                      </div>
                      <div>
                        <Label htmlFor="destinationCountry">Destination</Label>
                        <Input 
                          id="destinationCountry" 
                          value={extractedData.destinationCountry}
                          readOnly={!editMode}
                          className={editMode ? "" : "bg-surface"}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-text-primary mb-3">Item Details</h3>
                    <div className="space-y-3">
                      {extractedData.items.map((item, index) => (
                        <div key={index} className="p-4 bg-surface rounded-lg border border-border">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Description</Label>
                              <p className="text-sm font-medium">{item.description}</p>
                            </div>
                            <div>
                              <Label className="text-xs">HS Code</Label>
                              <p className="text-sm font-mono">{item.hsCode}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Quantity</Label>
                              <p className="text-sm">{item.quantity}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                            <span className="text-sm text-text-secondary">Unit Price: {item.unitPrice}</span>
                            <span className="font-semibold text-primary">{item.totalValue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-gradient-primary rounded-lg">
                      <div className="flex justify-between items-center text-ai-accent-foreground">
                        <span className="font-semibold">Total Invoice Value:</span>
                        <span className="text-xl font-bold">{extractedData.totalInvoiceValue}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Document Preview */}
            <div className="space-y-6">
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Generate Export Documents</CardTitle>
                  <CardDescription>
                    Select document type to preview and generate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedDoc} onValueChange={setSelectedDoc}>
                    <TabsList className="grid w-full grid-cols-3">
                      {documentTypes.map((doc) => (
                        <TabsTrigger key={doc.id} value={doc.id} className="text-xs">
                          {doc.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {documentTypes.map((doc) => (
                      <TabsContent key={doc.id} value={doc.id} className="mt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-text-primary">{doc.name}</h3>
                            <Badge variant={doc.status === "ready" ? "default" : "secondary"}>
                              {doc.status === "ready" ? "Ready" : "Pending"}
                            </Badge>
                          </div>

                          {/* Document Preview Area */}
                          <div className="h-96 bg-surface border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                            {doc.status === "ready" ? (
                              <div className="text-center space-y-4">
                                <FileText className="w-16 h-16 text-primary mx-auto" />
                                <div>
                                  <h4 className="font-medium text-text-primary mb-2">
                                    {doc.name} Preview
                                  </h4>
                                  <p className="text-sm text-text-secondary mb-4">
                                    Document is ready for generation
                                  </p>
                                  <div className="space-x-2">
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4 mr-2" />
                                      Preview
                                    </Button>
                                    <Button 
                                      variant="ai" 
                                      size="sm"
                                      onClick={generateDocument}
                                      disabled={isGenerating}
                                    >
                                      {isGenerating ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                      )}
                                      Generate
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center space-y-4">
                                <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
                                <div>
                                  <h4 className="font-medium text-text-primary mb-2">
                                    Additional Data Required
                                  </h4>
                                  <p className="text-sm text-text-secondary">
                                    Some fields need to be completed before generating this document
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  <div className="mt-6 pt-6 border-t border-border">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download All Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}