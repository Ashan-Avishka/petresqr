// src/models/QRCode.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IQRCode extends Document {
  tagId: string;              // Physical tag ID like "6P421DZ5"
  qrCodeData: string;          // URL that the QR code points to
  websiteUrl: string;
  availability: 'available' | 'unavailable';
  assignedTagId?: mongoose.Types.ObjectId;  // Reference to Tag document when assigned
  createdAt: Date;
  updatedAt: Date;
}

const qrCodeSchema = new Schema<IQRCode>({
  tagId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  qrCodeData: {
    type: String,
    required: true,
  },
  websiteUrl: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
    index: true,
  },
  assignedTagId: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
qrCodeSchema.index({ availability: 1, tagId: 1 });

export const QRCode = mongoose.model<IQRCode>('QRCode', qrCodeSchema);