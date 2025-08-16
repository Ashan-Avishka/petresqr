// src/utils/qrCode.ts
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      type: 'image/png',
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

export const generateUniqueQRCode = (): string => {
  return uuidv4();
};

export const getQRCodeUrl = (qrCode: string): string => {
  return `${process.env.QR_BASE_URL}${qrCode}`;
};