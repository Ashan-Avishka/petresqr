// src/utils/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'support@petresqr.com',
    pass: process.env.EMAIL_PASS || 'iydo ucvb wvvv avhu',
  },
});

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (emailData: EmailTemplate): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      ...emailData,
    });
    console.log(`Email sent to ${emailData.to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderData: any) => ({
    subject: 'Order Confirmation - Pet Tag',
    html: `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> ${orderData.id}</p>
      <p><strong>Pet:</strong> ${orderData.petName}</p>
      <p><strong>Total:</strong> ${orderData.total}</p>
      <p>We'll send you another email when your order ships.</p>
    `
  }),
  
  tagActivated: (petName: string) => ({
    subject: 'Pet Tag Activated',
    html: `
      <h2>Pet Tag Activated</h2>
      <p>Great news! The pet tag for <strong>${petName}</strong> has been successfully activated.</p>
      <p>Your pet is now protected with our lost pet recovery service.</p>
    `
  }),
  
  petFound: (petName: string, finderInfo: any) => ({
    subject: `${petName} has been found!`,
    html: `
      <h2>Good News - ${petName} has been found!</h2>
      <p>Someone has scanned ${petName}'s QR tag and wants to help return your pet.</p>
      <p><strong>Finder:</strong> ${finderInfo.name}</p>
      <p><strong>Phone:</strong> ${finderInfo.phone}</p>
      ${finderInfo.message ? `<p><strong>Message:</strong> ${finderInfo.message}</p>` : ''}
      ${finderInfo.location ? `<p><strong>Location:</strong> ${finderInfo.location}</p>` : ''}
      <p>Please contact them as soon as possible to arrange the return of your pet.</p>
    `
  })
};