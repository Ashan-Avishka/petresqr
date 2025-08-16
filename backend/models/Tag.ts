// src/models/Tag.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       required:
 *         - petId
 *         - qrCode
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the tag
 *         petId:
 *           type: string
 *           description: ID of the pet associated with this tag
 *         qrCode:
 *           type: string
 *           description: Unique QR code identifier
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           default: pending
 *           description: Current status of the tag
 *         orderId:
 *           type: string
 *           description: ID of the order that included this tag
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the tag is active
 *         activatedAt:
 *           type: string
 *           format: date-time
 *           description: When the tag was activated
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the tag was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the tag was last updated
 *       example:
 *         id: 507f191e810c19729de860ea
 *         petId: 507f1f77bcf86cd799439011
 *         qrCode: "QR123456789"
 *         status: active
 *         orderId: 507f1f77bcf86cd799439013
 *         isActive: true
 *         activatedAt: "2023-01-02T00:00:00.000Z"
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-02T00:00:00.000Z"
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  petId: mongoose.Types.ObjectId;
  qrCode: string;
  status: 'active' | 'inactive' | 'pending';
  orderId?: mongoose.Types.ObjectId;
  isActive: boolean;
  activatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>({
  petId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
    index: true,
  },
  qrCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  activatedAt: {
    type: Date,
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
tagSchema.index({ qrCode: 1 });
tagSchema.index({ petId: 1, status: 1 });
tagSchema.index({ status: 1, createdAt: -1 });

export const Tag = mongoose.model<ITag>('Tag', tagSchema);