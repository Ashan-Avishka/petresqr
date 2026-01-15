// src/api/found-types.ts

export interface PetMedical {
  conditions: string;
  allergies: string;
}

export interface PetInfo {
  name: string;
  breed: string;
  photoUrl: string;
  age: string;
  gender?: string;
  color?: string;
  medical: PetMedical;
}

export interface TagInfo {
  qrCode: string;
  status: string;
}

export interface OwnerInfo {
  name: string;
  phone: string;
  email: string;
}

export interface GetPetByTagResponse {
  pet: PetInfo;
  tag: TagInfo;
  owner: OwnerInfo;
}

export interface NotifyOwnerRequest {
  qrCode: string;
  finderContact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  condition?: 'HEALTHY' | 'INJURED' | 'SICK' | 'UNKNOWN';
  additionalNotes?: string;
}

export interface NotifyOwnerResponse {
  message: string;
  pet: {
    name: string;
    breed: string;
    photoUrl: string;
  };
  notificationsSent: {
    sms: boolean;
    email: boolean;
    inApp: boolean;
  };
}