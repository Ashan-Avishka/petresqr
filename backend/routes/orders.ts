// src/routes/orders.ts
import { Router } from 'express';
import { param } from 'express-validator';
import { OrderController } from '../controllers/OrderController';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authenticateToken);

// Get user's orders
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get authenticated user's orders
 *     tags: [Orders]
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
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: List of user's orders
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
 */
router.get('/', orderController.getOrders);

// Get specific order
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get details of a specific order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the order
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Order doesn't belong to user
 *       404:
 *         description: Order not found
 */
router.get('/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  orderController.getOrderById
);

// Cancel order
/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the order to cancel
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Order cannot be cancelled (wrong status)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Order doesn't belong to user
 *       404:
 *         description: Order not found
 */
router.post('/:id/cancel',
  [param('id').isMongoId()],
  handleValidationErrors,
  orderController.cancelOrder
);

export default router;