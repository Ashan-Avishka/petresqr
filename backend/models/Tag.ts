/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the tag
 *         userId:
 *           type: string
 *           description: ID of the user who owns this tag
 *         petId:
 *           type: string
 *           description: ID of the pet associated with this tag
 *         qrCodeId:
 *           type: string
 *           description: Reference to the physical QRCode from the qrcodes collection
 *         qrCode:
 *           type: string
 *           description: Physical tag ID (e.g., "6P421DZ5") - assigned on first activation
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
 *           description: Whether the tag is currently active (can be toggled for re-activation)
 *         activatedAt:
 *           type: string
 *           format: date-time
 *           description: When the tag was first activated
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the tag was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the tag was last updated
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  userId: mongoose.Types.ObjectId;
  petId?: mongoose.Types.ObjectId;
  qrCodeId?: mongoose.Types.ObjectId;  // Reference to QRCode collection
  qrCode?: string;                      // Physical tag ID (assigned on first activation)
  status: 'active' | 'inactive' | 'pending';
  orderId?: mongoose.Types.ObjectId;
  isActive: boolean;                    // NEW: For re-activation tracking
  activatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  petId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: false,
    default: null,
    index: true,
  },
  qrCodeId: {
    type: Schema.Types.ObjectId,
    ref: 'QRCode',
    default: null,
  },
  qrCode: {
    type: String,
    default: null,
    index: true,
    sparse: true,  // Allow multiple null values
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
tagSchema.index({ userId: 1, status: 1 });
tagSchema.index({ petId: 1, status: 1 });
tagSchema.index({ status: 1, createdAt: -1 });
tagSchema.index({ qrCode: 1 }, { sparse: true });
tagSchema.index({ qrCodeId: 1 }, { sparse: true });

export const Tag = mongoose.model<ITag>('Tag', tagSchema);