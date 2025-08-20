// Static data for categories and products
// This replaces database calls for immediate UI functionality

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  imageUrl?: string;
  categorySlug: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  imageUrl?: string;
}

// Static categories data (original categories from header)
export const staticCategories: Category[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'Agricultural products, farming equipment, seeds, fertilizers, and organic produce for export',
    productCount: 5,
    imageUrl: '/src/assets/agriculture.jpg'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices, components, consumer electronics, and technology products',
    productCount: 5,
    imageUrl: '/src/assets/electronics.jpg'
  },
  {
    id: 'textiles',
    name: 'Textiles',
    slug: 'textiles',
    description: 'Textile products, fabrics, garments, home textiles, and fashion accessories',
    productCount: 5,
    imageUrl: '/src/assets/textiles.jpg'
  },
  {
    id: 'pharmaceuticals',
    name: 'Pharmaceuticals',
    slug: 'pharmaceuticals',
    description: 'Pharmaceutical products, medicines, healthcare supplies, and medical equipment',
    productCount: 5,
    imageUrl: '/src/assets/pharmaceuticals.jpg'
  },
  {
    id: 'chemicals',
    name: 'Chemicals',
    slug: 'chemicals',
    description: 'Industrial chemicals, specialty chemicals, petrochemicals, and chemical compounds',
    productCount: 5,
    imageUrl: '/src/assets/chemicals.jpg'
  },
  {
    id: 'autoparts',
    name: 'Auto Parts',
    slug: 'autoparts',
    description: 'Automotive parts, components, accessories, and vehicle maintenance products',
    productCount: 5,
    imageUrl: '/src/assets/autoparts.jpg'
  },
  {
    id: 'handicrafts',
    name: 'Handicrafts',
    slug: 'handicrafts',
    description: 'Traditional handicrafts, artisan products, decorative items, and cultural artifacts',
    productCount: 5,
    imageUrl: '/src/assets/handicrafts.jpg'
  },
  {
    id: 'organic',
    name: 'Organic Products',
    slug: 'organic',
    description: 'Organic food products, natural cosmetics, eco-friendly items, and sustainable goods',
    productCount: 5,
    imageUrl: '/src/assets/organic.jpg'
  }
];

