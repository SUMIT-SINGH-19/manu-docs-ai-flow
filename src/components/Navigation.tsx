import { useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import ProfilePanel from "@/components/ProfilePanel";
import { CategoriesDropdown } from "@/components/CategoriesDropdown";
import { UploadModal } from "@/components/UploadModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Upload, 
  LayoutDashboard, 
  HelpCircle, 
  FileText, 
  Bot,
  Menu,
  X,
  LogOut,
  Settings,
  User
} from "lucide-react";

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/help", label: "Help", icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface-elevated/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/a4e2c54d-dfd5-4ce6-be53-6fa097c2b2da.png" 
                  alt="ManuDocs Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-bold text-xl text-text-primary">ManuDocs</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <CategoriesDropdown />
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Button>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive(item.to)
                      ? "text-primary bg-primary/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* AI Assistant Button */}
            <Button variant="surface" size="sm" className="hidden sm:flex">
              <Bot className="w-4 h-4" />
              <span>AI Assistant</span>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/01.png" alt="@user" />
                    <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Rajesh Kumar</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      rajesh@exportindia.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-surface border-t border-border">
              <div className="p-3">
                <CategoriesDropdown />
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  setIsUploadModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.to)
                        ? "text-primary bg-primary/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-accent"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <div className="pt-2">
                <Button variant="surface" className="w-full justify-start">
                  <Bot className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Profile Panel */}
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      
      {/* Upload Modal */}
      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </nav>
  );
};