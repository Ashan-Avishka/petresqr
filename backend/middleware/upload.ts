// src/middleware/upload.ts
import multer from 'multer';
import sharp from 'sharp';
import { Request } from 'express';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Image processing middleware
export const processImage = async (
  buffer: Buffer,
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<Buffer> => {
  const { width = 800, height = 600, quality = 85 } = options;
  
  return await sharp(buffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality })
    .toBuffer();
};