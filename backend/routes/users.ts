
// src/routes/users.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/UserController';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticateToken);

// Get user profile
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: User not found
 */
router.get('/profile', userController.getProfile);

// Update user profile
/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [Users]
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
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: User's first name
 *                 example: John
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: User's last name
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 maxLength: 500
 *                 description: User's address
 *                 example: "123 Main St, Anytown, USA"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: User not found
 */
router.put('/profile',
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('phone').optional().isMobilePhone('any'),
    body('address').optional().isLength({ max: 500 }),
  ],
  handleValidationErrors,
  userController.updateProfile
);

// Delete user account
/**
 * @swagger
 * /users/account:
 *   delete:
 *     summary: Delete authenticated user's account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: User not found
 */
router.delete('/account', userController.deleteAccount);

export default router;