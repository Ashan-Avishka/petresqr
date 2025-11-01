// lib/tags.ts - Tags data and utilities

export interface Tag {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Multiple images for gallery
  category: 'dogs' | 'cats' | 'others';
  description: string;
  features: string[];
  specifications: {
    material: string;
    size: string;
    weight: string;
    durability: string;
    waterproof: boolean;
    warranty: string;
  };
  inStock: boolean;
  rating: number;
  reviews: number;
  badge?: 'bestseller' | 'new' | 'sale' | 'featured';
  colors?: string[];
  dimensions?: {
    length: number;
    width: number;
    thickness: number;
  };
}

export const tagsData: Tag[] = [
  {
    id: '1',
    slug: 'classic-qr-tag',
    name: 'Classic QR Tag',
    price: 29,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png', '/images/tag-img.png', '/images/tag-img.png'],
    category: 'dogs',
    description: 'Our most popular QR tag designed for everyday use. Durable, lightweight, and easy to scan. Perfect for dogs of all sizes.',
    features: [
      'Quick QR code scanning',
      'Scratch-resistant coating',
      'Lightweight design',
      'Easy attachment to any collar',
      'Lifetime QR code guarantee'
    ],
    specifications: {
      material: 'Anodized Aluminum',
      size: '30mm diameter',
      weight: '5g',
      durability: 'Scratch-resistant',
      waterproof: true,
      warranty: '2 years'
    },
    inStock: true,
    rating: 4.8,
    reviews: 342,
    badge: 'bestseller',
    colors: ['Silver', 'Black', 'Gold'],
    dimensions: { length: 30, width: 30, thickness: 2 }
  },
  {
    id: '2',
    slug: 'premium-metal-tag',
    name: 'Premium Metal Tag',
    price: 45,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png', '/images/tag-img.png'],
    category: 'cats',
    description: 'Elegant stainless steel tag with a polished finish. Designed specifically for cats with a lighter weight and smaller profile.',
    features: [
      'Premium stainless steel construction',
      'Whisper-quiet design',
      'Engraving included',
      'Anti-tarnish coating',
      'Perfect for sensitive cats'
    ],
    specifications: {
      material: 'Stainless Steel 316L',
      size: '25mm diameter',
      weight: '3g',
      durability: 'Corrosion-resistant',
      waterproof: true,
      warranty: '3 years'
    },
    inStock: true,
    rating: 4.9,
    reviews: 218,
    badge: 'featured',
    colors: ['Silver', 'Rose Gold'],
    dimensions: { length: 25, width: 25, thickness: 1.5 }
  },
  {
    id: '3',
    slug: 'designer-tag-pro',
    name: 'Designer Tag Pro',
    price: 59,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png', '/images/tag-img.png', '/images/tag-img.png'],
    category: 'dogs',
    description: 'Premium designer tag with customizable engraving and multiple color options. Make a statement while keeping your pet safe.',
    features: [
      'Custom laser engraving',
      'Premium powder coating',
      'Designer color options',
      'Reinforced attachment ring',
      'Gift box packaging'
    ],
    specifications: {
      material: 'Titanium Alloy',
      size: '35mm x 25mm',
      weight: '6g',
      durability: 'Military-grade',
      waterproof: true,
      warranty: 'Lifetime'
    },
    inStock: true,
    rating: 4.7,
    reviews: 156,
    badge: 'new',
    colors: ['Matte Black', 'Navy Blue', 'Forest Green', 'Burgundy'],
    dimensions: { length: 35, width: 25, thickness: 2 }
  },
  {
    id: '4',
    slug: 'smart-led-tag',
    name: 'Smart LED Tag',
    price: 75,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png'],
    category: 'others',
    description: 'High-tech LED tag with built-in light for night visibility. Rechargeable battery lasts up to 30 days on a single charge.',
    features: [
      'Built-in LED light',
      'USB rechargeable',
      '30-day battery life',
      'Three light modes',
      'Weather-sealed design'
    ],
    specifications: {
      material: 'Polycarbonate & Aluminum',
      size: '40mm x 30mm',
      weight: '12g',
      durability: 'Impact-resistant',
      waterproof: true,
      warranty: '1 year'
    },
    inStock: true,
    rating: 4.5,
    reviews: 89,
    badge: 'new',
    colors: ['Black'],
    dimensions: { length: 40, width: 30, thickness: 5 }
  },
  {
    id: '5',
    slug: 'waterproof-tag-plus',
    name: 'Waterproof Tag Plus',
    price: 39,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png', '/images/tag-img.png'],
    category: 'dogs',
    description: 'Specially designed for water-loving dogs. Completely waterproof with enhanced QR code protection.',
    features: [
      'IP68 waterproof rating',
      'Float-capable design',
      'UV-resistant QR code',
      'Salt-water safe',
      'Beach-ready'
    ],
    specifications: {
      material: 'Marine-grade Plastic',
      size: '32mm diameter',
      weight: '4g',
      durability: 'Marine-grade',
      waterproof: true,
      warranty: '2 years'
    },
    inStock: true,
    rating: 4.6,
    reviews: 203,
    colors: ['Blue', 'Orange', 'Yellow'],
    dimensions: { length: 32, width: 32, thickness: 3 }
  },
  {
    id: '6',
    slug: 'deluxe-engraved-tag',
    name: 'Deluxe Engraved Tag',
    price: 55,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png', '/images/tag-img.png'],
    category: 'cats',
    description: 'Elegant engraved tag with both QR code and traditional contact information. The perfect blend of modern and classic.',
    features: [
      'Deep laser engraving',
      'Dual-sided design',
      'QR code + contact info',
      'Silent coating',
      'Luxury presentation box'
    ],
    specifications: {
      material: 'Brass with Gold Plating',
      size: '28mm diameter',
      weight: '7g',
      durability: 'Scratch-resistant',
      waterproof: true,
      warranty: '3 years'
    },
    inStock: true,
    rating: 4.8,
    reviews: 167,
    badge: 'featured',
    colors: ['Gold', 'Silver', 'Rose Gold'],
    dimensions: { length: 28, width: 28, thickness: 2 }
  },
  {
    id: '7',
    slug: 'bone-shape-tag',
    name: 'Bone Shape Tag',
    price: 35,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png', '/images/tag-img.png'],
    category: 'dogs',
    description: 'Fun bone-shaped tag that dogs love. Lightweight and durable with a playful design.',
    features: [
      'Iconic bone shape',
      'Colorful enamel coating',
      'Reinforced edges',
      'Jingle-free design',
      'Kid-friendly'
    ],
    specifications: {
      material: 'Zinc Alloy with Enamel',
      size: '35mm x 20mm',
      weight: '6g',
      durability: 'Enamel-coated',
      waterproof: true,
      warranty: '1 year'
    },
    inStock: true,
    rating: 4.4,
    reviews: 278,
    colors: ['Red', 'Blue', 'Green', 'Pink'],
    dimensions: { length: 35, width: 20, thickness: 2 }
  },
  {
    id: '8',
    slug: 'fish-shape-tag',
    name: 'Fish Shape Tag',
    price: 35,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png'],
    category: 'cats',
    description: 'Adorable fish-shaped tag perfect for cats. Ultra-lightweight and quiet.',
    features: [
      'Cute fish design',
      'Ultra-lightweight',
      'Silent movement',
      'Smooth edges',
      'Vibrant colors'
    ],
    specifications: {
      material: 'Aluminum with Enamel',
      size: '30mm x 18mm',
      weight: '3g',
      durability: 'Enamel-coated',
      waterproof: true,
      warranty: '1 year'
    },
    inStock: true,
    rating: 4.5,
    reviews: 192,
    colors: ['Orange', 'Blue', 'Purple'],
    dimensions: { length: 30, width: 18, thickness: 1.5 }
  },
  {
    id: '9',
    slug: 'glow-in-dark-tag',
    name: 'Glow in Dark Tag',
    price: 49,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png', '/images/tag-img.png'],
    category: 'others',
    description: 'Innovative glow-in-the-dark tag for enhanced visibility during nighttime walks.',
    features: [
      'Phosphorescent coating',
      'Charges in daylight',
      'Glows for 8+ hours',
      'No batteries needed',
      'Eco-friendly'
    ],
    specifications: {
      material: 'Phosphorescent Polymer',
      size: '33mm diameter',
      weight: '5g',
      durability: 'Impact-resistant',
      waterproof: true,
      warranty: '2 years'
    },
    inStock: true,
    rating: 4.6,
    reviews: 145,
    badge: 'new',
    colors: ['Green Glow', 'Blue Glow'],
    dimensions: { length: 33, width: 33, thickness: 3 }
  },
  {
    id: '10',
    slug: 'paw-print-tag',
    name: 'Paw Print Tag',
    price: 32,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png', '/images/tag-img.png'],
    category: 'dogs',
    description: 'Charming paw print design that celebrates your furry friend. Available in multiple colors.',
    features: [
      '3D paw print design',
      'Textured surface',
      'Color options',
      'Lightweight',
      'Easy to clean'
    ],
    specifications: {
      material: 'Anodized Aluminum',
      size: '30mm diameter',
      weight: '5g',
      durability: 'Anodized finish',
      waterproof: true,
      warranty: '2 years'
    },
    inStock: true,
    rating: 4.7,
    reviews: 312,
    badge: 'bestseller',
    colors: ['Silver', 'Black', 'Red', 'Blue'],
    dimensions: { length: 30, width: 30, thickness: 2 }
  },
  {
    id: '11',
    slug: 'luxury-diamond-tag',
    name: 'Luxury Diamond Tag',
    price: 99,
    originalPrice: 129,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png', '/images/tag-img.png', '/images/tag-img.png'],
    category: 'cats',
    description: 'Premium luxury tag with Swarovski crystals. The ultimate statement piece for your beloved pet.',
    features: [
      'Genuine Swarovski crystals',
      'Sterling silver base',
      'Hand-polished finish',
      'Luxury gift packaging',
      'Certificate of authenticity'
    ],
    specifications: {
      material: 'Sterling Silver 925',
      size: '25mm diameter',
      weight: '8g',
      durability: 'Tarnish-resistant',
      waterproof: false,
      warranty: 'Lifetime'
    },
    inStock: true,
    rating: 5.0,
    reviews: 67,
    badge: 'featured',
    colors: ['Silver'],
    dimensions: { length: 25, width: 25, thickness: 2 }
  },
  {
    id: '12',
    slug: 'basic-round-tag',
    name: 'Basic Round Tag',
    price: 19,
    image: '/images/tag-img.png',
    images: ['/images/tag-img.png'],
    category: 'others',
    description: 'Simple, affordable, and effective. Our entry-level QR tag that gets the job done.',
    features: [
      'Affordable protection',
      'Durable plastic',
      'Clear QR code',
      'Multiple colors',
      'Perfect starter tag'
    ],
    specifications: {
      material: 'ABS Plastic',
      size: '28mm diameter',
      weight: '3g',
      durability: 'Basic',
      waterproof: true,
      warranty: '1 year'
    },
    inStock: true,
    rating: 4.3,
    reviews: 456,
    colors: ['Black', 'White', 'Red', 'Blue', 'Green'],
    dimensions: { length: 28, width: 28, thickness: 2 }
  }
];

// Utility functions
export async function getAllTags(): Promise<Tag[]> {
  return tagsData;
}

export async function getTagBySlug(slug: string): Promise<Tag | undefined> {
  return tagsData.find(tag => tag.slug === slug);
}

export async function getTagsByCategory(category: 'dogs' | 'cats' | 'others'): Promise<Tag[]> {
  return tagsData.filter(tag => tag.category === category);
}

export async function getFeaturedTags(): Promise<Tag[]> {
  return tagsData.filter(tag => tag.badge === 'featured' || tag.badge === 'bestseller');
}

export async function getNewTags(): Promise<Tag[]> {
  return tagsData.filter(tag => tag.badge === 'new');
}

export async function getSaleTags(): Promise<Tag[]> {
  return tagsData.filter(tag => tag.originalPrice && tag.originalPrice > tag.price);
}