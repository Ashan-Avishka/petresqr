// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import * as admin from 'firebase-admin';

export class AuthController {
  // Register with email/password
  async registerWithEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, address } = req.body;

      // Check if user already exists in database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        sendError(res, 'User already exists', 409, 'USER_EXISTS');
        return;
      }

      // Create user in Firebase Auth
      const firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      // Create user in database with address
      const user = new User({
        firebaseUid: firebaseUser.uid,
        email,
        firstName,
        lastName,
        phone,
        address, // Save address here
        authProvider: 'email',
      });

      await user.save();

      // Generate custom token for immediate login
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

      sendSuccess(res, {
        user: user.toJSON(),
        customToken,
        message: 'User registered successfully. Use the custom token to authenticate with Firebase client SDK to get an ID token.'
      }, 201);
    } catch (error: any) {
      console.error('Email registration error:', error);
      
      // Handle Firebase specific errors
      if (error.code === 'auth/email-already-exists') {
        sendError(res, 'Email already exists', 409, 'EMAIL_EXISTS');
      } else if (error.code === 'auth/weak-password') {
        sendError(res, 'Password is too weak', 400, 'WEAK_PASSWORD');
      } else if (error.code === 'auth/invalid-email') {
        sendError(res, 'Invalid email format', 400, 'INVALID_EMAIL');
      } else {
        sendError(res, 'Registration failed', 500, 'REGISTRATION_ERROR');
      }
    }
  }

  // Register/Login with Google (OAuth)
  async authWithGoogle(req: Request, res: Response): Promise<void> {
    try {
      const { firebaseToken } = req.body;

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      
      // Get user info from Firebase
      const firebaseUser = await admin.auth().getUser(decodedToken.uid);

      // Check if user exists in database
      let user = await User.findOne({ firebaseUid: decodedToken.uid });
      let isNewUser = false;

      if (!user) {
        // Create new user if doesn't exist
        isNewUser = true;
        const emailVerified = firebaseUser.emailVerified;
        const email = firebaseUser.email;
        const displayName = firebaseUser.displayName || '';
        const [firstName, ...lastNameParts] = displayName.split(' ');
        const lastName = lastNameParts.join(' ');

        user = new User({
          firebaseUid: decodedToken.uid,
          email,
          firstName: firstName || 'User',
          lastName: lastName || '',
          address:  '',
          authProvider: 'google',
          emailVerified,
        });

        await user.save();
      }

      sendSuccess(res, {
        user: user.toJSON(),
        idToken: firebaseToken,
        isNewUser,
        message: isNewUser ? 'User registered and logged in' : 'Login successful'
      });
    } catch (error: any) {
      console.error('Google auth error:', error);
      if (error.code === 'auth/id-token-expired') {
        sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
      } else if (error.code === 'auth/argument-error') {
        sendError(res, 'Invalid token format', 401, 'INVALID_TOKEN');
      } else {
        sendError(res, 'Google authentication failed', 500, 'GOOGLE_AUTH_ERROR');
      }
    }
  }

  // Login with email/password - PROPER IMPLEMENTATION
// Add this improved loginWithEmail method to your AuthController.ts

// Add this improved loginWithEmail method to your AuthController.ts

