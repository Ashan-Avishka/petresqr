// api/config.ts

// Get the base URL without /api suffix for images
const getBaseServerUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  // Remove /api suffix if present
  return apiUrl.replace(/\/api$/, '');
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const SERVER_BASE_URL = getBaseServerUrl();

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

/**
 * Helper to get full image URL from a relative path
 * @param path - The image path (e.g., "/uploads/pets/image.jpg")
 * @returns Full URL to the image
 */
export const getImageUrl = (path: string | undefined | null): string => {
  // Return placeholder if no path
  if (!path) {
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }
  
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Otherwise, prepend the server base URL
  // Ensure we don't double up on slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SERVER_BASE_URL}${cleanPath}`;
};