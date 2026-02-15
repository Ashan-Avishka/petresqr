// routes/tags.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import { TagController } from '../controllers/TagController';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const tagController = new TagController();

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags for the authenticated user
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authenticateToken,
  tagController.getUserTags.bind(tagController)
);

/**
 * @swagger
 * /tags/purchase:
 *   post:
 *     summary: Purchase a pet tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/purchase',
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

/**
 * @swagger
 * /tags/{tagId}/activate:
 *   post:
 *     summary: Activate a tag (first-time assigns QRCode, re-activation toggles isActive)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the tag
 */
router.post(
  '/:tagId/activate',
  authenticateToken,
  [param('tagId').isMongoId()],
  handleValidationErrors,
  tagController.activateTag.bind(tagController)
);

/**
 * @swagger
 * /tags/{tagId}/deactivate:
 *   post:
 *     summary: Deactivate a tag (sets isActive = false)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:tagId/deactivate',
  authenticateToken,
  [param('tagId').isMongoId()],
  handleValidationErrors,
  tagController.deactivateTag.bind(tagController)
);

/**
 * @swagger
 * /tags/{tagId}/assign:
 *   post:
 *     summary: Assign a tag to a pet
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:tagId/assign',
  authenticateToken,
  [
    param('tagId').isMongoId(),
    body('petId').isMongoId(),
  ],
  handleValidationErrors,
  tagController.assignTag.bind(tagController)
);

/**
 * @swagger
 * /tags/{tagId}/unassign:
 *   post:
 *     summary: Unassign a tag from its pet (sets pet status to inactive)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:tagId/unassign',
  authenticateToken,
  [param('tagId').isMongoId()],
  handleValidationErrors,
  tagController.unassignTag.bind(tagController)
);

/**
 * @swagger
 * /tags/{tagId}/qr:
 *   get:
 *     summary: Get QR code image for a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:tagId/qr',
  authenticateToken,
  [param('tagId').isMongoId()],
  handleValidationErrors,
  tagController.getQRCode.bind(tagController)
);

export default router;