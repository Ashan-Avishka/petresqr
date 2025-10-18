// types/pet.ts
export interface Pet {
  id: string;
  slug: string;
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  age: number;
  location: string;
  protectedDays: number;
  story: string;
  image: string;
  status: 'reunited' | 'featured' | 'protected';
  gender: 'male' | 'female';
  weight: number;
  color: string;
  tagId: string;
  foundDate?: string;
  bio: {
    description: string;
    personality: string;
    medicalNotes?: string;
  };
}

