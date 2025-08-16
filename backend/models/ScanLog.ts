// src/models/ScanLog.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Coordinates:
 *       type: object
 *       properties:
 *         latitude:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *           description: Longitude coordinate
 * 
 *     FinderInfo:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the person who found the pet
 *         phone:
 *           type: string
 *           description: Phone number of the finder
 *         email:
 *           type: string
 *           description: Email of the finder
 *         message:
 *           type: string
 *           description: Additional message from the finder
 * 
 *     ScanLog:
 *       type: object
 *       required:
 *         - petId
 *         - tagId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the scan log
 *         petId:
 *           type: string
 *           description: ID of the pet that was scanned
 *         tagId:
 *           type: string
 *           description: ID of the tag that was scanned
 *         location:
 *           type: string
 *           description: Human-readable location of the scan
 *         coordinates:
 *           $ref: '#/components/schemas/Coordinates'
 *         finderInfo:
 *           $ref: '#/components/schemas/FinderInfo'
 *         ownerNotified:
 *           type: boolean
 *           default: false
 *           description: Whether the owner was notified
 *         notifiedAt:
 *           type: string
 *           format: date-time
 *           description: When the owner was notified
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the scan was logged
 *       example:
 *         id: 507f1f77bcf86cd799439015
 *         petId: 507f1f77bcf86cd799439011
 *         tagId: 507f191e810c19729de860ea
 *         location: "Central Park, New York"
 *         coordinates:
 *           latitude: 40.7829
 *           longitude: -73.9654
 *         finderInfo:
 *           name: "John Smith"
 *           phone: "+1234567890"
 *           email: "john@example.com"
 *           message: "Found your dog near the fountain"
 *         ownerNotified: true
 *         notifiedAt: "2023-01-01T12:30:00.000Z"
 *         createdAt: "2023-01-01T12:00:00.000Z"
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IScanLog extends Document {
  petId: mongoose.Types.ObjectId;
  tagId: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  finderInfo?: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  };
  ownerNotified: boolean;
  notifiedAt?: Date;
  createdAt: Date;
}

const scanLogSchema = new Schema<IScanLog>({
  petId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
    index: true,
  },
  tagId: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
    index: true,
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  coordinates: {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
  },
  finderInfo: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    message: { type: String, trim: true },
  },
  ownerNotified: {
    type: Boolean,
    default: false,
  },
  notifiedAt: Date,
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.ipAddress;
      delete ret.userAgent;
      return ret;
    },
  },
});

// Indexes
scanLogSchema.index({ petId: 1, createdAt: -1 });
scanLogSchema.index({ tagId: 1, createdAt: -1 });
scanLogSchema.index({ createdAt: -1 });
scanLogSchema.index({ ownerNotified: 1 });

export const ScanLog = mongoose.model<IScanLog>('ScanLog', scanLogSchema);