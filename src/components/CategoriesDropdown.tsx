import { useState } from "react";
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
  ChevronDown,
  Bot
} from "lucide-react";
import { getAllCategories } from "@/data/staticData";

// Icon mapping for categories
const iconMap: { [key: string]: React.ComponentType<any> } = {
  'agriculture': Wheat,
  'electronics': Cpu,
  'textiles': Shirt,
  'pharmaceuticals': Pill,
  'chemicals': Beaker,
  'autoparts': Car,
  'handicrafts': Hammer,
  'organic': Leaf
};

// Get static categories with icons
const getStaticCategoriesWithIcons = () => {
  return getAllCategories().map(category => ({
    ...category,
    icon: iconMap[category.slug] || Cpu
  }));
};

export const CategoriesDropdown = () => {
  const navigate = useNavigate();
  const { selectedCategory, setSelectedCategory } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get static categories with icons
  const categoriesWithIcons = getStaticCategoriesWithIcons();

  const handleCategorySelect = (category: any) => {
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
          <div className="grid gap-1">
            {categoriesWithIcons.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory?.id === category.id;
            
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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};