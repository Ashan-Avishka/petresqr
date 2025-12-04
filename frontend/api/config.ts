// api/config.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  auth: {
    registerEmail: '/auth/register/email',
    loginEmail: '/auth/login/email',
    loginGoogle: '/auth/google',
    verify: '/auth/verify',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    updateProfile: '/auth/profile',
    testToken: '/auth/test-token',
  },
} as const;

// Helper to get stored token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Helper to set token
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
};

// Helper to remove token
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
};

// Helper to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};