import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  FileText, 
  Upload, 
  Bot, 
  MessageCircle,
  ExternalLink,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const faqs = [
  {
    question: "How does AI document extraction work?",
    answer: "Our AI analyzes your uploaded invoice or order sheet, automatically extracting key information like exporter details, item descriptions, quantities, and values. The system uses advanced OCR and machine learning to ensure accuracy."
  },
  {
    question: "What file formats are supported?",
    answer: "We support PDF, JPG, and PNG formats. For best results, upload clear, high-quality scans or digital copies of your documents."
  },
  {
    question: "How accurate is the data extraction?",
    answer: "Our AI achieves 95%+ accuracy on well-formatted documents. You can always review and edit extracted data before generating final documents."
  },
  {
    question: "What export documents can I generate?",
    answer: "Currently, we support Bill of Entry, Shipping Bill, and FIRC generation. More document types are being added regularly."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, all data is encrypted in transit and at rest. We follow industry-standard security practices and never share your business information."
  }
];

const documentGuides = [
  {
    title: "Bill of Entry",
    description: "Required for customs clearance of imported goods",
    status: "Available"
  },
  {
    title: "Shipping Bill",
    description: "Essential document for export clearance",
    status: "Available"
  },
  {
    title: "FIRC (Foreign Inward Remittance Certificate)",
    description: "Proof of foreign exchange receipt",
    status: "Available"
  }
];

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              Help & Support
            </h1>
            <p className="text-text-secondary text-lg">
              Everything you need to know about using ManuDocs for export documentation
            </p>
          </div>

          {/* Quick Start Guide */}
          <Card className="shadow-medium border-0 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary" />
                <span>Quick Start Guide</span>
              </CardTitle>
              <CardDescription>
                Get started with ManuDocs in just a few simple steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary">1. Upload Document</h3>
                  <p className="text-sm text-text-secondary">
                    Upload your invoice, order sheet, or any export document (PDF, JPG, PNG)
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary">2. AI Extraction</h3>
                  <p className="text-sm text-text-secondary">
                    Our AI automatically extracts and organizes all relevant data from your document
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary">3. Generate Documents</h3>
                  <p className="text-sm text-text-secondary">
                    Review extracted data and generate professional export documents instantly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="shadow-soft border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-start space-x-2">
                        <HelpCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span>{faq.question}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Document Guides & Support */}
            <div className="space-y-8">
              {/* Document Types */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  Supported Documents
                </h2>
                <div className="space-y-3">
                  {documentGuides.map((doc, index) => (
                    <Card key={index} className="shadow-soft border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <FileText className="w-4 h-4 text-primary" />
                              <h3 className="font-semibold text-text-primary">{doc.title}</h3>
                            </div>
                            <p className="text-sm text-text-secondary">{doc.description}</p>
                          </div>
                          <Badge variant="default" className="ml-4">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {doc.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Contact Support */}
              <Card className="shadow-medium border-0 bg-gradient-primary">
                <CardHeader>
                  <CardTitle className="text-ai-accent-foreground flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Need More Help?</span>
                  </CardTitle>
                  <CardDescription className="text-ai-accent-foreground/80">
                    Our support team is here to assist you with any questions or issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm text-ai-accent-foreground/90">
                    <p>📧 Email: support@manudocs.com</p>
                    <p>📞 Phone: +91-800-MANU-DOC</p>
                    <p>🕒 Hours: Mon-Fri, 9 AM - 6 PM IST</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="surface" 
                      className="w-full justify-between bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
                    >
                      Contact Support
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="surface" 
                      className="w-full justify-between bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
                    >
                      Schedule Demo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle>Resources & Guides</CardTitle>
                  <CardDescription>
                    Additional resources to help you get the most out of ManuDocs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-between">
                    Video Tutorials
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between">
                    Export Documentation Guide
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between">
                    API Documentation
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between">
                    Best Practices
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}