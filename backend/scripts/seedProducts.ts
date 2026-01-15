// scripts/seedProducts.ts
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import dotenv from 'dotenv';

dotenv.config();

const sampleProducts = [
  {
    name: 'Smart Pet Tag - Premium',
    slug: 'smart-pet-tag-premium',
    category: 'tag',
    petCategory: 'dogs',
    description: 'Premium quality QR-enabled pet tag with waterproof design and lifetime warranty. Keep your pet safe with instant contact information access.',
    price: 29.99,
    compareAtPrice: 39.99,
    availability: 'in_stock',
    stock: 150,
    availableColors: [
      { name: 'Silver', hexCode: '#C0C0C0' },
      { name: 'Gold', hexCode: '#FFD700' },
      { name: 'Rose Gold', hexCode: '#B76E79' },
      { name: 'Black', hexCode: '#000000' },
    ],
    availableSizes: ['Small (2cm)', 'Medium (3cm)', 'Large (4cm)'],
    keyFeatures: [
      'QR code enabled for instant contact',
      'Waterproof and durable stainless steel',
      'Lifetime warranty included',
      'Easy to update contact information',
      'Scratch-resistant coating',
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1', alt: 'Premium Pet Tag', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f', alt: 'Tag Colors', isPrimary: false },
    ],
    specifications: {
      material: 'Stainless Steel',
      qrType: 'Dynamic QR Code',
      warranty: 'Lifetime',
      mounting: 'Ring attachment included',
    },
    weight: 15,
    dimensions: { length: 3, width: 3, height: 0.2 },
    sku: 'TAG-PREM-001',
    isActive: true,
    isFeatured: true,
    tags: ['pet tag', 'qr code', 'premium', 'waterproof', 'dog tag', 'cat tag'],
    rating: 4.8,
    reviews: 127,
    badge: 'bestseller',
  },
  {
    name: 'Smart Pet Tag - Basic',
    slug: 'smart-pet-tag-basic',
    category: 'tag',
    petCategory: 'dogs',
    description: 'Affordable QR-enabled pet tag perfect for everyday use. Durable aluminum construction with clear QR code scanning.',
    price: 19.99,
    availability: 'in_stock',
    stock: 200,
    availableColors: [
      { name: 'Blue', hexCode: '#0000FF' },
      { name: 'Red', hexCode: '#FF0000' },
      { name: 'Green', hexCode: '#008000' },
      { name: 'Silver', hexCode: '#C0C0C0' },
    ],
    availableSizes: ['Small (2cm)', 'Medium (3cm)'],
    keyFeatures: [
      'QR code enabled',
      'Lightweight aluminum',
      'Easy to scan',
      'Affordable price',
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', alt: 'Basic Pet Tag', isPrimary: true },
    ],
    specifications: {
      material: 'Aluminum',
      qrType: 'Dynamic QR Code',
      warranty: '1 Year',
      mounting: 'Ring attachment included',
    },
    weight: 8,
    dimensions: { length: 2.5, width: 2.5, height: 0.15 },
    sku: 'TAG-BASIC-001',
    isActive: true,
    isFeatured: false,
    tags: ['pet tag', 'qr code', 'basic', 'affordable', 'dog tag'],
    rating: 4.5,
    reviews: 89,
  },
  {
    name: 'QR Sticker Pack - 5 Pack',
    slug: 'qr-sticker-pack-5-pack',
    category: 'accessory',
    petCategory: 'dogs',
    description: 'Set of 5 waterproof QR stickers. Perfect for carriers, crates, or additional identification points.',
    price: 12.99,
    availability: 'in_stock',
    stock: 300,
    availableColors: [],
    availableSizes: [],
    keyFeatures: [
      'Waterproof and weatherproof',
      'Strong adhesive backing',
      'UV resistant',
      'Set of 5 stickers',
      'Works with any smartphone',
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032', alt: 'QR Stickers', isPrimary: true },
    ],
    specifications: {
      material: 'Vinyl',
      adhesive: 'Permanent',
      size: '5cm x 5cm each',
      package: '5 stickers per pack',
    },
    weight: 20,
    dimensions: { length: 10, width: 8, height: 0.1 },
    sku: 'ACC-STICK-005',
    isActive: true,
    isFeatured: false,
    tags: ['sticker', 'qr code', 'waterproof', 'accessory'],
    rating: 4.6,
    reviews: 54,
  },
  {
    name: 'Pet Tag Starter Bundle',
    slug: 'pet-tag-starter-bundle',
    category: 'bundle',
    petCategory: 'dogs',
    description: 'Complete starter kit with Premium tag, QR stickers, and collar attachment. Everything you need to keep your pet safe.',
    price: 49.99,
    compareAtPrice: 62.97,
    availability: 'in_stock',
    stock: 75,
    availableColors: [
      { name: 'Silver', hexCode: '#C0C0C0' },
      { name: 'Gold', hexCode: '#FFD700' },
    ],
    availableSizes: [],
    keyFeatures: [
      '1x Premium Smart Pet Tag',
      '1x 5-Pack QR Stickers',
      '1x Premium Collar Attachment',
      'Save 20% vs buying separately',
      'Perfect starter kit',
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e', alt: 'Bundle Kit', isPrimary: true },
    ],
    specifications: {},
    weight: 50,
    dimensions: { length: 15, width: 10, height: 3 },
    sku: 'BUNDLE-START-001',
    isActive: true,
    isFeatured: true,
    tags: ['bundle', 'starter kit', 'premium', 'value pack'],
    rating: 4.9,
    reviews: 203,
    badge: 'bestseller',
  },
  {
    name: 'Reflective Safety Collar',
    slug: 'reflective-safety-collar',
    category: 'accessory',
    petCategory: 'dogs',
    description: 'High-visibility reflective collar with built-in tag holder. Perfect for night walks and added safety.',
    price: 24.99,
    availability: 'in_stock',
    stock: 120,
    availableColors: [
      { name: 'Orange', hexCode: '#FF8C00' },
      { name: 'Yellow', hexCode: '#FFFF00' },
      { name: 'Green', hexCode: '#00FF00' },
    ],
    availableSizes: ['Small (30-38cm)', 'Medium (38-50cm)', 'Large (50-65cm)'],
    keyFeatures: [
      '360° reflective material',
      'Adjustable sizing',
      'Built-in tag holder',
      'Durable nylon construction',
      'Quick-release buckle',
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5', alt: 'Reflective Collar', isPrimary: true },
    ],
    specifications: {
      material: 'Nylon with reflective strip',
      buckle: 'Quick-release plastic',
      adjustable: 'Yes',
    },
    weight: 35,
    dimensions: { length: 50, width: 2, height: 0.3 },
    sku: 'ACC-COLLAR-REF-001',
    isActive: true,
    isFeatured: false,
    tags: ['collar', 'reflective', 'safety', 'night', 'visibility'],
    rating: 4.4,
    reviews: 67,
  },
  {
    name: 'Pet Profile Photo Keychain',
    slug: 'pet-profile-photo-keychain',
    category: 'merchandise',
    petCategory: 'dogs',
    description: 'Cute keychain featuring your pet\'s photo and QR code. Keep your furry friend close wherever you go!',
    price: 14.99,
    availability: 'in_stock',
    stock: 200,
    availableColors: [
      { name: 'Clear', hexCode: '#FFFFFF' },
      { name: 'Blue', hexCode: '#0000FF' },
      { name: 'Pink', hexCode: '#FFC0CB' },
    ],
    availableSizes: [],
    keyFeatures: [
      'Custom photo upload',
      'QR code included',
      'Durable acrylic material',
      'Great gift idea',
      'Water resistant',
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1534361960057-19889db9621e', alt: 'Photo Keychain', isPrimary: true },
    ],
    specifications: {
      material: 'Acrylic',
      printType: 'UV printed',
      size: '5cm x 7cm',
    },
    weight: 15,
    dimensions: { length: 7, width: 5, height: 0.3 },
    sku: 'MERCH-KEY-001',
    isActive: true,
    isFeatured: false,
    tags: ['keychain', 'merchandise', 'photo', 'gift', 'custom'],
    rating: 4.7,
    reviews: 42,
    badge: 'new',
  },
  {
    name: 'GPS Tracker Bundle',
    slug: 'gps-tracker-bundle',
    category: 'bundle',
    petCategory: 'dogs',
    description: 'Ultimate safety bundle with Premium tag and GPS tracker. Real-time location tracking plus QR identification.',
    price: 89.99,
    compareAtPrice: 119.98,
    availability: 'pre_order',
    stock: 0,
    availableColors: [
      { name: 'Black', hexCode: '#000000' },
      { name: 'White', hexCode: '#FFFFFF' },
    ],
    availableSizes: [],
    keyFeatures: [
      '1x Premium Smart Pet Tag',
      '1x GPS Tracker Device',
      'Real-time location tracking',
      '3 months subscription included',
      'Mobile app access',
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a', alt: 'GPS Bundle', isPrimary: true },
    ],
    specifications: {
      batteryLife: '7 days',
      connectivity: '4G LTE',
      appPlatform: 'iOS & Android',
      subscription: 'Required after 3 months',
    },
    weight: 120,
    dimensions: { length: 8, width: 5, height: 2 },
    sku: 'BUNDLE-GPS-001',
    isActive: true,
    isFeatured: true,
    tags: ['bundle', 'gps', 'tracker', 'premium', 'technology'],
    rating: 4.3,
    reviews: 28,
    badge: 'new',
  },
  {
    name: 'Luxury Leather Collar',
    slug: 'luxury-leather-collar',
    category: 'accessory',
    petCategory: 'dogs',
    description: 'Handcrafted genuine leather collar with brass hardware. Stylish and comfortable for your sophisticated pet.',
    price: 44.99,
    availability: 'in_stock',
    stock: 45,
    availableColors: [
      { name: 'Brown', hexCode: '#8B4513' },
      { name: 'Black', hexCode: '#000000' },
      { name: 'Tan', hexCode: '#D2B48C' },
    ],
    availableSizes: ['Small (28-36cm)', 'Medium (36-48cm)', 'Large (48-60cm)'],
    keyFeatures: [
      'Genuine leather construction',
      'Brass hardware',
      'Handcrafted quality',
      'Soft padded interior',
      'Premium buckle',
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1548199639-2d0afe57fa4c', alt: 'Leather Collar', isPrimary: true },
    ],
    specifications: {
      material: 'Genuine Leather',
      hardware: 'Solid Brass',
      padding: 'Yes',
    },
    weight: 60,
    dimensions: { length: 50, width: 2.5, height: 0.4 },
    sku: 'ACC-COLLAR-LEATH-001',
    isActive: true,
    isFeatured: false,
    tags: ['collar', 'leather', 'luxury', 'premium', 'handcrafted'],
    rating: 4.6,
    reviews: 31,
    badge: 'limited',
  },
  {
    name: 'Cat Smart Tag - Mini',
    slug: 'cat-smart-tag-mini',
    category: 'tag',
    petCategory: 'cats',
    description: 'Ultra-lightweight QR tag designed specifically for cats. Comfortable and secure without weighing them down.',
    price: 24.99,
    compareAtPrice: 29.99,
    availability: 'in_stock',
    stock: 180,
    availableColors: [
      { name: 'Pink', hexCode: '#FFC0CB' },
      { name: 'Purple', hexCode: '#800080' },
      { name: 'Silver', hexCode: '#C0C0C0' },
    ],
    availableSizes: ['Mini (1.5cm)'],
    keyFeatures: [
      'Ultra-lightweight design for cats',
      'QR code enabled',
      'Silent operation - no jingling',
      'Breakaway safety feature',
      'Waterproof coating',
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1573865526739-10c1d3a1c6ad', alt: 'Cat Tag Mini', isPrimary: true },
    ],
    specifications: {
      material: 'Aluminum',
      qrType: 'Dynamic QR Code',
      warranty: '1 Year',
      weight: '3g',
    },
    weight: 3,
    dimensions: { length: 1.5, width: 1.5, height: 0.1 },
    sku: 'TAG-CAT-MINI-001',
    isActive: true,
    isFeatured: true,
    tags: ['cat tag', 'qr code', 'lightweight', 'mini', 'silent'],
    rating: 4.7,
    reviews: 95,
    badge: 'bestseller',
  },
];

