// src/models/Pet.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     Pet:
 *       type: object
 *       required:
 *         - name
 *         - breed
 *         - age
 *         - ownerId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the pet
 *         name:
 *           type: string
 *           maxLength: 50
 *           description: The name of the pet
 *         breed:
 *           type: string
 *           maxLength: 50
 *           description: The breed of the pet
 *         age:
 *           type: number
 *           minimum: 0
 *           maximum: 30
 *           description: The age of the pet in years
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: The pet's date of birth
 *         medicalConditions:
 *           type: string
 *           maxLength: 500
 *           description: Any medical conditions the pet has
 *         photoUrl:
 *           type: string
 *           description: URL to the pet's photo
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           default: inactive
 *           description: The current status of the pet
 *         tagId:
 *           type: string
 *           description: ID of the associated tag
 *         ownerId:
 *           type: string
 *           description: ID of the pet's owner
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the pet is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the pet was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the pet was last updated
 *       example:
 *         id: 507f1f77bcf86cd799439011
 *         name: Max
 *         breed: Golden Retriever
 *         age: 5
 *         dateOfBirth: "2018-05-15"
 *         medicalConditions: Allergic to chicken
 *         photoUrl: https://example.com/pet-photos/max.jpg
 *         status: active
 *         tagId: 507f191e810c19729de860ea
 *         ownerId: 507f1f77bcf86cd799439012
 *         isActive: true
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IPet extends Document {
  name: string;
  breed: string;
  age: number;
  dateOfBirth?: Date;
  medicalConditions?: string;
  photoUrl?: string;
  photoKey?: string; // S3 key for deletion
  status: 'active' | 'inactive' | 'pending';
  tagId?: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new Schema<IPet>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  breed: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 30,
  },
  dateOfBirth: {
    type: Date,
  },
  medicalConditions: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  photoUrl: {
    type: String,
    trim: true,
  },
  photoKey: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'inactive',
  },
  tagId: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    sparse: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.photoKey;
      return ret;
    },
  },
});

// Indexes
petSchema.index({ ownerId: 1, isActive: 1 });
petSchema.index({ status: 1 });
petSchema.index({ createdAt: -1 });
petSchema.index({ name: 'text', breed: 'text' });

export const Pet = mongoose.model<IPet>('Pet', petSchema);