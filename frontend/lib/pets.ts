// lib/pets.ts - Data fetching utilities
export const petsData: Pet[] = [
  {
    id: '1',
    slug: 'max-golden-retriever',
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    location: 'San Francisco, CA',
    protectedDays: 45,
    story: 'Max got his PetRescue tag and loves showing it off to other dogs at the park!',
    image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=800&fit=crop',
    status: 'featured',
    gender: 'male',
    weight: 30,
    color: 'Golden',
    tagId: 'TAG-2024-001',
    bio: {
      description: 'Friendly and energetic golden retriever who loves to play fetch and go on long walks.',
      personality: 'Very social, loves children, and gets along well with other dogs.',
      medicalNotes: 'Up to date on all vaccinations'
    }
  },
  {
    id: '2',
    slug: 'luna-persian-cat',
    name: 'Luna',
    type: 'cat',
    breed: 'Persian Cat',
    age: 2,
    location: 'New York, NY',
    protectedDays: 120,
    story: 'Luna was found after 3 days thanks to her QR tag. The finder scanned it and called us immediately!',
    image: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800&h=800&fit=crop',
    status: 'reunited',
    gender: 'female',
    weight: 4,
    color: 'Gray',
    tagId: 'TAG-2024-002',
    foundDate: '2024-03-15',
    bio: {
      description: 'Sweet and affectionate Persian cat with beautiful gray fur.',
      personality: 'Calm and gentle, prefers quiet environments.',
      medicalNotes: 'Indoor cat, requires daily grooming'
    }
  },
  {
    id: '3',
    slug: 'buddy-labrador-mix',
    name: 'Buddy',
    type: 'dog',
    breed: 'Labrador Mix',
    age: 4,
    location: 'Austin, TX',
    protectedDays: 200,
    story: 'Buddy loves his adventures and his family loves the peace of mind PetRescue provides.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=800&fit=crop',
    status: 'protected',
    gender: 'male',
    weight: 28,
    color: 'Brown & White',
    tagId: 'TAG-2024-003',
    bio: {
      description: 'Adventurous and loyal companion who loves outdoor activities.',
      personality: 'High energy, friendly with everyone, excellent with kids.',
      medicalNotes: 'Neutered, microchipped'
    }
  },
  {
    id: '4',
    slug: 'whiskers-maine-coon',
    name: 'Whiskers',
    type: 'cat',
    breed: 'Maine Coon',
    age: 1,
    location: 'Seattle, WA',
    protectedDays: 90,
    story: 'Whiskers escaped during a thunderstorm but was safely returned home within hours!',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop',
    status: 'reunited',
    gender: 'male',
    weight: 6,
    color: 'Orange Tabby',
    tagId: 'TAG-2024-004',
    foundDate: '2024-02-20',
    bio: {
      description: 'Playful Maine Coon kitten with an adventurous spirit.',
      personality: 'Curious and playful, loves to explore.',
      medicalNotes: 'All vaccinations current'
    }
  },
  {
    id: '5',
    slug: 'rocky-german-shepherd',
    name: 'Rocky',
    type: 'dog',
    breed: 'German Shepherd',
    age: 5,
    location: 'Denver, CO',
    protectedDays: 365,
    story: 'Rocky is our ambassador dog, helping to spread awareness about pet safety in his community.',
    image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=800&fit=crop',
    status: 'featured',
    gender: 'male',
    weight: 35,
    color: 'Black & Tan',
    tagId: 'TAG-2024-005',
    bio: {
      description: 'Intelligent and loyal German Shepherd, trained as a therapy dog.',
      personality: 'Calm, obedient, and protective of family.',
      medicalNotes: 'Service dog certified'
    }
  },
  {
    id: '6',
    slug: 'mittens-tabby-cat',
    name: 'Mittens',
    type: 'cat',
    breed: 'Tabby Cat',
    age: 3,
    location: 'Portland, OR',
    protectedDays: 60,
    story: 'Mittens was reunited with her family after being missing for a week. A kind stranger found her and scanned her tag!',
    image: 'https://images.unsplash.com/photo-1625060241508-22488e1e9264?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074',
    status: 'reunited',
    gender: 'female',
    weight: 5,
    color: 'Gray Tabby',
    tagId: 'TAG-2024-006',
    foundDate: '2024-01-10',
    bio: {
      description: 'Sweet tabby cat with distinctive markings.',
      personality: 'Independent but affectionate, loves sunny spots.',
      medicalNotes: 'Spayed, indoor/outdoor cat'
    }
  }
];

export async function getAllPets(): Promise<Pet[]> {
  return petsData;
}

export async function getPetBySlug(slug: string): Promise<Pet | undefined> {
  return petsData.find(pet => pet.slug === slug);
}

export async function getPetsByType(type: 'dog' | 'cat'): Promise<Pet[]> {
  return petsData.filter(pet => pet.type === type);
}

export async function getFeaturedPets(): Promise<Pet[]> {
  return petsData.filter(pet => pet.status === 'featured');
}

export async function getReunitedPets(): Promise<Pet[]> {
  return petsData.filter(pet => pet.status === 'reunited');
}