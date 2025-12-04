// Updated routes/tags.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import { TagController } from '../controllers/TagController';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const tagController = new TagController();

// Get all tags for authenticated user
/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags for the authenticated user
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 *                 totalTags:
 *                   type: integer
 *                 activeCount:
 *                   type: integer
 *                 pendingCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  authenticateToken,
  tagController.getUserTags.bind(tagController)
);

// Purchase tag (requires authentication)
/**
 * @swagger
 * /tags/purchase:
 *   post:
 *     summary: Purchase a pet tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - shippingAddress
 *             properties:
 *               petId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                 properties:
 *                   street:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 200
 *                   city:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 100
 *                   state:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 100
 *                   zipCode:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 20
 *                   country:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 100
 *     responses:
 *       201:
 *         description: Tag purchase initiated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet not found
 */
router.post('/purchase',
  authenticateToken,
  [
    body('petId').isMongoId(),
    body('quantity').optional().isInt({ min: 1, max: 5 }).toInt(),
    body('shippingAddress.street').trim().isLength({ min: 1, max: 200 }),
    body('shippingAddress.city').trim().isLength({ min: 1, max: 100 }),
    body('shippingAddress.state').trim().isLength({ min: 1, max: 100 }),
    body('shippingAddress.zipCode').trim().isLength({ min: 1, max: 20 }),
    body('shippingAddress.country').optional().trim().isLength({ min: 1, max: 100 }),
  ],
  handleValidationErrors,
  tagController.purchaseTag.bind(tagController)
);

// Activate tag
/**
 * @swagger
 * /tags/activate:
 *   post:
 *     summary: Activate a purchased pet tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagCode
 *               - petId
 *             properties:
 *               tagCode:
 *                 type: string
 *                 description: The unique code from the physical tag
 *                 example: "TAG123456789"
 *               petId:
 *                 type: string
 *                 description: MongoDB ID of the pet to associate with this tag
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Tag activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag or pet not found
 *       409:
 *         description: Tag already activated or assigned to another pet
 */
router.post('/activate',
  authenticateToken,
  [
    body('tagCode').notEmpty(),
    body('petId').isMongoId(),
  ],
  handleValidationErrors,
  tagController.activateTag.bind(tagController)
);

// Get QR code image
/**
 * @swagger
 * /tags/{tagId}/qr:
 *   get:
 *     summary: Get QR code image for a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the tag
 *     responses:
 *       200:
 *         description: QR code image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid tag ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to access this tag
 *       404:
 *         description: Tag not found
 */
router.get('/:tagId/qr',
  authenticateToken,
  [param('tagId').isMongoId()],
  handleValidationErrors,
  tagController.getQRCode.bind(tagController)
);

export default router;