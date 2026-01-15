// src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string; // NEW: for URL routing
  category: 'tag' | 'accessory' | 'bundle' | 'merchandise';
  petCategory?: 'dogs' | 'cats' | 'others'; // NEW: for frontend filtering
  description: string;
  price: number;
  compareAtPrice?: number;
  availability: 'in_stock' | 'out_of_stock' | 'pre_order' | 'discontinued';
  stock: number;
  availableColors: Array<{ name: string; hexCode: string }>;
  availableSizes: string[];
  keyFeatures: string[];
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  specifications: Record<string, any>;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  rating?: number; // NEW: average rating
  reviews?: number; // NEW: review count
  badge?: 'bestseller' | 'new' | 'sale' | 'limited'; // NEW: for badges
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['tag', 'accessory', 'bundle', 'merchandise'],
    },
    petCategory: {
      type: String,
      enum: ['dogs', 'cats', 'others'],
      default: 'dogs'
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    availability: {
      type: String,
      required: true,
      enum: ['in_stock', 'out_of_stock', 'pre_order', 'discontinued'],
      default: 'in_stock',
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    availableColors: [
      {
        name: { type: String, required: true },
        hexCode: { type: String, required: true },
      },
    ],
    availableSizes: [{ type: String }],
    keyFeatures: [{ type: String }],
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    specifications: { type: Schema.Types.Mixed, default: {} },
    weight: { type: Number },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    sku: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, min: 0, default: 0 },
    badge: {
      type: String,
      enum: ['bestseller', 'new', 'sale', 'limited'],
    },
  },
  { timestamps: true }
);

// Text search index
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Auto-generate slug from name before saving
ProductSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);