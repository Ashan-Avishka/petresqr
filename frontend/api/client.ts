// api/client.ts
import { API_BASE_URL, getAuthHeaders } from './config';

export interface ApiClientOptions {
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    path: string,
    method: string,
    body?: any,
    options?: ApiClientOptions
  ): Promise<{ ok: boolean; data?: T; error?: any }> {
    try {
      // Check if body is FormData
      const isFormData = body instanceof FormData;

      // Merge auth headers + extra headers
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
        ...(options?.headers || {}),
      };

      // Remove Content-Type for FormData (browser will set it with boundary)
      if (isFormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(`${this.baseURL}${path}`, {
        method,
        headers,
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      });

      const result = await response.json();

      return { ok: response.ok, data: result.data, error: result.error };
    } catch (error) {
      console.error('API request error:', error);
      return {
        ok: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  }

  get<T>(path: string, options?: ApiClientOptions) {
    return this.request<T>(path, 'GET', undefined, options);
  }

  post<T>(path: string, body?: any, options?: ApiClientOptions) {
    return this.request<T>(path, 'POST', body, options);
  }

  put<T>(path: string, body?: any, options?: ApiClientOptions) {
    return this.request<T>(path, 'PUT', body, options);
  }

  patch<T>(path: string, body?: any, options?: ApiClientOptions) {
    return this.request<T>(path, 'PATCH', body, options);
  }

  delete<T>(path: string, options?: ApiClientOptions) {
    return this.request<T>(path, 'DELETE', undefined, options);
  }
}

export const apiClient = new ApiClient();