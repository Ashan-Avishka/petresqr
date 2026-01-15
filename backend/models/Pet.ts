// src/models/Pet.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPet extends Document {
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  color: string;
  dateOfBirth?: Date;
  
  // Bio information
  bio: {
    description?: string;
    microchipId?: string;
  };
  
  // Medical information
  medical: {
    allergies?: string;
    medications?: string;
    conditions?: string;
    vetName?: string;
    vetPhone?: string;
  };
  
  // Other information
  other: {
    favoriteFood?: string;
    behavior?: string;
    specialNeeds?: string;
  };
  
  // Story information
  story: {
    content?: string;
    location?: string;
    status: 'protected' | 'reunited' | 'adopted' | 'lost' | 'found';
  };
  
  // Photo
  photoUrl?: string;
  photoKey?: string;
  
  // References
  ownerId: mongoose.Types.ObjectId;
  tagId?: mongoose.Types.ObjectId | null;
  
  // Status
  status: 'active' | 'inactive';
  isActive: boolean;
  gallery: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new Schema<IPet>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['dog', 'cat', 'other'],
      default: 'dog',
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    color: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    
    // Bio section
    bio: {
      description: String,
      microchipId: String,
    },
    
    // Medical section
    medical: {
      allergies: String,
      medications: String,
      conditions: String,
      vetName: String,
      vetPhone: String,
    },
    
    // Other information
    other: {
      favoriteFood: String,
      behavior: String,
      specialNeeds: String,
    },
    
    // Story section
    story: {
      content: {
        type: String,
        default: '',
      },
      location: {
        type: String,
        default: '',
      },
      status: {
        type: String,
        enum: ['protected', 'reunited', 'adopted', 'lost', 'found'],
        default: 'protected',
      },
    },
    
    photoUrl: String,
    photoKey: String,
    
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tagId: {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    gallery: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
petSchema.index({ ownerId: 1, isActive: 1 });
petSchema.index({ tagId: 1 });
petSchema.index({ status: 1 });
petSchema.index({ gallery: 1 });
petSchema.index({ 'story.status': 1 });

// Transform output to include tag info properly
petSchema.set('toJSON', {
  transform: function (doc, ret) {
    // Format dates
    if (ret.dateOfBirth) {
      ret.dateOfBirth = ret.dateOfBirth.toISOString().split('T')[0];
    }
    
    // Build tag object from populated tagId
    if (ret.tagId && typeof ret.tagId === 'object') {
      ret.tag = {
        tagId: ret.tagId.qrCode || '',
        activatedDate: ret.tagId.activatedAt 
          ? ret.tagId.activatedAt.toISOString().split('T')[0] 
          : '',
        status: ret.tagId.status || 'inactive',
      };
    } else {
      ret.tag = {
        tagId: '',
        activatedDate: '',
        status: 'inactive',
      };
    }
    
    // Ensure story object exists with defaults
    if (!ret.story) {
      ret.story = {
        content: '',
        location: '',
        status: 'protected',
      };
    }
    
    // Rename _id to id and photoUrl to image for frontend compatibility
    ret.id = ret._id;
    ret.image = ret.photoUrl || 'https://via.placeholder.com/400x300?text=No+Image';
    
    // Clean up fields
    delete ret._id;
    delete ret.__v;
    delete ret.photoKey;
    delete ret.tagId;
    delete ret.isActive;
    
    return ret;
  },
});

export const Pet = mongoose.model<IPet>('Pet', petSchema);