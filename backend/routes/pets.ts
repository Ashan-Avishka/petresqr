// src/routes/pets.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import { PetController } from '../controllers/PetController';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const petController = new PetController();

// Public route - Get pet by tag QR code (no auth required)
/**
 * @swagger
 * /pets/tag/{qrCode}:
 *   get:
 *     summary: Get pet information by tag QR code (public)
 *     tags: [Pets]
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
router.get('/tag/:qrCode',
  [param('qrCode').trim().notEmpty()],
  handleValidationErrors,
  petController.getPetByTag
);

// All other pet routes require authentication
router.use(authenticateToken);

// Get all pets for authenticated user
/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Get all pets for authenticated user
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 *       401:
 *         description: Unauthorized
 */
router.get('/', petController.getPets);

// Get specific pet
/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Get a specific pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the pet
 *     responses:
 *       200:
 *         description: Pet data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       404:
 *         description: Pet not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  petController.getPetById
);

// Create new pet
/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Create a new pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - breed
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               breed:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 30
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               medicalConditions:
 *                 type: string
 *                 maxLength: 500
 *               tagId:
 *                 type: string
 *                 description: MongoDB ID of the tag to assign
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Pet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/',
  upload.single('photo'),
  [
    body('name').trim().isLength({ min: 1, max: 50 }),
    body('breed').trim().isLength({ min: 1, max: 50 }),
    body('age').isInt({ min: 0, max: 30 }),
    body('dateOfBirth').optional().isISO8601(),
    body('medicalConditions').optional().isLength({ max: 500 }),
    body('tagId').optional().isMongoId().withMessage('Invalid tag ID'),
  ],
  handleValidationErrors,
  petController.createPet
);

// Update pet
/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Update a pet's information
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the pet to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               breed:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 30
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               medicalConditions:
 *                 type: string
 *                 maxLength: 500
 *               tagId:
 *                 type: string
 *                 description: MongoDB ID of the tag (or null to remove tag)
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Pet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet not found
 */
router.put('/:id',
  upload.single('photo'),
  [
    param('id').isMongoId(),
    body('name').optional().trim().isLength({ min: 1, max: 50 }),
    body('breed').optional().trim().isLength({ min: 1, max: 50 }),
    body('age').optional().isInt({ min: 0, max: 30 }),
    body('dateOfBirth').optional().isISO8601(),
    body('medicalConditions').optional().isLength({ max: 500 }),
    body('tagId').optional({ nullable: true }).custom((value) => {
      // Allow null, empty string, or valid MongoId
      if (value === null || value === '') return true;
      if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) return true;
      throw new Error('Invalid tag ID');
    }),
  ],
  handleValidationErrors,
  petController.updatePet
);

// Delete pet
/**
 * @swagger
 * /pets/{id}:
 *   delete:
 *     summary: Delete a pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the pet to delete
 *     responses:
 *       204:
 *         description: Pet deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet not found
 */
router.delete('/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  petController.deletePet
);

// Upload pet photo
/**
 * @swagger
 * /pets/{id}/upload-photo:
 *   post:
 *     summary: Upload a photo for a pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the pet
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: The pet's photo to upload
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Invalid input or no photo provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet not found
 */
router.post('/:id/upload-photo',
  upload.single('photo'),
  [param('id').isMongoId()],
  handleValidationErrors,
  petController.uploadPhoto
);

export default router;