// Static products data for all categories
export const staticProducts: Product[] = [
  // Agriculture Category Products
  {
    id: 'agri-1',
    name: 'Organic Basmati Rice',
    slug: 'organic-basmati-rice',
    description: 'Premium quality organic basmati rice grown without pesticides or chemicals. Long grain, aromatic, and perfect for export. Certified organic and sustainably farmed with traditional methods.',
    shortDescription: 'Premium organic basmati rice for export',
    price: 45.99,
    categorySlug: 'agriculture',
    sortOrder: 1
  },
  {
    id: 'agri-2',
    name: 'Fresh Turmeric Powder',
    slug: 'fresh-turmeric-powder',
    description: 'High-quality turmeric powder with high curcumin content. Sourced directly from farms, processed hygienically, and packed for international markets. Rich in antioxidants and anti-inflammatory properties.',
    shortDescription: 'High-curcumin turmeric powder',
    price: 12.99,
    categorySlug: 'agriculture',
    sortOrder: 2
  },
  {
    id: 'agri-3',
    name: 'Premium Tea Leaves',
    slug: 'premium-tea-leaves',
    description: 'Hand-picked premium tea leaves from high-altitude gardens. Available in black, green, and white varieties. Perfect for international tea markets with authentic flavor and aroma.',
    shortDescription: 'Hand-picked premium tea leaves',
    price: 28.99,
    categorySlug: 'agriculture',
    sortOrder: 3
  },
  {
    id: 'agri-4',
    name: 'Cashew Nuts Grade A',
    slug: 'cashew-nuts-grade-a',
    description: 'Grade A cashew nuts, carefully processed and sorted. Rich in nutrients, perfect for snacking and culinary use. Export quality with international certifications and premium packaging.',
    shortDescription: 'Grade A export quality cashew nuts',
    price: 89.99,
    categorySlug: 'agriculture',
    sortOrder: 4
  },
  {
    id: 'agri-5',
    name: 'Virgin Coconut Oil',
    slug: 'virgin-coconut-oil',
    description: 'Cold-pressed virgin coconut oil with natural aroma and taste. Rich in MCTs, perfect for cooking and cosmetic applications. Export grade quality with organic certification.',
    shortDescription: 'Cold-pressed virgin coconut oil',
    price: 24.99,
    categorySlug: 'agriculture',
    sortOrder: 5
  },

  // Electronics Category Products
  {
    id: 'elec-1',
    name: 'LED Display Modules',
    slug: 'led-display-modules',
    description: 'High-resolution LED display modules for digital signage and advertising. Energy-efficient, long-lasting, and suitable for indoor/outdoor applications. Available in various sizes and pixel pitches.',
    shortDescription: 'High-resolution LED display modules',
    price: 299.99,
    categorySlug: 'electronics',
    sortOrder: 1
  },
  {
    id: 'elec-2',
    name: 'PCB Circuit Boards',
    slug: 'pcb-circuit-boards',
    description: 'Custom PCB circuit boards manufactured to international standards. Multi-layer options available, perfect for electronic device manufacturers. High-quality materials and precise manufacturing.',
    shortDescription: 'Custom PCB circuit boards',
    price: 15.99,
    categorySlug: 'electronics',
    sortOrder: 2
  },
  {
    id: 'elec-3',
    name: 'Universal Power Adapters',
    slug: 'universal-power-adapters',
    description: 'Universal power adapters with multiple voltage options. CE, FCC certified, suitable for various electronic devices and international markets. Compact design with safety features.',
    shortDescription: 'Universal power adapters certified',
    price: 19.99,
    categorySlug: 'electronics',
    sortOrder: 3
  },
  {
    id: 'elec-4',
    name: 'Portable Bluetooth Speakers',
    slug: 'portable-bluetooth-speakers',
    description: 'High-quality portable Bluetooth speakers with excellent sound quality. Waterproof design, long battery life, perfect for consumer markets. Premium audio experience in compact form.',
    shortDescription: 'Portable waterproof Bluetooth speakers',
    price: 79.99,
    categorySlug: 'electronics',
    sortOrder: 4
  },
  {
    id: 'elec-5',
    name: 'Premium USB Cables',
    slug: 'premium-usb-cables',
    description: 'Premium USB cables with fast charging and data transfer capabilities. Durable construction, multiple connector types available for bulk orders. High-speed data transfer and reliable charging.',
    shortDescription: 'Premium fast-charging USB cables',
    price: 8.99,
    categorySlug: 'electronics',
    sortOrder: 5
  },

  // Textiles Category Products
  {
    id: 'text-1',
    name: 'Cotton Bed Sheets Set',
    slug: 'cotton-bed-sheets-set',
    description: '100% pure cotton bed sheet sets with high thread count. Soft, breathable, and durable. Available in various sizes and colors for international markets. Premium quality comfort.',
    shortDescription: '100% pure cotton bed sheet sets',
    price: 49.99,
    categorySlug: 'textiles',
    sortOrder: 1
  },
  {
    id: 'text-2',
    name: 'Handwoven Silk Scarves',
    slug: 'handwoven-silk-scarves',
    description: 'Handwoven silk scarves with traditional patterns and modern designs. Premium quality silk, perfect for fashion accessories and gift markets. Elegant and luxurious feel.',
    shortDescription: 'Handwoven silk scarves premium quality',
    price: 89.99,
    categorySlug: 'textiles',
    sortOrder: 2
  },
  {
    id: 'text-3',
    name: 'Premium Denim Fabric',
    slug: 'premium-denim-fabric',
    description: 'Premium denim fabric in various weights and washes. High-quality cotton blend, perfect for garment manufacturers and fashion brands. Durable and stylish material.',
    shortDescription: 'Premium denim fabric for garments',
    price: 12.99,
    categorySlug: 'textiles',
    sortOrder: 3
  },
  {
    id: 'text-4',
    name: 'Embroidered Table Runners',
    slug: 'embroidered-table-runners',
    description: 'Beautiful embroidered table runners with traditional motifs. Hand-crafted by skilled artisans, perfect for home décor and hospitality markets. Intricate designs and quality craftsmanship.',
    shortDescription: 'Hand-embroidered table runners',
    price: 34.99,
    categorySlug: 'textiles',
    sortOrder: 4
  },
  {
    id: 'text-5',
    name: 'Organic Cotton T-Shirts',
    slug: 'organic-cotton-t-shirts',
    description: 'Organic cotton t-shirts in various sizes and colors. Soft, comfortable, and eco-friendly. Perfect for private label and retail markets. Sustainable fashion choice.',
    shortDescription: 'Organic cotton t-shirts eco-friendly',
    price: 15.99,
    categorySlug: 'textiles',
    sortOrder: 5
  },

  // Pharmaceuticals Category Products
  {
    id: 'pharma-1',
    name: 'Ayurvedic Herbal Capsules',
    slug: 'ayurvedic-herbal-capsules',
    description: 'Traditional Ayurvedic herbal capsules made from pure herbs. GMP certified, tested for quality and purity. Perfect for natural health markets with authentic formulations.',
    shortDescription: 'GMP certified Ayurvedic herbal capsules',
    price: 29.99,
    categorySlug: 'pharmaceuticals',
    sortOrder: 1
  },
  {
    id: 'pharma-2',
    name: 'Vitamin D3 Tablets',
    slug: 'vitamin-d3-tablets',
    description: 'High-potency Vitamin D3 tablets manufactured under strict quality controls. WHO-GMP certified facility, suitable for international pharmaceutical markets. Essential for bone health.',
    shortDescription: 'High-potency Vitamin D3 tablets',
    price: 19.99,
    categorySlug: 'pharmaceuticals',
    sortOrder: 2
  },
  {
    id: 'pharma-3',
    name: 'Antiseptic Hand Sanitizer',
    slug: 'antiseptic-hand-sanitizer',
    description: 'WHO-formula antiseptic hand sanitizer with 70% alcohol content. Bulk packaging available, perfect for healthcare and institutional markets. Effective against germs and viruses.',
    shortDescription: 'WHO-formula antiseptic hand sanitizer',
    price: 8.99,
    categorySlug: 'pharmaceuticals',
    sortOrder: 3
  },
  {
    id: 'pharma-4',
    name: 'Surgical Face Masks',
    slug: 'surgical-face-masks',
    description: '3-ply surgical face masks with high filtration efficiency. CE marked, FDA approved, suitable for medical and healthcare applications. Premium protection and comfort.',
    shortDescription: '3-ply surgical face masks CE marked',
    price: 0.25,
    categorySlug: 'pharmaceuticals',
    sortOrder: 4
  },
  {
    id: 'pharma-5',
    name: 'Paracetamol Tablets',
    slug: 'paracetamol-tablets',
    description: 'High-quality paracetamol tablets manufactured in WHO-GMP certified facility. Various strengths available, perfect for pharmaceutical distributors. Reliable pain relief medication.',
    shortDescription: 'WHO-GMP paracetamol tablets',
    price: 5.99,
    categorySlug: 'pharmaceuticals',
    sortOrder: 5
  },

  // Chemicals Category Products
  {
    id: 'chem-1',
    name: 'Sodium Bicarbonate Food Grade',
    slug: 'sodium-bicarbonate-food-grade',
    description: 'Food grade sodium bicarbonate with high purity levels. Suitable for food processing, pharmaceutical, and industrial applications. Bulk quantities available with quality assurance.',
    shortDescription: 'Food grade sodium bicarbonate',
    price: 299.99,
    categorySlug: 'chemicals',
    sortOrder: 1
  },
  {
    id: 'chem-2',
    name: 'Citric Acid Anhydrous',
    slug: 'citric-acid-anhydrous',
    description: 'High purity citric acid anhydrous for food, pharmaceutical, and industrial use. Kosher and Halal certified, perfect for international markets. Versatile chemical compound.',
    shortDescription: 'High purity citric acid anhydrous',
    price: 189.99,
    categorySlug: 'chemicals',
    sortOrder: 2
  },
  {
    id: 'chem-3',
    name: 'Calcium Carbonate Powder',
    slug: 'calcium-carbonate-powder',
    description: 'Precipitated calcium carbonate powder with various mesh sizes. Suitable for paint, plastic, rubber, and pharmaceutical industries. High whiteness and purity.',
    shortDescription: 'Precipitated calcium carbonate powder',
    price: 149.99,
    categorySlug: 'chemicals',
    sortOrder: 3
  },
  {
    id: 'chem-4',
    name: 'Titanium Dioxide Rutile',
    slug: 'titanium-dioxide-rutile',
    description: 'High-grade titanium dioxide rutile for paint, coating, and plastic applications. Excellent opacity and brightness, suitable for premium applications. Superior quality pigment.',
    shortDescription: 'High-grade titanium dioxide rutile',
    price: 899.99,
    categorySlug: 'chemicals',
    sortOrder: 4
  },
  {
    id: 'chem-5',
    name: 'Glacial Acetic Acid',
    slug: 'glacial-acetic-acid',
    description: 'Glacial acetic acid with 99.8% purity. Industrial grade for chemical synthesis, textile processing, and pharmaceutical intermediate applications. High purity chemical.',
    shortDescription: 'Glacial acetic acid 99.8% purity',
    price: 199.99,
    categorySlug: 'chemicals',
    sortOrder: 5
  },

  // Auto Parts Category Products
  {
    id: 'auto-1',
    name: 'Premium Brake Pads',
    slug: 'premium-brake-pads',
    description: 'Premium quality brake pads with excellent stopping power and durability. Suitable for various car models, manufactured to international standards. Safety and performance guaranteed.',
    shortDescription: 'Premium quality brake pads',
    price: 45.99,
    categorySlug: 'autoparts',
    sortOrder: 1
  },
  {
    id: 'auto-2',
    name: 'Engine Air Filters',
    slug: 'engine-air-filters',
    description: 'High-efficiency engine air filters with superior filtration. Compatible with multiple vehicle models, perfect for aftermarket distribution. Improved engine performance.',
    shortDescription: 'High-efficiency engine air filters',
    price: 12.99,
    categorySlug: 'autoparts',
    sortOrder: 2
  },
  {
    id: 'auto-3',
    name: 'Heavy Duty Shock Absorbers',
    slug: 'heavy-duty-shock-absorbers',
    description: 'Heavy-duty shock absorbers for commercial and passenger vehicles. Excellent ride comfort and handling, suitable for various terrains. Durable and reliable performance.',
    shortDescription: 'Heavy-duty shock absorbers',
    price: 89.99,
    categorySlug: 'autoparts',
    sortOrder: 3
  },
  {
    id: 'auto-4',
    name: 'LED Headlight Bulbs',
    slug: 'led-headlight-bulbs',
    description: 'High-brightness LED headlight bulbs with long lifespan. Energy-efficient, easy installation, compatible with most vehicle models. Superior lighting performance.',
    shortDescription: 'High-brightness LED headlight bulbs',
    price: 29.99,
    categorySlug: 'autoparts',
    sortOrder: 4
  },
  {
    id: 'auto-5',
    name: 'Radiator Cooling System',
    slug: 'radiator-cooling-system',
    description: 'Efficient radiator cooling systems for various vehicle types. Aluminum construction, excellent heat dissipation, OEM quality standards. Reliable cooling performance.',
    shortDescription: 'Efficient radiator cooling systems',
    price: 199.99,
    categorySlug: 'autoparts',
    sortOrder: 5
  },

  // Handicrafts Category Products
  {
    id: 'craft-1',
    name: 'Wooden Carved Sculptures',
    slug: 'wooden-carved-sculptures',
    description: 'Handcrafted wooden sculptures by skilled artisans. Traditional and contemporary designs, perfect for home décor and gift markets worldwide. Unique artistic pieces.',
    shortDescription: 'Handcrafted wooden sculptures',
    price: 149.99,
    categorySlug: 'handicrafts',
    sortOrder: 1
  },
  {
    id: 'craft-2',
    name: 'Brass Decorative Items',
    slug: 'brass-decorative-items',
    description: 'Traditional brass decorative items including vases, figurines, and ornaments. Hand-polished finish, perfect for interior decoration and collectibles. Timeless elegance.',
    shortDescription: 'Traditional brass decorative items',
    price: 79.99,
    categorySlug: 'handicrafts',
    sortOrder: 2
  },
  {
    id: 'craft-3',
    name: 'Handwoven Carpets',
    slug: 'handwoven-carpets',
    description: 'Exquisite handwoven carpets with intricate patterns and vibrant colors. Made from premium wool and silk, perfect for luxury home markets. Masterpiece craftsmanship.',
    shortDescription: 'Exquisite handwoven carpets',
    price: 599.99,
    categorySlug: 'handicrafts',
    sortOrder: 3
  },
  {
    id: 'craft-4',
    name: 'Ceramic Pottery Set',
    slug: 'ceramic-pottery-set',
    description: 'Beautiful ceramic pottery sets including bowls, plates, and decorative pieces. Hand-painted designs, microwave and dishwasher safe. Functional art pieces.',
    shortDescription: 'Beautiful ceramic pottery sets',
    price: 89.99,
    categorySlug: 'handicrafts',
    sortOrder: 4
  },
  {
    id: 'craft-5',
    name: 'Bamboo Home Accessories',
    slug: 'bamboo-home-accessories',
    description: 'Eco-friendly bamboo home accessories including storage boxes, serving trays, and decorative items. Sustainable and stylish for modern homes. Natural elegance.',
    shortDescription: 'Eco-friendly bamboo home accessories',
    price: 34.99,
    categorySlug: 'handicrafts',
    sortOrder: 5
  },

  // Organic Products Category Products
  {
    id: 'org-1',
    name: 'Raw Organic Honey',
    slug: 'raw-organic-honey',
    description: 'Pure raw organic honey harvested from pristine environments. Unprocessed, unfiltered, and rich in natural enzymes. Perfect for health-conscious consumers seeking natural sweetness.',
    shortDescription: 'Pure raw organic honey unprocessed',
    price: 24.99,
    categorySlug: 'organic',
    sortOrder: 1
  },
  {
    id: 'org-2',
    name: 'Organic Coconut Oil',
    slug: 'organic-coconut-oil',
    description: 'Cold-pressed organic coconut oil with natural aroma. Virgin quality, perfect for cooking, skincare, and hair care applications. Multi-purpose natural product.',
    shortDescription: 'Cold-pressed organic coconut oil',
    price: 19.99,
    categorySlug: 'organic',
    sortOrder: 2
  },
  {
    id: 'org-3',
    name: 'Organic Spice Mix',
    slug: 'organic-spice-mix',
    description: 'Certified organic spice mixes with authentic flavors. No artificial additives, perfect for gourmet cooking and international food markets. Pure and natural taste.',
    shortDescription: 'Certified organic spice mixes',
    price: 15.99,
    categorySlug: 'organic',
    sortOrder: 3
  },
  {
    id: 'org-4',
    name: 'Organic Skincare Set',
    slug: 'organic-skincare-set',
    description: 'Natural organic skincare set with plant-based ingredients. Chemical-free, cruelty-free, perfect for premium beauty and wellness markets. Gentle and effective care.',
    shortDescription: 'Natural organic skincare set',
    price: 89.99,
    categorySlug: 'organic',
    sortOrder: 4
  },
  {
    id: 'org-5',
    name: 'Organic Herbal Tea',
    slug: 'organic-herbal-tea',
    description: 'Premium organic herbal tea blends with medicinal properties. Caffeine-free, naturally flavored, perfect for health and wellness markets. Therapeutic and delicious.',
    shortDescription: 'Premium organic herbal tea blends',
    price: 18.99,
    categorySlug: 'organic',
    sortOrder: 5
  }
];

// Helper functions to get data
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return staticCategories.find(category => category.slug === slug);
};

export const getProductsByCategory = (categorySlug: string): Product[] => {
  return staticProducts.filter(product => product.categorySlug === categorySlug);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return staticProducts.find(product => product.slug === slug);
};

export const getProductById = (id: string): Product | undefined => {
  return staticProducts.find(product => product.id === id);
};

export const getAllCategories = (): Category[] => {
  return staticCategories;
};

export const getAllProducts = (): Product[] => {
  return staticProducts;
};