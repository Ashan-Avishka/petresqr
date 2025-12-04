// api/pet-types.ts

export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  color: string;
  image: string;
  bio: {
    description: string;
    birthDate: string;
    microchipId?: string;
  };
  medical: {
    allergies: string;
    medications: string;
    conditions: string;
    vetName: string;
    vetPhone: string;
  };
  tag: {
    tagId: string;
    activatedDate: string;
    status: 'active' | 'inactive';
  };
  other: {
    favoriteFood: string;
    behavior: string;
    specialNeeds: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetRequest {
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  color: string;
  image: string;
  bio: {
    description: string;
    birthDate: string;
    microchipId?: string;
  };
  medical: {
    allergies: string;
    medications: string;
    conditions: string;
    vetName: string;
    vetPhone: string;
  };
  tag: {
    tagId: string;
    activatedDate: string;
    status: 'active' | 'inactive';
  };
  other: {
    favoriteFood: string;
    behavior: string;
    specialNeeds: string;
  };
}

export interface UpdatePetRequest extends Partial<CreatePetRequest> {
  petId: string;
}

export interface DeletePetRequest {
  petId: string;
}

export interface GetPetsResponse {
  pets: Pet[];
  total: number;
  message: string;
}

export interface GetPetResponse {
  pet: Pet;
  message: string;
}

export interface CreatePetResponse {
  pet: Pet;
  message: string;
}

export interface UpdatePetResponse {
  pet: Pet;
  message: string;
}

export interface DeletePetResponse {
  message: string;
}