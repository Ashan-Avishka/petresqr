// src/routes/gallery.ts
import { Router } from 'express';
import { param } from 'express-validator';
import { GalleryController } from '../controllers/GalleryController';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();
const galleryController = new GalleryController();

/**
 * @swagger
 * /gallery:
 *   get:
 *     summary: Get public pet gallery
 *     tags: [Gallery]
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
 *         name: breed
 *         schema:
 *           type: string
 *         description: Filter pets by breed
 *     responses:
 *       200:
 *         description: List of public pet profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PublicPetProfile'
 *                 total:
 *                   type: integer
 *                   description: Total number of pets
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', galleryController.getGallery);

/**
 * @swagger
 * /gallery/{petId}:
 *   get:
 *     summary: Get public profile for a specific pet
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: petId
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the pet
 *     responses:
 *       200:
 *         description: Public pet profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicPetProfile'
 *       400:
 *         description: Invalid pet ID format
 *       404:
 *         description: Pet not found or not publicly visible
 */
router.get('/:petId',
  [param('petId').isMongoId()],
  handleValidationErrors,
  galleryController.getPublicPetProfile
);

export default router;