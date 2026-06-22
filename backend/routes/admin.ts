// src/routes/admin.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { AdminController } from '../controllers/AdminController';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { adminAudit } from '../middleware/adminAudit';

const router = Router();
const adminController = new AdminController();

const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
  },
});

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);
router.use(adminRateLimit);
router.use(adminAudit);

// Dashboard stats
/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCount:
 *                   type: integer
 *                 petCount:
 *                   type: integer
 *                 orderCount:
 *                   type: integer
 *                 scanCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 */
router.get('/stats', adminController.getDashboardStats);

// User management
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                   description: Total number of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 */
router.get('/users', adminController.getUsers);
router.put('/users/:id',
  [param('id').isMongoId(), body('role').optional().isIn(['user', 'admin']), body('isActive').optional().isBoolean()],
  handleValidationErrors,
  adminController.updateUser
);
router.delete('/users/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  adminController.deleteUser
);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the user
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 *       404:
 *         description: User not found
 */
router.get('/users/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  adminController.getUserById
);

// Pet management
/**
 * @swagger
 * /admin/pets:
 *   get:
 *     summary: Get all pets (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *         description: Filter by pet status
 *     responses:
 *       200:
 *         description: List of pets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pet'
 *                 total:
 *                   type: integer
 *                   description: Total number of pets
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 */
router.get('/pets', adminController.getPets);
router.get('/pets/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  adminController.getPetById
);
router.put('/pets/:id',
  [param('id').isMongoId(), body('name').optional().trim(), body('breed').optional().trim(), body('type').optional().trim(), body('status').optional().isIn(['active', 'inactive', 'pending'])],
  handleValidationErrors,
  adminController.updatePet
);
router.delete('/pets/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  adminController.deletePet
);

// Product management
router.get('/products', adminController.getProducts);
router.put('/products/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  adminController.updateProduct
);

// Tag management
router.get('/tags', adminController.getTags);
router.put('/tags/:id',
  [param('id').isMongoId(), body('status').optional().isIn(['active', 'inactive', 'pending']), body('isActive').optional().isBoolean()],
  handleValidationErrors,
  adminController.updateTag
);
router.delete('/tags/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  adminController.deleteTag
);

// Order management
/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, processing, shipped, delivered, cancelled]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 total:
 *                   type: integer
 *                   description: Total number of orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 */
router.get('/orders', adminController.getOrders);
router.get('/orders/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  adminController.getOrderById
);

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, processing, shipped, delivered, cancelled]
 *               trackingNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id/status',
  [
    param('id').isMongoId(),
    body('status').isIn(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']),
    body('trackingNumber').optional().trim(),
  ],
  handleValidationErrors,
  adminController.updateOrderStatus
);

// Analytics
/**
 * @swagger
 * /admin/analytics/scans:
 *   get:
 *     summary: Get scan analytics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Scan analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalScans:
 *                   type: integer
 *                   description: Total scans in period
 *                 scansByDay:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       count:
 *                         type: integer
 *                 successfulContacts:
 *                   type: integer
 *                   description: Number of successful owner contacts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 */
router.get('/analytics/scans', adminController.getScanAnalytics);

export default router;