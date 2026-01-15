// src/config/twilio.ts
import twilio from 'twilio';
import { config, validateEnv } from './env';

validateEnv(['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER']);

// Twilio configuration
const accountSid = config.twilio.accountSid;
const authToken = config.twilio.authToken;
const twilioPhoneNumber = config.twilio.phoneNumber;

// Initialize Twilio client as a module variable
let twilioClient: twilio.Twilio | null = null;

/**
 * Initialize Twilio client
 * Call this function during server startup
 */
export const initializeTwilio = (): string => {
  if (accountSid && authToken && twilioPhoneNumber) {
    try {
      twilioClient = twilio(accountSid, authToken);
      return '✅ Twilio client initialized successfully';
    } catch (error: any) {
      console.error('❌ Failed to initialize Twilio:', error.message);
      return '⚠️  Failed to initialize Twilio';
    }
  } else {
    console.warn('⚠️  Twilio credentials not found. SMS functionality will be disabled.');
    return '⚠️  Twilio credentials not found. SMS functionality disabled.';
  }
};

/**
 * Send SMS using Twilio
 * @param to - Recipient phone number (E.164 format: +1234567890)
 * @param message - Message content
 * @returns Promise with message SID or error
 */
export const sendSMS = async (to: string, message: string): Promise<string> => {
  if (!twilioClient || !twilioPhoneNumber) {
    console.error('Twilio client not initialized or phone number not configured');
    throw new Error('SMS service not available');
  }

  try {
    // Ensure phone number is in E.164 format
    const formattedTo = to.startsWith('+') ? to : `+${to}`;

    const messageResponse = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedTo,
    });

    console.log(`✅ SMS sent successfully. SID: ${messageResponse.sid}`);
    return messageResponse.sid;
  } catch (error: any) {
    console.error('❌ Failed to send SMS:', error.message);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Check if Twilio is available
 * Useful for feature flags or conditional logic
 */
export const isTwilioAvailable = (): boolean => {
  return !!twilioClient && !!twilioPhoneNumber;
};

/**
 * Validate phone number format
 * @param phoneNumber - Phone number to validate
 * @returns boolean
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Basic E.164 format validation: +[country code][number]
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
};

/**
 * Format phone number to E.164 standard
 * @param phoneNumber - Phone number to format
 * @param defaultCountryCode - Default country code (e.g., '1' for US)
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  defaultCountryCode: string = '1'
): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // If already has country code
  if (phoneNumber.startsWith('+')) {
    return `+${digits}`;
  }

  // Add default country code
  return `+${defaultCountryCode}${digits}`;
};

// Export the client for direct use if needed
export default twilioClient;