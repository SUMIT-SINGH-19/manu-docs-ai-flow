import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import AIExtraction from "./pages/AIExtraction";
import CategorySelection from "./pages/CategorySelection";
import ProductListing from "./pages/ProductListing";
import ProductDocuments from "./pages/ProductDocuments";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import ProfileSetup from "./pages/ProfileSetup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-surface">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route path="/categories" element={<CategorySelection />} />
            <Route path="/products/:categoryId" element={<ProductListing />} />
            <Route path="/product/:categoryId/:productId" element={<ProductDocuments />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/extraction" element={<AIExtraction />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
