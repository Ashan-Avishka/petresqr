// src/routes/auth.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Register with email and password
/**
 * @swagger
 * /auth/register/email:
 *   post:
 *     summary: Register a new user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully with custom token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 customToken:
 *                   type: string
 *                   description: Use this token with Firebase client SDK to get ID token
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */
router.post('/register/email',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().isLength({ min: 1, max: 50 }),
    body('lastName').trim().isLength({ min: 1, max: 50 }),
    body('phone').optional().isMobilePhone('any'),
  ],
  handleValidationErrors,
  authController.registerWithEmail
);

// Login with email and password
/**
 * @swagger
 * /auth/login/email:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 description: Required if firebaseToken not provided
 *               firebaseToken:
 *                 type: string
 *                 description: Firebase ID token (if user already authenticated with Firebase)
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 idToken:
 *                   type: string
 *                   description: Firebase ID token for API calls
 *       401:
 *         description: Invalid credentials
 */
router.post('/login/email',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').optional(),
    body('firebaseToken').optional(),
  ],
  handleValidationErrors,
  authController.loginWithEmail
);

// Google authentication (register/login)
/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Authenticate with Google (register or login)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firebaseToken
 *             properties:
 *               firebaseToken:
 *                 type: string
 *                 description: Firebase ID token from Google authentication
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 idToken:
 *                   type: string
 *                 isNewUser:
 *                   type: boolean
 *       401:
 *         description: Invalid token
 */
router.post('/google',
  [
    body('firebaseToken').notEmpty().withMessage('Firebase token is required'),
  ],
  handleValidationErrors,
  authController.authWithGoogle
);

// Verify token
/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify Firebase token and get user data
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firebaseToken
 *             properties:
 *               firebaseToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 tokenValid:
 *                   type: boolean
 *                 idToken:
 *                   type: string
 *       401:
 *         description: Invalid token
 */
router.post('/verify',
  [
    body('firebaseToken').notEmpty().withMessage('Firebase token is required'),
  ],
  handleValidationErrors,
  authController.verifyToken
);

// Logout
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticateToken, authController.logout);

// Forgot password
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset (email auth only)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  handleValidationErrors,
  authController.forgotPassword
);

// Update profile
/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/profile',
  authenticateToken,
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('phone').optional().isMobilePhone('any'),
    body('address').optional().trim().isLength({ max: 255 }),
  ],
  handleValidationErrors,
  authController.updateProfile
);

// Get test token for Swagger (Development only)
/**
 * @swagger
 * /auth/test-token:
 *   post:
 *     summary: Get authentication token for Swagger testing (Development only)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of registered user
 *     responses:
 *       200:
 *         description: Test token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Use this token in Swagger Authorization (Bearer token)
 *                 user:
 *                   type: object
 *       404:
 *         description: User not found
 *       403:
 *         description: Only available in development mode
 */
router.post('/test-token',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  handleValidationErrors,
  authController.getTestToken
);

export default router;