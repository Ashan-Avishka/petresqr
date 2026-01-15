// api/pet-types.ts

export interface Pet {
  id: string;
  _id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  color: string;
  dateOfBirth?: string;
  image?: string;
  
  bio: {
    description?: string;
    microchipId?: string;
    birthDate?: string;
  };
  
  medical: {
    allergies?: string;
    medications?: string;
    conditions?: string;
    vetName?: string;
    vetPhone?: string;
  };
  
  tag: {
    tagId: string;
    status: 'active' | 'inactive';
    activatedDate?: string;
  };
  
  other: {
    favoriteFood?: string;
    behavior?: string;
    specialNeeds?: string;
  };
  
  story: {
    content?: string;
    location?: string;
    status: 'protected' | 'reunited' | 'adopted' | 'lost' | 'found';
  };
  
  status: 'active' | 'inactive';
  gallery: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetRequest {
  name: string;
  type?: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight?: number;
  gender: 'male' | 'female';
  color?: string;
  dateOfBirth?: string;
  
  bio?: {
    description?: string;
    microchipId?: string;
  };
  
  medical?: {
    allergies?: string;
    medications?: string;
    conditions?: string;
    vetName?: string;
    vetPhone?: string;
  };
  
  other?: {
    favoriteFood?: string;
    behavior?: string;
    specialNeeds?: string;
  };
  
  story?: {
    content?: string;
    location?: string;
    status?: 'protected' | 'reunited' | 'adopted' | 'lost' | 'found';
  };
  
  tagId?: string;
  gallery?: boolean; // New field
  photo?: File;
}

export interface UpdatePetRequest {
  petId: string;
  name?: string;
  type?: 'dog' | 'cat' | 'other';
  breed?: string;
  age?: number;
  weight?: number;
  gender?: 'male' | 'female';
  color?: string;
  dateOfBirth?: string;
  
  bio?: {
    description?: string;
    microchipId?: string;
  };
  
  medical?: {
    allergies?: string;
    medications?: string;
    conditions?: string;
    vetName?: string;
    vetPhone?: string;
  };
  
  other?: {
    favoriteFood?: string;
    behavior?: string;
    specialNeeds?: string;
  };
  
  story?: {
    content?: string;
    location?: string;
    status?: 'protected' | 'reunited' | 'adopted' | 'lost' | 'found';
  };
  
  tagId?: string | null;
  gallery?: boolean; // New field
  photo?: File;
}

export interface ToggleGalleryRequest {
  petId: string;
  gallery: boolean;
}

export interface DeletePetRequest {
  petId: string;
}

export interface GetPetsResponse {
  data: Pet[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetPetResponse {
  data: Pet;
}

export interface CreatePetResponse {
  data: Pet;
}

export interface UpdatePetResponse {
  data: Pet;
}

export interface ToggleGalleryResponse {
  data: Pet;
}

export interface DeletePetResponse {
  data: {
    message: string;
  };
}

export interface GetGalleryPetsResponse {
  data: Pet[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}