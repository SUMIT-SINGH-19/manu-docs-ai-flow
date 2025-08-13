import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Package, 
  Loader2, 
  AlertCircle,
  Bot,
  FileText,
  MessageCircle,
  Zap
} from "lucide-react";
import { categoriesAPI, Category, Product } from "@/lib/categoriesAPI";
import { toast } from "sonner";
import DocumentSummary from "./DocumentSummary";

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categorySlug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const categoryInfo = await categoriesAPI.getCategoryInfo(categorySlug);
        
        if (!categoryInfo.category) {
          setError('Category not found');
          return;
        }
        
        setCategory(categoryInfo.category);
        setProducts(categoryInfo.products);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load category';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-text-secondary">Loading category...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <Card className="shadow-medium border-0 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {error || 'Category Not Found'}
            </h3>
            <p className="text-text-secondary mb-4">
              The requested category could not be found or loaded.
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

  // If category has no products, show Document Summary feature
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
              <Link to="/categories" className="hover:text-primary transition-colors">
                Categories
              </Link>
              <span>/</span>
              <span className="text-text-primary font-medium">{category.name}</span>
            </div>

            {/* Category Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Button variant="ghost" size="sm" asChild className="p-2">
                  <Link to="/categories">
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold text-text-primary">{category.name}</h1>
              </div>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-6">
                {category.description}
              </p>
              
              {/* No Products Message */}
              <Card className="shadow-medium border-0 bg-gradient-primary mb-8">
                <CardContent className="p-6 text-center">
                  <Bot className="w-12 h-12 text-ai-accent-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-ai-accent-foreground mb-3">
                    AI-Powered Document Processing Available
                  </h3>
                  <p className="text-ai-accent-foreground/90 mb-4">
                    While we're building our {category.name.toLowerCase()} product catalog, 
                    you can use our AI Document Summary feature to process any business documents.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="surface" 
                      className="bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
                      asChild
                    >
                      <Link to="/document-summary">
                        <FileText className="w-4 h-4 mr-2" />
                        Try AI Document Summary
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-soft border-0 text-center">
                <CardContent className="p-6">
                  <Zap className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-text-primary mb-2">Lightning Fast</h3>
                  <p className="text-sm text-text-secondary">
                    Get AI summaries in under 60 seconds
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft border-0 text-center">
                <CardContent className="p-6">
                  <MessageCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-text-primary mb-2">WhatsApp Delivery</h3>
                  <p className="text-sm text-text-secondary">
                    Receive summaries directly on WhatsApp
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft border-0 text-center">
                <CardContent className="p-6">
                  <Bot className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-text-primary mb-2">AI Powered</h3>
                  <p className="text-sm text-text-secondary">
                    Advanced Gemini AI for accurate summaries
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="shadow-medium border-0">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  Ready to Process Your {category.name} Documents?
                </h3>
                <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                  Upload your business documents and get professional AI-generated summaries 
                  delivered to your WhatsApp instantly.
                </p>
                <Button size="lg" asChild>
                  <Link to="/document-summary">
                    <Bot className="w-5 h-5 mr-2" />
                    Start Document Processing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If category has products, show products listing
  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
            <Link to="/categories" className="hover:text-primary transition-colors">
              Categories
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">{category.name}</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Button variant="ghost" size="sm" asChild className="p-2">
                  <Link to="/categories">
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold text-text-primary">
                  {category.name}
                </h1>
              </div>
              <p className="text-text-secondary">
                {category.description}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline">
                {products.length} products
              </Badge>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 group cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    {product.price && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        ${product.price}
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {product.shortDescription || product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-sm text-text-secondary">
                      {category.name}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="group-hover:translate-x-1 transition-transform p-2"
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;