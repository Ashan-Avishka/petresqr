export const config = {
  square: {
    applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '',
    locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
} as const;

export default config;