// api/pet-api.ts

import { apiClient } from './client';
import type {
  GetPetsResponse,
  GetPetResponse,
  CreatePetRequest,
  CreatePetResponse,
  UpdatePetRequest,
  UpdatePetResponse,
  DeletePetRequest,
  DeletePetResponse,
  ToggleGalleryRequest,
  ToggleGalleryResponse,
  GetGalleryPetsResponse,
} from './pet-types';
import type { ApiResponse } from './types';

export const petAPI = {
  /**
   * Get all pets for the authenticated user
   */
  getPets: async (): Promise<ApiResponse<GetPetsResponse>> => {
    try {
      const response = await apiClient.get('/pets');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'GET_PETS_ERROR',
          message: error.response?.data?.message || 'Failed to fetch pets',
        },
      };
    }
  },

  /**
   * Get a specific pet by ID
   */
  getPet: async (petId: string): Promise<ApiResponse<GetPetResponse>> => {
    try {
      const response = await apiClient.get(`/pets/${petId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'GET_PET_ERROR',
          message: error.response?.data?.message || 'Failed to fetch pet',
        },
      };
    }
  },

  /**
   * Create a new pet
   */
  createPet: async (data: CreatePetRequest | FormData): Promise<ApiResponse<CreatePetResponse>> => {
    try {
      const response = await apiClient.post('/pets', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Create pet API error:', error.response?.data || error);
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'CREATE_PET_ERROR',
          message: error.response?.data?.message || 'Failed to create pet',
        },
      };
    }
  },

  /**
   * Update an existing pet
   */
  updatePet: async (data: UpdatePetRequest): Promise<ApiResponse<UpdatePetResponse>> => {
    try {
      const { petId, ...updateData } = data;
      const response = await apiClient.put(`/pets/${petId}`, updateData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'UPDATE_PET_ERROR',
          message: error.response?.data?.message || 'Failed to update pet',
        },
      };
    }
  },

  /**
   * Toggle gallery status for a pet
   */
  toggleGallery: async (data: ToggleGalleryRequest): Promise<ApiResponse<ToggleGalleryResponse>> => {
    try {
      const { petId, gallery } = data;
      const response = await apiClient.patch(`/pets/${petId}/gallery`, { gallery });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'TOGGLE_GALLERY_ERROR',
          message: error.response?.data?.message || 'Failed to toggle gallery status',
        },
      };
    }
  },

  /**
   * Get all pets in the public gallery
   */
  getGalleryPets: async (): Promise<ApiResponse<GetGalleryPetsResponse>> => {
    try {
      const response = await apiClient.get('/pets/gallery');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'GET_GALLERY_PETS_ERROR',
          message: error.response?.data?.message || 'Failed to fetch gallery pets',
        },
      };
    }
  },

  /**
 * Get a specific pet from gallery (public, no auth required)
 */
  getGalleryPet: async (petId: string): Promise<ApiResponse<GetPetResponse>> => {
    try {
      const response = await apiClient.get(`/pets/gallery/${petId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'GET_PET_ERROR',
          message: error.response?.data?.message || 'Failed to fetch pet',
        },
      };
    }
  },

  /**
   * Delete a pet
   */
  deletePet: async (data: DeletePetRequest): Promise<ApiResponse<DeletePetResponse>> => {
    try {
      const response = await apiClient.delete(`/pets/${data.petId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'DELETE_PET_ERROR',
          message: error.response?.data?.message || 'Failed to delete pet',
        },
      };
    }
  },
};