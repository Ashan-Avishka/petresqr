// src/config/square.ts
import { config, validateEnv } from './env';
import { SquareClient, SquareEnvironment } from "square";

// Validate required environment variables
validateEnv(['SQUARE_ACCESS_TOKEN', 'SQUARE_LOCATION_ID']);

const squareClient = new SquareClient({
  token: config.square.accessToken,
  environment: config.square.environment === 'production' 
    ? SquareEnvironment.Production 
    : SquareEnvironment.Sandbox,
});

export const paymentsApi = squareClient.payments;
export const ordersApi = squareClient.orders;
export const customersApi = squareClient.customers;

export { squareClient };
