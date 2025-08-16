// src/models/Order.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     ShippingAddress:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - state
 *         - zipCode
 *       properties:
 *         street:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State or province
 *         zipCode:
 *           type: string
 *           description: Postal code
 *         country:
 *           type: string
 *           default: USA
 *           description: Country
 * 
 *     Order:
 *       type: object
 *       required:
 *         - userId
 *         - petId
 *         - status
 *         - total
 *         - quantity
 *         - shippingAddress
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the order
 *         userId:
 *           type: string
 *           description: ID of the user who placed the order
 *         petId:
 *           type: string
 *           description: ID of the pet associated with the order
 *         tagId:
 *           type: string
 *           description: ID of the tag being ordered
 *         status:
 *           type: string
 *           enum: [pending, paid, processing, shipped, delivered, cancelled]
 *           default: pending
 *           description: Current status of the order
 *         total:
 *           type: number
 *           minimum: 0
 *           description: Total amount of the order
 *         currency:
 *           type: string
 *           default: USD
 *           description: Currency of the payment
 *         quantity:
 *           type: number
 *           minimum: 1
 *           default: 1
 *           description: Quantity of items ordered
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         trackingNumber:
 *           type: string
 *           description: Shipping tracking number
 *         squareOrderId:
 *           type: string
 *           description: Square order ID
 *         squarePaymentId:
 *           type: string
 *           description: Square payment ID
 *         paymentMethod:
 *           type: string
 *           description: Payment method used
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: When payment was completed
 *         shippedAt:
 *           type: string
 *           format: date-time
 *           description: When order was shipped
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: When order was delivered
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: When order was cancelled
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the order was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the order was last updated
 *       example:
 *         id: 507f1f77bcf86cd799439013
 *         userId: 507f1f77bcf86cd799439012
 *         petId: 507f1f77bcf86cd799439011
 *         tagId: 507f191e810c19729de860ea
 *         status: shipped
 *         total: 29.99
 *         currency: USD
 *         quantity: 1
 *         shippingAddress:
 *           street: "123 Main St"
 *           city: "Anytown"
 *           state: "CA"
 *           zipCode: "12345"
 *           country: "USA"
 *         trackingNumber: "1Z12345E0205271688"
 *         squareOrderId: "sq_order_123"
 *         squarePaymentId: "sq_payment_123"
 *         paymentMethod: "credit_card"
 *         paidAt: "2023-01-02T12:00:00.000Z"
 *         shippedAt: "2023-01-03T09:30:00.000Z"
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-03T09:30:00.000Z"
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  petId: mongoose.Types.ObjectId;
  tagId?: mongoose.Types.ObjectId;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  currency: string;
  quantity: number;
  shippingAddress: IShippingAddress;
  trackingNumber?: string;
  squareOrderId?: string;
  squarePaymentId?: string;
  paymentMethod?: string;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const shippingAddressSchema = new Schema<IShippingAddress>({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: 'USA' },
});

const orderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  petId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
    index: true,
  },
  tagId: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    sparse: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  trackingNumber: {
    type: String,
    trim: true,
  },
  squareOrderId: {
    type: String,
    trim: true,
  },
  squarePaymentId: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    trim: true,
  },
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
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
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ squareOrderId: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
