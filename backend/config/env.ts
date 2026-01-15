// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables once at the application level
const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

// Export a function to validate required env vars
export function validateEnv(requiredVars: string[]): void {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Export commonly used env vars
export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || '',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  square: {
    accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
    locationId: process.env.SQUARE_LOCATION_ID || '',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  },
  frontend: {
    urls: process.env.FRONTEND_URLS?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
  },
} as const;

export default config;