// src/middleware/upload.ts
import multer from 'multer';
import sharp from 'sharp';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/pets');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for memory storage (we'll process before saving)
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

// Image processing and saving function
export const processAndSaveImage = async (
  buffer: Buffer,
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<{ filename: string; filepath: string; url: string }> => {
  const { width = 800, height = 600, quality = 85 } = options;
  
  // Process image
  const processedBuffer = await sharp(buffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality })
    .toBuffer();

  // Generate unique filename
  const filename = `${uuidv4()}-${Date.now()}.jpg`;
  const filepath = path.join(uploadsDir, filename);
  
  // Save to disk
  await fs.promises.writeFile(filepath, processedBuffer);
  
  // Return file info with URL path
  return {
    filename,
    filepath,
    url: `/uploads/pets/${filename}`
  };
};

// Delete image function
export const deleteImage = async (filename: string): Promise<void> => {
  const filepath = path.join(uploadsDir, filename);
  
  try {
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
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