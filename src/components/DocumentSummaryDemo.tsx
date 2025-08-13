import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  FileText, 
  MessageCircle, 
  Zap, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Clock,
  Smartphone
} from "lucide-react";

const DocumentSummaryDemo = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: FileText,
      title: "Upload Documents",
      description: "Drag & drop PDF, Word, or text files",
      details: "Support for multiple file formats with 10MB limit per file"
    },
    {
      icon: Bot,
      title: "AI Processing",
      description: "Advanced AI extracts key insights",
      details: "Generates professional 500-800 word summaries in under 60 seconds"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Delivery",
      description: "Receive formatted PDFs instantly",
      details: "Direct delivery to your WhatsApp with professional formatting"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get summaries in under 60 seconds",
      color: "text-amber-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Perfect for on-the-go insights",
      color: "text-blue-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Auto-delete after 24 hours",
      color: "text-green-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="shadow-medium border-0 bg-gradient-primary overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-ai-accent-foreground border-white/30">
                  🚀 New Feature
                </Badge>
              </div>
              <h2 className="text-3xl font-bold text-ai-accent-foreground mb-4">
                AI Document Summary & WhatsApp Delivery
              </h2>
              <p className="text-ai-accent-foreground/90 text-lg mb-6">
                Transform lengthy documents into concise, actionable summaries delivered directly to your WhatsApp. 
                Perfect for busy professionals who need quick insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="surface" 
                  size="lg"
                  className="bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
                  asChild
                >
                  <Link to="/document-summary">
                    <Bot className="w-5 h-5 mr-2" />
                    Try It Now
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="text-ai-accent-foreground hover:bg-white/20"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
            
            {/* Demo Animation */}
            <div className="relative">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === activeStep;
                    const isCompleted = index < activeStep;
                    
                    return (
                      <div 
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                          isActive ? 'bg-white/20 scale-105' : isCompleted ? 'bg-white/10' : 'bg-white/5'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-white text-primary' : 'bg-white/20 text-ai-accent-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-ai-accent-foreground">{step.title}</h4>
                          <p className="text-sm text-ai-accent-foreground/80">{step.description}</p>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <div id="how-it-works">
        <Card className="shadow-soft border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How It Works</CardTitle>
            <CardDescription>
              Three simple steps to get AI-powered document summaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={index}
                    className="text-center p-6 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-text-primary">{step.title}</h3>
                    </div>
                    <p className="text-text-secondary text-sm mb-3">{step.description}</p>
                    <p className="text-xs text-text-secondary/80">{step.details}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="shadow-soft border-0 hover:shadow-medium transition-shadow">
              <CardContent className="p-6 text-center">
                <Icon className={`w-12 h-12 ${feature.color} mx-auto mb-4`} />
                <h3 className="font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Use Cases */}
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle className="text-xl">Perfect For</CardTitle>
          <CardDescription>
            Ideal use cases for AI document summarization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-text-primary">Business Professionals</h4>
                  <p className="text-sm text-text-secondary">Quick contract reviews, report summaries, meeting prep</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-text-primary">Students & Researchers</h4>
                  <p className="text-sm text-text-secondary">Academic paper summaries, study material processing</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-text-primary">Legal Professionals</h4>
                  <p className="text-sm text-text-secondary">Document review, case file summaries, legal research</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-text-primary">Content Creators</h4>
                  <p className="text-sm text-text-secondary">Research material processing, content curation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-text-primary">Consultants</h4>
                  <p className="text-sm text-text-secondary">Client document analysis, proposal reviews</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-text-primary">Executives</h4>
                  <p className="text-sm text-text-secondary">Board meeting prep, strategic document review</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="shadow-medium border-0 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            Ready to Transform Your Document Workflow?
          </h3>
          <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who save hours every week with AI-powered document summaries. 
            Start processing your documents today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/document-summary">
                <Bot className="w-5 h-5 mr-2" />
                Start Summarizing
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              <Clock className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Auto-advance demo animation
setTimeout(() => {
  const component = document.querySelector('[data-demo-animation]');
  if (component) {
    let currentStep = 0;
    setInterval(() => {
      currentStep = (currentStep + 1) % 3;
      // This would need to be implemented with a proper state management solution
    }, 3000);
  }
}, 1000);

export default DocumentSummaryDemo;