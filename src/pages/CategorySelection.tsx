import { useState } from "react";
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
  TrendingUp
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  productCount: number;
  popularity: 'High' | 'Medium' | 'Low';
  trending?: boolean;
}

const categories: Category[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Fresh produce, spices, grains, and organic products',
    icon: Wheat,
    productCount: 245,
    popularity: 'High',
    trending: true
  },
  {
    id: 'pharmaceuticals',
    name: 'Pharmaceuticals',
    description: 'Medicines, APIs, medical devices, and healthcare products',
    icon: Pill,
    productCount: 156,
    popularity: 'High'
  },
  {
    id: 'textiles',
    name: 'Textiles',
    description: 'Fabrics, garments, home textiles, and fashion accessories',
    icon: Shirt,
    productCount: 189,
    popularity: 'Medium',
    trending: true
  },
  {
    id: 'handicrafts',
    name: 'Handicrafts',
    description: 'Traditional crafts, jewelry, artwork, and decorative items',
    icon: Hammer,
    productCount: 78,
    popularity: 'Medium'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Components, devices, software, and tech equipment',
    icon: Cpu,
    productCount: 234,
    popularity: 'High'
  },
  {
    id: 'chemicals',
    name: 'Chemicals',
    description: 'Industrial chemicals, polymers, and specialty chemicals',
    icon: Beaker,
    productCount: 167,
    popularity: 'Medium'
  },
  {
    id: 'autoparts',
    name: 'Auto Parts',
    description: 'Vehicle components, accessories, and automotive supplies',
    icon: Car,
    productCount: 143,
    popularity: 'High'
  },
  {
    id: 'organic',
    name: 'Organic Products',
    description: 'Certified organic foods, cosmetics, and sustainable goods',
    icon: Leaf,
    productCount: 89,
    popularity: 'Low',
    trending: true
  }
];

const CategorySelection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-amber-100 text-amber-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
                <div className="text-2xl font-bold text-primary mb-1">1,234</div>
                <div className="text-sm text-text-secondary">Total Products</div>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-0 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">8</div>
                <div className="text-sm text-text-secondary">Categories</div>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-0 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">50+</div>
                <div className="text-sm text-text-secondary">Document Types</div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.id} to={`/products/${category.id}`}>
                  <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300 group cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {category.trending && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-0.5 ${getPopularityColor(category.popularity)}`}
                          >
                            {category.popularity}
                          </Badge>
                        </div>
                      </div>
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
                          {category.productCount} products
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
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;