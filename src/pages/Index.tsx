import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Bot, 
  FileText, 
  Zap, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Extraction",
    description: "Advanced AI automatically extracts data from your invoices and documents with 100% accuracy."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate export documents in seconds, not hours. Streamline your documentation workflow."
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Bank-grade security with full compliance to Indian export regulations and standards."
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Reduce document preparation time by 90%. Focus on growing your export business."
  }
];

const documentTypes = [
  "Bill of Entry",
  "Shipping Bill", 
  "FIRC",
  "Commercial Invoice",
  "Packing List"
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-surface">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1">
              🚀 Now Supporting 5+ Export Document Types
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
              AI-Powered Export
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Documentation</span>
              <br />for Exporters - Importers Worldwide
            </h1>
            
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your export documentation process with AI. Upload invoices, extract data automatically, 
              and generate professional export documents in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild variant="ai" size="lg" className="text-lg px-8 py-6">
                <Link to="/categories">
                  <Upload className="w-5 h-5 mr-2" />
                  Start with Categories
                </Link>
              </Button>
              <Button asChild variant="surface" size="lg" className="text-lg px-8 py-6">
                <Link to="/upload">
                  <FileText className="w-5 h-5 mr-2" />
                  Quick Upload
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-text-secondary">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">3 Min</div>
                <div className="text-sm text-text-secondary">Avg. Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">1000+</div>
                <div className="text-sm text-text-secondary">Documents Generated</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Why Choose ManuDocs?
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Built specifically for exporters and importers worldwide, with deep understanding of international trade documentation requirements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="shadow-soft border-0 text-center hover:shadow-medium transition-all duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Supported Documents */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-8">
              Supported Export Documents
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              {documentTypes.map((doc, index) => (
                <Card key={index} className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-text-primary">{doc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button asChild variant="ai" size="lg">
              <Link to="/help">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-ai-accent-foreground mb-6">
              Ready to Transform Your Export Documentation?
            </h2>
            <p className="text-ai-accent-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of exporters and importers worldwide who have streamlined their documentation process with ManuDocs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                asChild 
                variant="surface" 
                size="lg" 
                className="bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
              >
                <Link to="/upload">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-ai-accent-foreground/80 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>No Setup Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
