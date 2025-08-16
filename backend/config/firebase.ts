// src/config/firebase.ts
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

export const initializeFirebase = async (): Promise<void> => {
  try {
    if (!admin.apps.length) {
      let serviceAccount: any;
      
      // Method 1: Try to read from file (recommended for development)
      const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        console.log('Loading Firebase service account from file...');
        serviceAccount = require(serviceAccountPath);
      } else {
        // Method 2: Try to parse from environment variable
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        
        if (!serviceAccountKey) {
          throw new Error('Firebase service account not found. Please provide either:\n' +
            '1. A firebase-service-account.json file in your project root, OR\n' +
            '2. Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
        }

        console.log('Loading Firebase service account from environment variable...');
        
        try {
          // Clean the JSON string (remove any extra quotes or escaping)
          const cleanedKey = serviceAccountKey
            .trim()
            .replace(/^["']|["']$/g, '') // Remove wrapping quotes
            .replace(/\\"/g, '"') // Unescape quotes
            .replace(/\\\\/g, '\\'); // Unescape backslashes
          
          serviceAccount = JSON.parse(cleanedKey);
        } catch (parseError) {
          console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
          console.error('Make sure your JSON is properly formatted and escaped.');
          console.error('First 200 characters of your key:', serviceAccountKey.substring(0, 200));
          throw new Error('Invalid Firebase service account JSON format');
        }
      }

      // Validate required fields
      const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
      const missingFields = requiredFields.filter(field => !serviceAccount[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields in service account: ${missingFields.join(', ')}`);
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      
      console.log('✅ Firebase Admin initialized successfully');
      console.log(`📋 Project ID: ${serviceAccount.project_id}`);
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
};

export const verifyFirebaseToken = async (token: string): Promise<admin.auth.DecodedIdToken> => {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error: any) {
    console.error('Token verification error:', error);
    throw new Error(`Invalid Firebase token: ${error.message}`);
  }
};

// Helper function to test Firebase connection
export const testFirebaseConnection = async (): Promise<void> => {
  try {
    // Try to list users (limit to 1 to minimize overhead)
    await admin.auth().listUsers(1);
    console.log('✅ Firebase connection test successful');
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    throw error;
  }
};