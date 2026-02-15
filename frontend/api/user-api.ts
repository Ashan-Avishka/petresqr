// api/user-api.ts

import { apiClient } from './client';
import type {
  User,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ApiResponse,
} from './types';

export interface GetProfileResponse {
  user: User;
  message: string;
}

export interface UpdateEmergencyContactRequest {
  emergencyContact: string;
  emergencyPhone: string;
}

export interface UpdateEmergencyContactResponse {
  user: User;
  message: string;
}

export const userAPI = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<GetProfileResponse>> => {
    try {
      const response = await apiClient.get('/users/profile');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'GET_PROFILE_ERROR',
          message: error.response?.data?.message || 'Failed to fetch profile',
        },
      };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<ApiResponse<UpdateProfileResponse>> => {
    try {
      const response = await apiClient.put('/users/profile', data);
      return { success: true, data: response.data};
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'UPDATE_PROFILE_ERROR',
          message: error.response?.data?.message || 'Failed to update profile',
        },
      };
    }
  },

  /**
   * Update emergency contact
   */
  updateEmergencyContact: async (
    data: UpdateEmergencyContactRequest
  ): Promise<ApiResponse<UpdateEmergencyContactResponse>> => {
    try {
      const response = await apiClient.put('/users/emergency-contact', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'UPDATE_EMERGENCY_CONTACT_ERROR',
          message: error.response?.data?.message || 'Failed to update emergency contact',
        },
      };
    }
  },

  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.delete('/users/account');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'DELETE_ACCOUNT_ERROR',
          message: error.response?.data?.message || 'Failed to delete account',
        },
      };
    }
  },
};