// src/config/firebase-client.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCustomToken,
  GoogleAuthProvider,
  Auth,
  UserCredential
} from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDfcwohLehSoG-Y2xEY-KSTW_vz2QdPjhE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "petresqr-37025.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "petresqr-37025",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "petresqr-37025.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "834057808303",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:834057808303:web:111096af8b86c7c4a4e75a"
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

// Email/Password Authentication
export const signInWithEmail = async (email: string, password: string): Promise<string> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return token;
  } catch (error: any) {
    console.error('Firebase sign in error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

// Sign in with custom token (used after registration)
export const signInWithCustomTokenFirebase = async (customToken: string): Promise<string> => {
  try {
    const userCredential: UserCredential = await signInWithCustomToken(auth, customToken);
    const idToken = await userCredential.user.getIdToken();
    return idToken;
  } catch (error: any) {
    console.error('Firebase custom token sign in error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

// This is no longer needed since backend handles user creation
export const registerWithEmail = async (email: string, password: string): Promise<string> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return token;
  } catch (error: any) {
    console.error('Firebase registration error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

// Google Authentication
export const signInWithGoogle = async (): Promise<string> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential: UserCredential = await signInWithPopup(auth, provider);
    const token = await userCredential.user.getIdToken();
    return token;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user's ID token
export const getCurrentUserToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

// Helper function to convert Firebase error codes to user-friendly messages
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled';
    case 'auth/invalid-custom-token':
      return 'Invalid authentication token';
    case 'auth/custom-token-mismatch':
      return 'Token mismatch. Please try again';
    default:
      return 'Authentication failed. Please try again';
  }
};

export { auth };
export default app;