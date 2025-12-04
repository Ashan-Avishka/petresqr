// api/auth.ts
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, setAuthToken, removeAuthToken } from './config';
import type {
  ApiResponse,
  RegisterEmailRequest,
  RegisterEmailResponse,
  LoginEmailRequest,
  LoginEmailResponse,
  GoogleAuthRequest,
  GoogleAuthResponse,
  VerifyTokenRequest,
  VerifyTokenResponse,
  LogoutResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  TestTokenRequest,
  TestTokenResponse,
} from './types';

class AuthAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Register a new user with email and password
   */
  async registerEmail(data: RegisterEmailRequest): Promise<ApiResponse<RegisterEmailResponse>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.auth.registerEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'REGISTRATION_FAILED',
            message: 'Registration failed',
          },
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Register email error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  }

  /**
   * Login with email and password
   */
  async loginEmail(data: LoginEmailRequest): Promise<ApiResponse<LoginEmailResponse>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.auth.loginEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'LOGIN_FAILED',
            message: 'Login failed',
          },
        };
      }

      // Store token if available
      const token = result.data.idToken || result.data.customToken;
      if (token) {
        setAuthToken(token);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Login email error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  }

  /**
   * Authenticate with Google
   */
  async loginGoogle(data: GoogleAuthRequest): Promise<ApiResponse<GoogleAuthResponse>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.auth.loginGoogle}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'GOOGLE_AUTH_FAILED',
            message: 'Google authentication failed',
          },
        };
      }

      // Store token
      if (result.data.idToken) {
        setAuthToken(result.data.idToken);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Google auth error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  }

  /**
   * Verify Firebase token
   */
  async verifyToken(data: VerifyTokenRequest): Promise<ApiResponse<VerifyTokenResponse>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.auth.verify}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'VERIFICATION_FAILED',
            message: 'Token verification failed',
          },
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Verify token error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<LogoutResponse>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.auth.logout}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      // Always remove token on logout attempt
      removeAuthToken();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'LOGOUT_FAILED',
            message: 'Logout failed',
          },
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token even if request fails
      removeAuthToken();
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.auth.forgotPassword}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'FORGOT_PASSWORD_FAILED',
            message: 'Failed to send reset email',
          },
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UpdateProfileResponse>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.auth.updateProfile}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'UPDATE_FAILED',
            message: 'Failed to update profile',
          },
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  }

  /**
   * Get test token (Development only)
   */
  async getTestToken(data: TestTokenRequest): Promise<ApiResponse<TestTokenResponse>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.auth.testToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'TOKEN_GENERATION_FAILED',
            message: 'Failed to generate test token',
          },
        };
      }

      // Store token for testing
      if (result.data.token) {
        setAuthToken(result.data.token);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Get test token error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();

// Export class for custom instances if needed
export default AuthAPI;