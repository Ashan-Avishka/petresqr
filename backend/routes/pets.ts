// src/routes/pets.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import { PetController } from '../controllers/PetController';
import { handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const petController = new PetController();

// Public route - Get gallery pets (no authentication required)
/**
 * @swagger
 * /pets/gallery:
 *   get:
 *     summary: Get all pets in the public gallery
 *     tags: [Pets]
 *     responses:
 *       200:
 *         description: List of gallery pets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pet'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/gallery', petController.getGalleryPets);

/**
 * @swagger
 * /pets/gallery/{id}:
 *   get:
 *     summary: Get a specific pet from the public gallery
 *     tags: [Pets]
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
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 breed:
 *                   type: string
 *                 age:
 *                   type: string
 *                 weight:
 *                   type: number
 *                 gender:
 *                   type: string
 *                 color:
 *                   type: string
 *                 image:
 *                   type: string
 *                 bio:
 *                   type: object
 *                 story:
 *                   type: object
 *                 createdAt:
 *                   type: string
 *       404:
 *         description: Pet not found
 */
router.get('/gallery/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  petController.getGalleryPetById
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
 *               gallery:
 *                 type: boolean
 *                 description: Whether to display pet in public gallery
 *               story:
 *                 type: object
 *                 properties:
 *                   content:
 *                     type: string
 *                     maxLength: 2000
 *                   location:
 *                     type: string
 *                     maxLength: 200
 *                   status:
 *                     type: string
 *                     enum: [protected, reunited, adopted, lost, found]
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
    body('gallery').optional().isBoolean().withMessage('Gallery must be a boolean'),
    body('story.content').optional().isString().isLength({ max: 2000 }).withMessage('Story content too long'),
    body('story.location').optional().isString().isLength({ max: 200 }).withMessage('Location too long'),
    body('story.status').optional().isIn(['protected', 'reunited', 'adopted', 'lost', 'found']).withMessage('Invalid story status'),
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
 *               gallery:
 *                 type: boolean
 *                 description: Whether to display pet in public gallery
 *               story:
 *                 type: object
 *                 properties:
 *                   content:
 *                     type: string
 *                     maxLength: 2000
 *                   location:
 *                     type: string
 *                     maxLength: 200
 *                   status:
 *                     type: string
 *                     enum: [protected, reunited, adopted, lost, found]
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
      if (value === null || value === '') return true;
      if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) return true;
      throw new Error('Invalid tag ID');
    }),
    body('gallery').optional().isBoolean().withMessage('Gallery must be a boolean'),
    body('story.content').optional().isString().isLength({ max: 2000 }).withMessage('Story content too long'),
    body('story.location').optional().isString().isLength({ max: 200 }).withMessage('Location too long'),
    body('story.status').optional().isIn(['protected', 'reunited', 'adopted', 'lost', 'found']).withMessage('Invalid story status'),
  ],
  handleValidationErrors,
  petController.updatePet
);

// Toggle gallery status
/**
 * @swagger
 * /pets/{id}/gallery:
 *   patch:
 *     summary: Toggle pet's gallery visibility
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gallery
 *             properties:
 *               gallery:
 *                 type: boolean
 *                 description: Whether to show pet in public gallery
 *     responses:
 *       200:
 *         description: Gallery status updated successfully
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
router.patch('/:id/gallery',
  [
    param('id').isMongoId(),
    body('gallery').isBoolean().withMessage('Gallery must be a boolean'),
  ],
  handleValidationErrors,
  petController.toggleGallery
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
 *       200:
 *         description: Pet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *             required:
 *               - photo
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