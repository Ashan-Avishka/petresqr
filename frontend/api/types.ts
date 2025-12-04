// api/types.ts

// User Types
export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  authProvider: 'email' | 'google';
  emailVerified?: boolean;
  role?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Auth Request Types
export interface RegisterEmailRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface LoginEmailRequest {
  email: string;
  firebaseToken: string; // This is now required!
}

export interface GoogleAuthRequest {
  firebaseToken: string;
}

export interface VerifyTokenRequest {
  firebaseToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export interface TestTokenRequest {
  email: string;
}

// Auth Response Types
export interface RegisterEmailResponse {
  user: User;
  customToken: string;
  message: string;
}

export interface LoginEmailResponse {
  user: User;
  idToken?: string;
  customToken?: string;
  message: string;
}

export interface GoogleAuthResponse {
  user: User;
  idToken: string;
  isNewUser: boolean;
  message: string;
}

export interface VerifyTokenResponse {
  user: User;
  tokenValid: boolean;
  idToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetLink?: string; // Only in development
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}

export interface TestTokenResponse {
  token: string;
  user: User;
  message: string;
}