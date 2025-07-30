import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectedCategory {
  id: string;
  name: string;
}

interface SelectedProduct {
  id: string;
  name: string;
  categoryId: string;
}

interface AppState {
  selectedCategory: SelectedCategory | null;
  selectedProduct: SelectedProduct | null;
  setSelectedCategory: (category: SelectedCategory | null) => void;
  setSelectedProduct: (product: SelectedProduct | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);

  return (
    <AppContext.Provider
      value={{
        selectedCategory,
        selectedProduct,
        setSelectedCategory,
        setSelectedProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};