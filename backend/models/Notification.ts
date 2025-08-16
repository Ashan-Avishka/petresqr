// src/models/Notification.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - title
 *         - message
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the notification
 *         userId:
 *           type: string
 *           description: ID of the user who receives the notification
 *         type:
 *           type: string
 *           enum: [pet_found, tag_activated, order_shipped, order_delivered, system]
 *           description: Type of notification
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message
 *         data:
 *           type: object
 *           additionalProperties: true
 *           description: Additional notification data
 *         isRead:
 *           type: boolean
 *           default: false
 *           description: Whether the notification has been read
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was created
 *       example:
 *         id: 507f1f77bcf86cd799439014
 *         userId: 507f1f77bcf86cd799439012
 *         type: pet_found
 *         title: "Pet Found!"
 *         message: "Max has been found near Central Park"
 *         data:
 *           petId: 507f1f77bcf86cd799439011
 *           finderPhone: "+1234567890"
 *         isRead: false
 *         createdAt: "2023-01-01T12:00:00.000Z"
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'pet_found' | 'tag_activated' | 'order_shipped' | 'order_delivered' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['pet_found', 'tag_activated', 'order_shipped', 'order_delivered', 'system'],
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  data: {
    type: Schema.Types.Mixed,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: Date,
}, {
  timestamps: { createdAt: true, updatedAt: false },
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
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);