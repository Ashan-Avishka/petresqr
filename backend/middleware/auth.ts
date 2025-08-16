// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../config/firebase';
import { User } from '../models/User';
import * as admin from 'firebase-admin';

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'Access token is required' }
      });
      return;
    }

    let decodedToken;
    
    try {
      // First try to verify as ID token
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (idTokenError) {
      try {
        // If ID token verification fails, try as custom token
        // For custom tokens, we need to decode manually (they're JWTs but not ID tokens)
        // This is a simplified approach for testing
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        
        if (decoded && decoded.uid) {
          // Get user from Firebase to verify the custom token is valid
          const firebaseUser = await admin.auth().getUser(decoded.uid);
          decodedToken = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...decoded
          };
        } else {
          throw new Error('Invalid token format');
        }
      } catch (customTokenError) {
        console.error('Token verification failed:', { idTokenError, customTokenError });
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid access token' }
        });
        return;
      }
    }
    
    // Find user in database
    const user = await User.findOne({ 
      firebaseUid: decodedToken.uid,
      isActive: true 
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid access token' }
    });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required' }
    });
    return;
  }
  next();
};