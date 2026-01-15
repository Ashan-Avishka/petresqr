// src/routes/foundPet.routes.ts
import express from 'express';
import { body, param } from 'express-validator';
import { foundPetController } from '../controllers/FoundPetController';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Found Pets
 *   description: Found pet reporting and management
 */

/**
 * @swagger
 * /foundPet/tag/{qrCode}:
 *   get:
 *     summary: Get pet information by tag QR code (public)
 *     tags: [Found Pets]
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         schema:
 *           type: string
 *         required: true
 *         description: QR code of the tag
 *     responses:
 *       200:
 *         description: Public pet information
 *       404:
 *         description: Tag or pet not found
 */
router.get(
  '/tag/:qrCode',
  [param('qrCode').trim().notEmpty().withMessage('QR code is required')],
  handleValidationErrors,
  foundPetController.getPetByTag
);

/**
 * @swagger
 * /foundPet/notify:
 *   post:
 *     summary: Notify pet owner with location and finder details
 *     tags: [Found Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCode
 *             properties:
 *               qrCode:
 *                 type: string
 *                 description: QR code of the tag
 *               finderContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               condition:
 *                 type: string
 *                 enum: [HEALTHY, INJURED, SICK, UNKNOWN]
 *               additionalNotes:
 *                 type: string
 */
router.post(
  '/notify',
  [
    body('qrCode').trim().notEmpty().withMessage('QR code is required'),
    body('finderContact.name').optional().trim().isLength({ max: 200 }),
    body('finderContact.phone').optional().trim().isLength({ max: 50 }),
    body('finderContact.email').optional().trim().isEmail(),
    body('location.address').optional().trim().isLength({ max: 500 }),
    body('location.latitude').optional().isNumeric(),
    body('location.longitude').optional().isNumeric(),
    body('condition')
      .optional()
      .isIn(['HEALTHY', 'INJURED', 'SICK', 'UNKNOWN']),
    body('additionalNotes').optional().trim().isLength({ max: 1000 }),
  ],
  handleValidationErrors,
  foundPetController.notifyOwner
);

export default router;