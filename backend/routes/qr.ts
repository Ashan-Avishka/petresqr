
// src/routes/qr.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import { QRController } from '../controllers/QRController';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();
const qrController = new QRController();

// Public QR scan endpoint
/**
 * @swagger
 * /qr/{qrCode}:
 *   get:
 *     summary: Scan a QR code (public endpoint)
 *     tags: [QR]
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         schema:
 *           type: string
 *         required: true
 *         description: QR code identifier
 *     responses:
 *       200:
 *         description: QR code scanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pet:
 *                   $ref: '#/components/schemas/Pet'
 *                 ownerContactAllowed:
 *                   type: boolean
 *       404:
 *         description: QR code not found
 */
router.get('/:qrCode',
  [param('qrCode').notEmpty()],
  handleValidationErrors,
  qrController.scanQR
);

// Contact owner via QR scan
/**
 * @swagger
 * /qr/{qrCode}/contact:
 *   post:
 *     summary: Contact pet owner via QR scan (public endpoint)
 *     tags: [QR]
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         schema:
 *           type: string
 *         required: true
 *         description: QR code identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - finderName
 *               - finderPhone
 *             properties:
 *               finderName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               finderPhone:
 *                 type: string
 *               message:
 *                 type: string
 *                 maxLength: 500
 *               location:
 *                 type: string
 *                 maxLength: 200
 *               scanId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact message sent successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: QR code not found
 */
router.post('/:qrCode/contact',
  [
    param('qrCode').notEmpty(),
    body('finderName').trim().isLength({ min: 1, max: 100 }),
    body('finderPhone').isMobilePhone('any'),
    body('message').optional().isLength({ max: 500 }),
    body('location').optional().isLength({ max: 200 }),
    body('scanId').optional().isMongoId(),
  ],
  handleValidationErrors,
  qrController.contactOwner
);

export default router;