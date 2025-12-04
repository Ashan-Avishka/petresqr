// api/tag-types.ts

export interface Tag {
  _id: string;
  userId: string;
  qrCode: string; // Changed from tagId to qrCode
  qrCodeUrl: string; // Added this field
  status: 'active' | 'inactive' | 'pending'; // Added pending status
  purchaseDate?: string; // Made optional to match response
  assignedTo?: string; // Pet ID
  petName?: string;
  activatedAt?: string; // Added this field
  createdAt: string;
  updatedAt: string;
  // Nested pet object from backend response
  pet?: {
    name: string;
    breed: string;
    tag: {
      tagId: string;
      activatedDate: string;
      status: string;
    };
    id: string;
    image: string;
  };
}

export interface CreateTagRequest {
  qrCode: string; // Changed from tagId to qrCode
  purchaseDate: string;
  userId: string; // You'll likely need this
}

export interface UpdateTagRequest {
  qrCode: string; // Changed from tagId to qrCode
  status?: 'active' | 'inactive' | 'pending'; // Added pending
  assignedTo?: string;
  activatedAt?: string; // Added this field
}

export interface AssignTagRequest {
  qrCode: string; // Changed from tagId to qrCode
  petId: string;
}

export interface UnassignTagRequest {
  qrCode: string; // Changed from tagId to qrCode
}

export interface GetTagsResponse {
  tags: Tag[];
  total: number;
  message: string;
}

export interface GetTagResponse {
  tag: Tag;
  message: string;
}

export interface CreateTagResponse {
  tag: Tag;
  message: string;
}

export interface UpdateTagResponse {
  tag: Tag;
  message: string;
}

export interface AssignTagResponse {
  tag: Tag;
  pet: {
    _id: string;
    name: string;
    breed?: string; // Added breed to match backend
    image?: string; // Added image to match backend
  };
  message: string;
}

export interface DeleteTagResponse {
  message: string;
}

// Additional interfaces for the nested pet structure
export interface PetTagInfo {
  tagId: string;
  activatedDate: string;
  status: string;
}

export interface PetData {
  name: string;
  breed: string;
  id: string;
  image: string;
  tag: PetTagInfo;
}