async loginWithEmail(req: Request, res: Response): Promise<void> {
  try {
    const { email, firebaseToken } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Token received:', firebaseToken ? 'Yes' : 'No');
    console.log('Token length:', firebaseToken ? firebaseToken.length : 0);
    console.log('Token preview:', firebaseToken ? firebaseToken.substring(0, 50) + '...' : 'N/A');
    
    if (!firebaseToken) {
      sendError(res, 'Firebase ID token is required. Please authenticate with Firebase client SDK first.', 400, 'MISSING_TOKEN');
      return;
    }

    try {
      // Verify the Firebase ID token
      console.log('Verifying token with Firebase...');
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      console.log('Token verified successfully!');
      console.log('Decoded token UID:', decodedToken.uid);
      console.log('Decoded token email:', decodedToken.email);
      
      // Verify email matches
      if (decodedToken.email !== email) {
        console.log('Email mismatch!');
        sendError(res, 'Email mismatch', 401, 'EMAIL_MISMATCH');
        return;
      }

      // Find user in database
      const user = await User.findOne({ 
        firebaseUid: decodedToken.uid,
        email: email,
        isActive: true 
      });

      if (!user) {
        console.log('User not found in database');
        console.log('Searched for firebaseUid:', decodedToken.uid);
        console.log('Searched for email:', email);
        
        // Debug: Check if user exists with different criteria
        const userByUid = await User.findOne({ firebaseUid: decodedToken.uid });
        const userByEmail = await User.findOne({ email: email });
        
        console.log('User by UID only:', userByUid ? 'Found' : 'Not found');
        console.log('User by email only:', userByEmail ? 'Found' : 'Not found');
        
        if (userByUid) {
          console.log('User details:', JSON.stringify({
            firebaseUid: userByUid.firebaseUid,
            email: userByUid.email,
            isActive: userByUid.isActive,
            authProvider: userByUid.authProvider
          }));
        }
        
        sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
        return;
      }

      console.log('User found in database:', user._id);

      // Verify this is an email/password user
      if (user.authProvider !== 'email') {
        console.log('Wrong auth provider:', user.authProvider);
        sendError(res, `This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`, 401, 'WRONG_AUTH_METHOD');
        return;
      }

      console.log('Login successful!');
      sendSuccess(res, {
        user: user.toJSON(),
        idToken: firebaseToken,
        message: 'Login successful'
      });
    } catch (firebaseError: any) {
      console.error('Firebase token verification error:', firebaseError);
      console.error('Error code:', firebaseError.code);
      console.error('Error message:', firebaseError.message);
      
      if (firebaseError.code === 'auth/id-token-expired') {
        sendError(res, 'Token expired. Please sign in again.', 401, 'TOKEN_EXPIRED');
      } else if (firebaseError.code === 'auth/argument-error') {
        sendError(res, 'Invalid token format', 401, 'INVALID_TOKEN');
      } else if (firebaseError.code === 'auth/invalid-argument') {
        sendError(res, 'Invalid token format. Make sure you are sending an ID token, not a custom token.', 401, 'INVALID_TOKEN');
      } else {
        sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
    }
  } catch (error) {
    console.error('Email login error:', error);
    sendError(res, 'Login failed', 500, 'LOGIN_ERROR');
  }
}

  // Verify token and get user (for protected routes)
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { firebaseToken } = req.body;

      if (!firebaseToken) {
        sendError(res, 'Firebase token is required', 400, 'MISSING_TOKEN');
        return;
      }

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      
      // Find user in database
      const user = await User.findOne({ 
        firebaseUid: decodedToken.uid,
        isActive: true 
      });

      if (!user) {
        sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
        return;
      }

      sendSuccess(res, {
        user: user.toJSON(),
        tokenValid: true,
        idToken: firebaseToken
      });
    } catch (error: any) {
      console.error('Token verification error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
      } else if (error.code === 'auth/argument-error') {
        sendError(res, 'Invalid token format', 401, 'INVALID_TOKEN');
      } else {
        sendError(res, 'Invalid token', 401, 'INVALID_TOKEN');
      }
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Revoke Firebase tokens for extra security
      if (req.user?.firebaseUid) {
        await admin.auth().revokeRefreshTokens(req.user.firebaseUid);
      }
      
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      sendError(res, 'Logout failed', 500, 'LOGOUT_ERROR');
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Check if user exists in our database
      const user = await User.findOne({ email, isActive: true });
      
      if (!user) {
        // Don't reveal whether user exists or not (security best practice)
        sendSuccess(res, { 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        });
        return;
      }

      // Only send reset email for email/password users
      if (user.authProvider !== 'email') {
        sendSuccess(res, { 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        });
        return;
      }

      // Generate password reset link
      const resetLink = await admin.auth().generatePasswordResetLink(email, {
        url: process.env.PASSWORD_RESET_URL || 'http://localhost:3000/reset-password',
      });

      // TODO: Send email with reset link using your email service
      // For now, we'll just return success
      
      sendSuccess(res, { 
        message: 'Password reset email sent successfully.',
        // In development, you might want to return the link
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      sendError(res, 'Failed to send reset email', 500, 'FORGOT_PASSWORD_ERROR');
    }
  }

  // Update user profile
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { firstName, lastName, phone, address } = req.body;
      const userId = req.userId;

      const user = await User.findByIdAndUpdate(
        userId,
        { 
          firstName, 
          lastName, 
          phone, 
          address,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!user) {
        sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
        return;
      }

      // Update Firebase user display name
      if (user.firebaseUid) {
        await admin.auth().updateUser(user.firebaseUid, {
          displayName: `${firstName} ${lastName}`
        });
      }

      sendSuccess(res, {
        user: user.toJSON(),
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      sendError(res, 'Failed to update profile', 500, 'UPDATE_ERROR');
    }
  }

  // Get token for Swagger testing - DEVELOPMENT ONLY
  async getTestToken(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (process.env.NODE_ENV === 'production') {
        sendError(res, 'This endpoint is only available in development', 403, 'FORBIDDEN');
        return;
      }

      // Find user in database
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
        return;
      }

      // Generate custom token for testing
      const customToken = await admin.auth().createCustomToken(user.firebaseUid, {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || 'user'
      });

      sendSuccess(res, {
        token: customToken,
        user: user.toJSON(),
        message: 'Test token generated. Exchange this custom token for an ID token using Firebase client SDK, then use the ID token as Bearer token in Swagger Authorization.'
      });
    } catch (error) {
      console.error('Test token generation error:', error);
      sendError(res, 'Failed to generate test token', 500, 'TOKEN_ERROR');
    }
  }
}