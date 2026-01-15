import { apiClient } from './client';
import type { GetPetByTagResponse, NotifyOwnerRequest, NotifyOwnerResponse } from './found-types';
import type { ApiResponse } from './types';


export const foundAPI = {
  /**
   * Get pet information by tag QR code (public endpoint - no auth required)
   */
  getPetByTag: async (
    qrCode: string
  ): Promise<ApiResponse<GetPetByTagResponse>> => {
    try {
      const response = await apiClient.get(`/foundPet/tag/${qrCode}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'GET_PET_BY_TAG_ERROR',
          message:
            error.response?.data?.message ||
            'Tag not found or not assigned to any pet',
        },
      };
    }
  },

  /**
   * Notify pet owner with finder details and location
   */
  notifyOwner: async (
    data: NotifyOwnerRequest
  ): Promise<ApiResponse<NotifyOwnerResponse>> => {
    try {
      const response = await apiClient.post('/foundPet/notify', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'NOTIFY_OWNER_ERROR',
          message:
            error.response?.data?.message ||
            'Failed to notify owner. Please try again.',
        },
      };
    }
  },
};