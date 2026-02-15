// api/tag-api.ts

import { apiClient } from './client';
import type {
  GetTagsResponse,
  GetTagResponse,
  CreateTagRequest,
  CreateTagResponse,
  UpdateTagRequest,
  UpdateTagResponse,
  AssignTagRequest,
  AssignTagResponse,
  UnassignTagRequest,
  DeleteTagResponse,
  ActivateTagResponse,
} from './tag-types';
import type { ApiResponse } from './types';

export const tagAPI = {
  /**
   * Get all tags for the authenticated user
   * GET /tags
   */
  getTags: async (): Promise<ApiResponse<GetTagsResponse>> => {
    try {
      const response = await apiClient.get('/tags');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'GET_TAGS_ERROR',
          message: error.response?.data?.message || 'Failed to fetch tags',
        },
      };
    }
  },

  /**
   * Get a specific tag by ID
   * GET /tags/:tagId
   */
  getTag: async (tagId: string): Promise<ApiResponse<GetTagResponse>> => {
    try {
      const response = await apiClient.get(`/tags/${tagId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'GET_TAG_ERROR',
          message: error.response?.data?.message || 'Failed to fetch tag',
        },
      };
    }
  },

  /**
   * Purchase / create a tag (initiates an order)
   * POST /tags/purchase
   */
  createTag: async (data: CreateTagRequest): Promise<ApiResponse<CreateTagResponse>> => {
    try {
      const response = await apiClient.post('/tags/purchase', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'CREATE_TAG_ERROR',
          message: error.response?.data?.message || 'Failed to create tag',
        },
      };
    }
  },

  /**
   * Update a tag's status
   * PUT /tags/:tagId
   */
  updateTag: async (data: UpdateTagRequest): Promise<ApiResponse<UpdateTagResponse>> => {
    try {
      const { tagId, ...updateData } = data;
      const response = await apiClient.put(`/tags/${tagId}`, updateData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'UPDATE_TAG_ERROR',
          message: error.response?.data?.message || 'Failed to update tag',
        },
      };
    }
  },

  /**
   * Activate a tag by its MongoDB _id
   * POST /tags/:tagId/activate
   * 
   * FLOW 1 (first-time): Finds available QRCode from collection and assigns it
   * FLOW 2 (re-activation): Just sets isActive = true
   */
  activateTag: async (tagId: string): Promise<ApiResponse<ActivateTagResponse>> => {
    try {
      const response = await apiClient.post(`/tags/${tagId}/activate`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'ACTIVATION_ERROR',
          message: error.response?.data?.message || 'Failed to activate tag',
        },
      };
    }
  },

  /**
   * Deactivate a tag by its MongoDB _id
   * POST /tags/:tagId/deactivate
   */
  deactivateTag: async (tagId: string): Promise<ApiResponse<UpdateTagResponse>> => {
    try {
      const response = await apiClient.post(`/tags/${tagId}/deactivate`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'DEACTIVATION_ERROR',
          message: error.response?.data?.message || 'Failed to deactivate tag',
        },
      };
    }
  },

  /**
   * Assign a tag to a pet
   * POST /tags/:tagId/assign
   */
  assignTag: async (data: AssignTagRequest): Promise<ApiResponse<AssignTagResponse>> => {
    try {
      const response = await apiClient.post(`/tags/${data.tagId}/assign`, {
        petId: data.petId,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'ASSIGN_TAG_ERROR',
          message: error.response?.data?.message || 'Failed to assign tag',
        },
      };
    }
  },

  /**
   * Unassign a tag from its pet
   * POST /tags/:tagId/unassign
   */
  unassignTag: async (data: UnassignTagRequest): Promise<ApiResponse<UpdateTagResponse>> => {
    try {
      const response = await apiClient.post(`/tags/${data.tagId}/unassign`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'UNASSIGN_TAG_ERROR',
          message: error.response?.data?.message || 'Failed to unassign tag',
        },
      };
    }
  },

  /**
   * Delete a tag
   * DELETE /tags/:tagId
   */
  deleteTag: async (tagId: string): Promise<ApiResponse<DeleteTagResponse>> => {
    try {
      const response = await apiClient.delete(`/tags/${tagId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.code || 'DELETE_TAG_ERROR',
          message: error.response?.data?.message || 'Failed to delete tag',
        },
      };
    }
  },
};