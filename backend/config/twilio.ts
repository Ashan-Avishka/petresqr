// src/config/twilio.ts
import twilio from 'twilio';

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

// if (!accountSid || !authToken) {
//   throw new Error('Twilio credentials are required');
// }

// export const twilioClient = twilio(accountSid, authToken);

// export const sendSMS = async (to: string, message: string): Promise<void> => {
//   try {
//     await twilioClient.messages.create({
//       body: message,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to,
//     });
//     console.log(`SMS sent to ${to}`);
//   } catch (error) {
//     console.error('SMS sending error:', error);
//     throw error;
//   }
// };

// export const sendEmail = async (
//   to: string,
//   subject: string,
//   htmlContent: string
// ): Promise<void> => {
//   try {
//     await twilioClient.messages.create({
//       from: process.env.TWILIO_EMAIL_FROM,
//       to,
//       subject,
//       html: htmlContent,
//     });
//     console.log(`Email sent to ${to}`);
//   } catch (error) {
//     console.error('Email sending error:', error);
//     throw error;
//   }
// };