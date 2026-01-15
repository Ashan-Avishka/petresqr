// scripts/migrateProducts.ts
// Run this script to add missing fields to existing products

import mongoose from 'mongoose';
import { Product } from '../models/Product';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database';

async function migrateProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    for (const product of products) {
      let updated = false;

      // Generate slug if missing
      if (!product.slug) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        updated = true;
        console.log(`Generated slug for "${product.name}": ${product.slug}`);
      }

      // Set default petCategory if missing
      if (!product.petCategory) {
        product.petCategory = 'dogs'; // default to dogs
        updated = true;
        console.log(`Set default petCategory for "${product.name}"`);
      }

      // Set default rating if missing
      if (product.rating === undefined || product.rating === null) {
        product.rating = 4.5; // default rating
        updated = true;
      }

      // Set default reviews if missing
      if (product.reviews === undefined || product.reviews === null) {
        product.reviews = Math.floor(Math.random() * 50) + 10; // random 10-60
        updated = true;
      }

      // Add badge based on conditions
      if (!product.badge) {
        if (product.isFeatured) {
          product.badge = 'bestseller';
        } else if (product.compareAtPrice && product.compareAtPrice > product.price) {
          product.badge = 'sale';
        } else if (new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) {
          product.badge = 'new'; // products created in last 30 days
        }
        if (product.badge) {
          updated = true;
          console.log(`Added badge "${product.badge}" to "${product.name}"`);
        }
      }

      if (updated) {
        await product.save();
        console.log(`✓ Updated "${product.name}"`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
migrateProducts();