async function seedProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pettracker';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully seeded ${products.length} products!`);

    // Show summary
    const productsByCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    console.log('\nProducts by category:');
    productsByCategory.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count}`);
    });

    const productsByPetCategory = await Product.aggregate([
      { $group: { _id: '$petCategory', count: { $sum: 1 } } }
    ]);

    console.log('\nProducts by pet category:');
    productsByPetCategory.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count}`);
    });

    console.log('\nFeatured products:');
    const featuredProducts = await Product.find({ isFeatured: true }, 'name price badge rating');
    featuredProducts.forEach(product => {
      const badgeText = product.badge ? ` [${product.badge.toUpperCase()}]` : '';
      const ratingText = product.rating ? ` ⭐${product.rating}` : '';
      console.log(`  - ${product.name} ($${product.price})${badgeText}${ratingText}`);
    });

    console.log('\nProducts with badges:');
    const badgedProducts = await Product.find({ badge: { $exists: true } }, 'name badge');
    badgedProducts.forEach(product => {
      console.log(`  - ${product.name}: ${product.badge}`);
    });

    console.log('\nTop rated products:');
    const topRated = await Product.find({ rating: { $gte: 4.5 } }, 'name rating reviews')
      .sort({ rating: -1 })
      .limit(5);
    topRated.forEach(product => {
      console.log(`  - ${product.name}: ⭐${product.rating} (${product.reviews} reviews)`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

seedProducts();