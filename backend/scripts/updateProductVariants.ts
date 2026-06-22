// scripts/updateProductVariants.ts
// Run from project root: npm run update:variants

import dns from 'dns';
// Force Cloudflare DNS so Atlas SRV records resolve on Windows
dns.setServers(['1.1.1.1', '8.8.8.8']);

import mongoose from 'mongoose';
import { Product } from '../models/Product';
import dotenv from 'dotenv';

dotenv.config();

const UPDATES: Array<{
  namePattern: RegExp;
  availableColors?: Array<{ name: string; hexCode: string }>;
  availableSizes?: string[];
}> = [
  {
    namePattern: /adjustable pet collar/i,
    availableColors: [
      { name: 'Red',   hexCode: '#DC2626' },
      { name: 'Blue',  hexCode: '#2563EB' },
      { name: 'Navy',  hexCode: '#1E3A5F' },
      { name: 'Pink',  hexCode: '#EC4899' },
      { name: 'Black', hexCode: '#111111' },
      { name: 'Green', hexCode: '#16A34A' },
    ],
    availableSizes: ['XS (25-33cm)', 'S (33-43cm)', 'M (43-55cm)', 'L (55-68cm)', 'XL (68-80cm)'],
  },
  {
    namePattern: /interactive cat ball toy/i,
    availableColors: [
      { name: 'Blue',   hexCode: '#3B82F6' },
      { name: 'Green',  hexCode: '#22C55E' },
      { name: 'Orange', hexCode: '#F97316' },
      { name: 'Pink',   hexCode: '#EC4899' },
      { name: 'Yellow', hexCode: '#EAB308' },
      { name: 'Purple', hexCode: '#A855F7' },
    ],
  },
  {
    namePattern: /feather wand teaser/i,
    availableColors: [
      { name: 'Blue',   hexCode: '#3B82F6' },
      { name: 'Red',    hexCode: '#EF4444' },
      { name: 'Green',  hexCode: '#22C55E' },
      { name: 'Purple', hexCode: '#A855F7' },
      { name: 'Orange', hexCode: '#F97316' },
    ],
  },
  {
    namePattern: /dog chew bone toy/i,
    availableSizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    namePattern: /pet leash premium/i,
    availableColors: [
      { name: 'Black',  hexCode: '#111111' },
      { name: 'Red',    hexCode: '#DC2626' },
      { name: 'Blue',   hexCode: '#2563EB' },
      { name: 'Green',  hexCode: '#16A34A' },
      { name: 'Pink',   hexCode: '#EC4899' },
      { name: 'Purple', hexCode: '#A855F7' },
    ],
    availableSizes: ['4ft (120cm)', '5ft (150cm)', '6ft (180cm)'],
  },
  {
    namePattern: /pet travel bag/i,
    availableColors: [
      { name: 'Black',     hexCode: '#111111' },
      { name: 'Gray',      hexCode: '#6B7280' },
      { name: 'Navy Blue', hexCode: '#1E3A5F' },
      { name: 'Olive',     hexCode: '#4B5320' },
      { name: 'Pink',      hexCode: '#EC4899' },
    ],
    availableSizes: ['Small (cats/small dogs)', 'Medium (medium dogs)', 'Large (large dogs)'],
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  console.log('Connecting to MongoDB…');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
  });
  console.log('Connected.\n');

  for (const { namePattern, availableColors, availableSizes } of UPDATES) {
    const update: Record<string, any> = {};
    if (availableColors !== undefined) update.availableColors = availableColors;
    if (availableSizes  !== undefined) update.availableSizes  = availableSizes;

    const result = await Product.updateMany(
      { name: { $regex: namePattern } },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      console.warn(`⚠️  No product matched: ${namePattern}`);
    } else {
      console.log(`✅ ${namePattern.source.replace('/i','')}: ${result.modifiedCount} updated`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
