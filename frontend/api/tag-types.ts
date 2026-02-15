// api/tag-types.ts

export interface Tag {
  _id: string;
  userId: string;
  petId?: string;
  qrCodeId?: string;       // Reference to QRCode collection
  qrCode?: string;          // Physical tag ID (e.g., "6P421DZ5")
  qrCodeUrl?: string;       // URL from QRCode.qrCodeData
  websiteUrl?: string;      // URL from QRCode.websiteUrl
  status: 'active' | 'inactive' | 'pending';
  isActive: boolean;
  purchaseDate?: string;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Nested objects from backend populate()
  pet?: {
    name: string;
    breed: string;
    imageUrl: string;
    id?: string;
    _id?: string;
  };
  order?: {
    status: string;
    total: number;
    createdAt: string;
  };
}

// ── Request / Response types ───────────────────────────────────────────────

export interface CreateTagRequest {
  petId: string;
  quantity?: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
}

export interface CreateTagResponse {
  orderId: string;
  tagId: string;
  total: number;
  quantity: number;
  paymentUrl: string;
}

export interface UpdateTagRequest {
  tagId: string;
  status?: 'active' | 'inactive' | 'pending';
  isActive?: boolean;
  activatedAt?: string;
}

export interface UpdateTagResponse {
  tag: Tag;
  message: string;
}

export interface ActivateTagResponse {
  tag: Tag;
  message: string;
}

export interface AssignTagRequest {
  tagId: string;
  petId: string;
}

export interface AssignTagResponse {
  tag: Tag;
  pet: {
    _id: string;
    name: string;
    breed?: string;
    imageUrl?: string;
  };
  message: string;
}

export interface UnassignTagRequest {
  tagId: string;
}

export interface GetTagsResponse {
  tags: Tag[];
  totalTags: number;
  activeCount: number;
  pendingCount: number;
  message?: string;
}

export interface GetTagResponse {
  tag: Tag;
  message: string;
}

export interface DeleteTagResponse {
  message: string;
}