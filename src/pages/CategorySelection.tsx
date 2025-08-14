import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Wheat, 
  Pill, 
  Shirt, 
  Hammer, 
  Cpu, 
  Beaker, 
  Car,
  Leaf,
  ArrowRight,
  TrendingUp,
  Loader2,
  Package
} from "lucide-react";
import { getAllCategories, getAllProducts, Category } from "@/data/staticData";

// Icon mapping for categories
const iconMap: { [key: string]: React.ComponentType<any> } = {
  'electronics': Cpu,
  'books': Package,
  'software': Cpu,
  'health': Pill,
  'home-garden': Leaf,
  'fashion': Shirt,
  'sports': Package,
  'automotive': Car,
  'agriculture': Wheat,
  'pharmaceuticals': Pill,
  'textiles': Shirt,
  'handicrafts': Hammer,
  'chemicals': Beaker,
  'autoparts': Car,
  'organic': Leaf
};

const CategorySelection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ totalCategories: 0, totalProducts: 0 });

  // Load static data
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        const categoriesData = getAllCategories();
        const productsData = getAllProducts();
        
        setCategories(categoriesData);
        setStats({
          totalCategories: categoriesData.length,
          totalProducts: productsData.length
        });
        setLoading(false);
      }, 500);
    };

    loadData();
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (categorySlug: string) => {
    return iconMap[categorySlug] || Package;
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-text-secondary">Loading categories...</span>
            </div>
          )}

          {/* Content - only show when not loading */}
          {!loading && (
            <>
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-text-primary mb-4">
                  Select Your Product Category
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                  Choose your export category to access tailored documentation templates and AI-powered assistance
                </p>
              </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-center"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-soft border-0 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">{stats.totalProducts}</div>
                <div className="text-sm text-text-secondary">Total Products</div>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-0 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">{stats.totalCategories}</div>
                <div className="text-sm text-text-secondary">Categories</div>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-0 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">AI</div>
                <div className="text-sm text-text-secondary">Powered</div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const Icon = getIcon(category.slug);
              return (
                <Link key={category.id} to={`/products/${category.slug}`}>
                  <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 group cursor-pointer h-full overflow-hidden">
                    {/* Category Image */}
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                      {category.imageUrl ? (
                        <img 
                          src={category.imageUrl} 
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-16 h-16 text-primary/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
                        {category.productCount === 0 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white/90 text-gray-800">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            AI Summary
                          </Badge>
                        )}
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800"
                        >
                          {category.productCount > 0 ? 'Products' : 'AI Powered'}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-text-secondary">
                          {category.productCount > 0 
                            ? `${category.productCount} products` 
                            : 'AI Document Summary'
                          }
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
              );
            })}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No categories found</h3>
              <p className="text-text-secondary mb-4">
                Try adjusting your search terms or browse all categories
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </div>
          )}

          {/* Help Section */}
          <Card className="shadow-medium border-0 bg-gradient-primary mt-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-ai-accent-foreground mb-3">
                Don't see your category?
              </h3>
              <p className="text-ai-accent-foreground/90 mb-6 max-w-2xl mx-auto">
                We're constantly adding new product categories. Contact our support team to request 
                a new category or get help finding the right classification for your products.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="surface" 
                  className="bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
                >
                  Request Category
                </Button>
                <Button 
                  variant="surface" 
                  className="bg-white/20 text-ai-accent-foreground border-white/30 hover:bg-white/30"
                  asChild
                >
                  <Link to="/help">Get Help</Link>
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

export default CategorySelection;