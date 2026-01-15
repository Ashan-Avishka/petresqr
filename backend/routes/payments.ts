// src/routes/payments.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import { PaymentController } from '../controllers/PaymentController';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

// All payment routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /payments/create:
 *   post:
 *     summary: Create a payment and order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceId
 *               - items
 *               - shippingAddress
 *             properties:
 *               sourceId:
 *                 type: string
 *                 description: Payment token from Square Web Payments SDK
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     size:
 *                       type: string
 *                     color:
 *                       type: string
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - address
 *                   - city
 *                   - state
 *                   - zipCode
 *               billingDetails:
 *                 type: object
 *               petId:
 *                 type: string
 *               tagId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       400:
 *         description: Invalid payment data or payment failed
 *       401:
 *         description: Unauthorized
 */
router.post('/create',
  [
    body('sourceId').notEmpty().withMessage('Payment source is required'),
    body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
    body('shippingAddress').isObject().withMessage('Shipping address is required'),
    body('shippingAddress.address').notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode').notEmpty().withMessage('ZIP code is required'),
  ],
  handleValidationErrors,
  paymentController.createPayment.bind(paymentController)
);

/**
 * @swagger
 * /payments/{paymentId}:
 *   get:
 *     summary: Get payment details
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Square payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/:paymentId',
  [param('paymentId').notEmpty()],
  handleValidationErrors,
  paymentController.getPayment.bind(paymentController)
);

/**
 * @swagger
 * /payments/{orderId}/refund:
 *   post:
 *     summary: Refund a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for refund
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       400:
 *         description: Cannot process refund
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:orderId/refund',
  [
    param('orderId').isMongoId(),
    body('reason').optional().isString()
  ],
  handleValidationErrors,
  paymentController.refundPayment.bind(paymentController)
);

export default router;