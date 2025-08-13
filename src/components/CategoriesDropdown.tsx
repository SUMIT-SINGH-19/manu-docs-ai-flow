import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Wheat, 
  Pill, 
  Shirt, 
  Hammer, 
  Cpu, 
  Beaker, 
  Car,
  Leaf,
  TrendingUp,
  ChevronDown,
  Package,
  Loader2,
  Bot
} from "lucide-react";
import { categoriesAPI, Category } from "@/lib/categoriesAPI";

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

export const CategoriesDropdown = () => {
  const navigate = useNavigate();
  const { selectedCategory, setSelectedCategory } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories when dropdown opens
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await categoriesAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (categorySlug: string) => {
    return iconMap[categorySlug] || Package;
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory({ id: category.slug, name: category.name });
    setIsOpen(false);
    navigate(`/products/${category.slug}`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Categories</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="start">
        <div className="p-2">
          <div className="text-sm font-medium text-text-primary mb-3 px-2">
            Select Export Category
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="ml-2 text-sm text-text-secondary">Loading categories...</span>
            </div>
          ) : (
            <div className="grid gap-1">
              {categories.map((category) => {
                const Icon = getIcon(category.slug);
                const isActive = selectedCategory?.id === category.id; // Fixed: use category.id instead of category.slug
              
                return (
                  <DropdownMenuItem
                    key={category.id}
                    className={`p-3 cursor-pointer rounded-lg transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="flex items-start space-x-3 w-full">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-primary/20' : 'bg-accent'
                      }`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-text-secondary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{category.name}</h4>
                          <div className="flex items-center space-x-1">
                            {category.productCount === 0 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                <Bot className="w-2.5 h-2.5 mr-0.5" />
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary mb-1 line-clamp-1">
                          {category.description}
                        </p>
                        <div className="text-xs text-text-secondary">
                          {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};