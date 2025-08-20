import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ArrowLeft, 
  ArrowRight,
  Package,
  DollarSign,
  Bot,
  Loader2
} from "lucide-react";
import { getCategoryBySlug, getProductsByCategory, Product, Category } from "@/data/staticData";

const ProductListing = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  // Load static data
  useEffect(() => {
    const loadData = () => {
      if (!categoryId) return;
      
      setLoading(true);
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        const categoryData = getCategoryBySlug(categoryId);
        const productsData = getProductsByCategory(categoryId);
        
        setCategory(categoryData || null);
        setProducts(productsData);
        setLoading(false);
      }, 500);
    };

    loadData();
  }, [categoryId]);

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-text-secondary">Loading products...</span>
            </div>
          )}



          {/* Content - only show when not loading */}
          {!loading && (
            <>
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
                <Link to="/categories" className="hover:text-primary transition-colors">
                  Categories
                </Link>
                <span>/</span>
                <span className="text-text-primary font-medium">{category?.name || 'Products'}</span>
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
                      {category?.name || 'Products'}
                    </h1>
                  </div>
                  <p className="text-text-secondary">
                    {category?.description || 'Select a product to view documentation requirements and templates'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">
                    {products.length} products
                  </Badge>
                  <Badge variant="secondary">
                    Export Ready
                  </Badge>
                </div>
              </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <Input
                placeholder="Search products, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('name')}
              >
                A-Z
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('price')}
              >
                Price
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} to={`/product/${categoryId}/${product.id}`}>
                <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 group cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          Export Ready
                        </Badge>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed line-clamp-2">
                      {product.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-text-secondary" />
                      <span className="text-lg font-semibold text-primary">${product.price}</span>
                      <span className="text-sm text-text-secondary">per unit</span>
                    </div>

                    {/* Category */}
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-text-secondary" />
                      <Badge variant="secondary" className="text-xs">
                        {category?.name}
                      </Badge>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-sm text-text-secondary">
                        View Details
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="group-hover:translate-x-1 transition-transform p-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No products found</h3>
              <p className="text-text-secondary mb-4">
                Try adjusting your search terms or browse all products in this category
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </div>
          )}

          {/* Document Summary Feature Highlight */}
          <Card className="shadow-medium border-0 bg-gradient-primary mt-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-ai-accent-foreground mb-3">
                🚀 New Feature: AI Document Summary & WhatsApp Delivery
              </h3>
              <p className="text-ai-accent-foreground/90 mb-6 max-w-2xl mx-auto">
                Upload any document and get AI-generated summaries delivered directly to your WhatsApp. 
                Perfect for quick document insights, contract reviews, and business analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="surface" 
                  className="bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
                  asChild
                >
                  <Link to="/document-summary">
                    <Bot className="w-4 h-4 mr-2" />
                    Try Document Summary
                  </Link>
                </Button>
                <Button 
                  variant="surface" 
                  className="bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
                >
                  AI Product Matcher
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-medium border-0 mt-8">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium text-text-primary mb-3">
                Can't find your specific product?
              </h3>
              <p className="text-text-secondary mb-4 max-w-xl mx-auto">
                Use our AI-powered product matcher or contact our support team for assistance 
                with product classification and documentation requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline">
                  AI Product Matcher
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/help">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;