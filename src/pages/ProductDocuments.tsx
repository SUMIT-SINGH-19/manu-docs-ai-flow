import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Edit3,
  Download,
  Upload,
  Bot,
  FileText,
  Globe,
  DollarSign,
  Package,
  Zap,
  Loader2
} from "lucide-react";
import { getCategoryBySlug, getProductById, Product, Category } from "@/data/staticData";

// Mock document requirement interface for demo
interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  canAutoFill: boolean;
  estimatedTime: string;
  status: 'complete' | 'auto-filled' | 'missing' | 'required';
}

const ProductDocuments = () => {
  const { categoryId, productId } = useParams<{ categoryId: string; productId: string }>();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load static product data
  useEffect(() => {
    const loadProductData = () => {
      if (!categoryId || !productId) return;
      
      setLoading(true);
      setError(null);
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        const productData = getProductById(productId);
        const categoryData = getCategoryBySlug(categoryId);
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        setProduct(productData);
        setCategory(categoryData || null);
        setLoading(false);
      }, 500);
    };

    loadProductData();
  }, [categoryId, productId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-text-secondary">Loading product details...</span>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <Card className="shadow-medium border-0 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {error || 'Product Not Found'}
            </h3>
            <p className="text-text-secondary mb-4">
              The requested product information is not available.
            </p>
            <div className="flex space-x-3 justify-center">
              <Button asChild variant="outline">
                <Link to="/categories">Back to Categories</Link>
              </Button>
              <Button variant="default" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock documents for demo - in real app, this would come from database
  const mockDocuments: DocumentRequirement[] = [
    {
      id: '1',
      name: 'Commercial Invoice',
      description: 'Detailed invoice showing the transaction between buyer and seller, including product details, quantities, and prices.',
      isRequired: true,
      canAutoFill: true,
      estimatedTime: '10 minutes',
      status: 'auto-filled'
    },
    {
      id: '2',
      name: 'Packing List',
      description: 'Detailed list of all items in the shipment, including weights, dimensions, and packaging details.',
      isRequired: true,
      canAutoFill: true,
      estimatedTime: '15 minutes',
      status: 'complete'
    },
    {
      id: '3',
      name: 'Certificate of Origin',
      description: 'Document certifying the country where the goods were manufactured or produced.',
      isRequired: true,
      canAutoFill: false,
      estimatedTime: '30 minutes',
      status: 'missing'
    },
    {
      id: '4',
      name: 'Export License',
      description: 'Government-issued license permitting the export of specific goods to certain destinations.',
      isRequired: false,
      canAutoFill: false,
      estimatedTime: '2-3 days',
      status: 'required'
    },
    {
      id: '5',
      name: 'Quality Certificate',
      description: 'Certificate confirming that the products meet specified quality standards and regulations.',
      isRequired: true,
      canAutoFill: false,
      estimatedTime: '1-2 days',
      status: 'missing'
    }
  ];

  const completedDocs = mockDocuments.filter(doc => 
    doc.status === 'complete' || doc.status === 'auto-filled'
  ).length;
  const totalDocs = mockDocuments.length;
  const requiredDocs = mockDocuments.filter(doc => doc.isRequired).length;
  const missingRequired = mockDocuments.filter(doc => 
    doc.isRequired && (doc.status === 'missing' || doc.status === 'required')
  ).length;
  
  const completionPercentage = Math.round((completedDocs / totalDocs) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'auto-filled':
        return <Bot className="w-5 h-5 text-blue-500" />;
      case 'missing':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'required':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (doc: DocumentRequirement) => {
    switch (doc.status) {
      case 'complete':
        return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
      case 'auto-filled':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Auto-filled</Badge>;
      case 'missing':
        return <Badge variant="destructive">Missing</Badge>;
      case 'required':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Required</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
            <Link to="/categories" className="hover:text-primary transition-colors">
              Categories
            </Link>
            <span>/</span>
            <Link to={`/products/${categoryId}`} className="hover:text-primary transition-colors">
              {category?.name || 'Category'}
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">{product.name}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <Button variant="ghost" size="sm" asChild className="p-2">
                  <Link to={`/products/${categoryId}`}>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-text-primary">{product.name}</h1>
                  <p className="text-text-secondary mt-1">{product.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-text-secondary" />
                  <span className="font-semibold text-primary">${product.price}</span>
                  <span className="text-text-secondary">per unit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-text-secondary" />
                  <span>{category?.name || 'Export Product'}</span>
                </div>
              </div>
            </div>

            <div className="ml-6">
              <Card className="shadow-soft border-0 min-w-[200px]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Completion</span>
                    <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                      {completionPercentage}%
                    </Badge>
                  </div>
                  <Progress value={completionPercentage} className="h-2 mb-3" />
                  <div className="space-y-1 text-xs text-text-secondary">
                    <div>{completedDocs}/{totalDocs} documents ready</div>
                    {missingRequired > 0 && (
                      <div className="text-red-600">{missingRequired} required missing</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Documents List */}
            <div className="lg:col-span-2">
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Document Requirements</CardTitle>
                  <CardDescription>
                    Review required documents for exporting {product.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockDocuments.map((doc: DocumentRequirement) => (
                      <div 
                        key={doc.id}
                        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                          selectedDoc === doc.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedDoc(doc.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getStatusIcon(doc.status)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-text-primary">{doc.name}</h4>
                                {doc.isRequired && (
                                  <Badge variant="outline" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-text-secondary leading-relaxed">
                                {doc.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                                <span>Est. time: {doc.estimatedTime}</span>
                                {doc.canAutoFill && (
                                  <div className="flex items-center space-x-1">
                                    <Zap className="w-3 h-3" />
                                    <span>Auto-fillable</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {getStatusBadge(doc)}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-border">
                          {doc.status === 'complete' && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </>
                          )}
                          {doc.status === 'auto-filled' && (
                            <>
                              <Button variant="ai" size="sm">
                                <Bot className="w-4 h-4 mr-2" />
                                Auto-fill using Profile
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </>
                          )}
                          {(doc.status === 'missing' || doc.status === 'required') && (
                            <>
                              {doc.canAutoFill && (
                                <Button variant="ai" size="sm">
                                  <Bot className="w-4 h-4 mr-2" />
                                  Fill using AI
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Manually
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ai" className="w-full" disabled={missingRequired > 0}>
                    <Bot className="w-4 h-4 mr-2" />
                    Generate All Documents
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Package
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Completed
                  </Button>
                </CardContent>
              </Card>

              {/* AI Assistant */}
              <Card className="shadow-soft border-0 bg-gradient-primary">
                <CardHeader>
                  <CardTitle className="text-ai-accent-foreground flex items-center space-x-2">
                    <Bot className="w-5 h-5" />
                    <span>AI Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-ai-accent-foreground/90 space-y-3">
                    <p className="font-medium">💡 Smart Suggestions:</p>
                    <ul className="space-y-2 text-xs">
                      <li>• Upload your invoice to auto-fill commercial docs</li>
                      <li>• Check with local authorities for export license</li>
                      <li>• Consider fumigation for UAE exports</li>
                      <li>• Verify shelf life requirements</li>
                    </ul>
                  </div>
                  
                  <Button 
                    variant="surface" 
                    className="w-full bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
                  >
                    Get AI Help
                  </Button>
                </CardContent>
              </Card>

              {/* Document Stats */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Documentation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Total Documents</span>
                    <span className="font-medium">{totalDocs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Required</span>
                    <span className="font-medium">{requiredDocs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Completed</span>
                    <span className="font-medium text-green-600">{completedDocs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Missing Required</span>
                    <span className="font-medium text-red-600">{missingRequired}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDocuments;