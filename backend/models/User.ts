// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  role: 'user' | 'admin';
  authProvider: 'email' | 'google';
  emailVerified?: boolean;
  profilePicture?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

const userSchema = new Schema<IUser>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
  },
  address: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    required: true,
    default: 'email',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
    trim: true,
  },
  lastLoginAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.firebaseUid;
      return ret;
    },
  },
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ authProvider: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ firebaseUid: 1, isActive: 1 });

// Update last login timestamp
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

export const User = mongoose.model<IUser>('User', userSchema);