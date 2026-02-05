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
 *               $ref: '#/components/schemas/Pet'
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
 *               - gender
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Pet's name
 *               type:
 *                 type: string
 *                 enum: [dog, cat, other]
 *                 default: dog
 *                 description: Type of pet
 *               breed:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Pet's breed
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 30
 *                 description: Pet's age in years
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 description: Pet's weight
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: Pet's gender
 *               color:
 *                 type: string
 *                 description: Pet's color/markings
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Pet's date of birth
 *               bio.description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: General description of the pet
 *               bio.microchipId:
 *                 type: string
 *                 maxLength: 50
 *                 description: Microchip ID number
 *               medical.allergies:
 *                 type: string
 *                 maxLength: 500
 *                 description: Known allergies
 *               medical.medications:
 *                 type: string
 *                 maxLength: 500
 *                 description: Current medications
 *               medical.conditions:
 *                 type: string
 *                 maxLength: 500
 *                 description: Medical conditions
 *               medical.vetName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Veterinarian name
 *               medical.vetPhone:
 *                 type: string
 *                 maxLength: 20
 *                 description: Veterinarian phone number
 *               other.favoriteFood:
 *                 type: string
 *                 maxLength: 200
 *                 description: Pet's favorite food
 *               other.behavior:
 *                 type: string
 *                 maxLength: 500
 *                 description: Behavioral notes
 *               other.specialNeeds:
 *                 type: string
 *                 maxLength: 500
 *                 description: Special needs or requirements
 *               story.content:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Pet's story or background
 *               story.location:
 *                 type: string
 *                 maxLength: 200
 *                 description: Location related to the story
 *               story.status:
 *                 type: string
 *                 enum: [protected, reunited, adopted, lost, found]
 *                 default: protected
 *                 description: Current status of the pet
 *               tagId:
 *                 type: string
 *                 description: MongoDB ID of the tag to assign
 *               gallery:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to display pet in public gallery
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Pet's photo
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
    body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name is required and must be 1-50 characters'),
    body('type').optional().isIn(['dog', 'cat', 'other']).withMessage('Type must be dog, cat, or other'),
    body('breed').trim().isLength({ min: 1, max: 50 }).withMessage('Breed is required and must be 1-50 characters'),
    body('age').isInt({ min: 0, max: 30 }).withMessage('Age must be between 0 and 30'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
    body('color').optional().isString().isLength({ max: 100 }).withMessage('Color too long'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    
    // Bio validations
    body('bio.description').optional().isString().isLength({ max: 1000 }).withMessage('Bio description too long'),
    body('bio.microchipId').optional().isString().isLength({ max: 50 }).withMessage('Microchip ID too long'),
    
    // Medical validations
    body('medical.allergies').optional().isString().isLength({ max: 500 }).withMessage('Allergies text too long'),
    body('medical.medications').optional().isString().isLength({ max: 500 }).withMessage('Medications text too long'),
    body('medical.conditions').optional().isString().isLength({ max: 500 }).withMessage('Conditions text too long'),
    body('medical.vetName').optional().isString().isLength({ max: 100 }).withMessage('Vet name too long'),
    body('medical.vetPhone').optional().isString().isLength({ max: 20 }).withMessage('Vet phone too long'),
    
    // Other validations
    body('other.favoriteFood').optional().isString().isLength({ max: 200 }).withMessage('Favorite food too long'),
    body('other.behavior').optional().isString().isLength({ max: 500 }).withMessage('Behavior text too long'),
    body('other.specialNeeds').optional().isString().isLength({ max: 500 }).withMessage('Special needs too long'),
    
    // Story validations
    body('story.content').optional().isString().isLength({ max: 2000 }).withMessage('Story content too long'),
    body('story.location').optional().isString().isLength({ max: 200 }).withMessage('Location too long'),
    body('story.status').optional().isIn(['protected', 'reunited', 'adopted', 'lost', 'found']).withMessage('Invalid story status'),
    
    body('tagId').optional().isMongoId().withMessage('Invalid tag ID'),
    body('gallery').optional().isBoolean().withMessage('Gallery must be a boolean'),
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
 *               type:
 *                 type: string
 *                 enum: [dog, cat, other]
 *               breed:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 30
 *               weight:
 *                 type: number
 *                 minimum: 0
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               color:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               bio.description:
 *                 type: string
 *                 maxLength: 1000
 *               bio.microchipId:
 *                 type: string
 *                 maxLength: 50
 *               medical.allergies:
 *                 type: string
 *                 maxLength: 500
 *               medical.medications:
 *                 type: string
 *                 maxLength: 500
 *               medical.conditions:
 *                 type: string
 *                 maxLength: 500
 *               medical.vetName:
 *                 type: string
 *                 maxLength: 100
 *               medical.vetPhone:
 *                 type: string
 *                 maxLength: 20
 *               other.favoriteFood:
 *                 type: string
 *                 maxLength: 200
 *               other.behavior:
 *                 type: string
 *                 maxLength: 500
 *               other.specialNeeds:
 *                 type: string
 *                 maxLength: 500
 *               story.content:
 *                 type: string
 *                 maxLength: 2000
 *               story.location:
 *                 type: string
 *                 maxLength: 200
 *               story.status:
 *                 type: string
 *                 enum: [protected, reunited, adopted, lost, found]
 *               tagId:
 *                 type: string
 *                 description: MongoDB ID of the tag (or null to remove tag)
 *               gallery:
 *                 type: boolean
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
    body('type').optional().isIn(['dog', 'cat', 'other']),
    body('breed').optional().trim().isLength({ min: 1, max: 50 }),
    body('age').optional().isInt({ min: 0, max: 30 }),
    body('weight').optional().isFloat({ min: 0 }),
    body('gender').optional().isIn(['male', 'female']),
    body('color').optional().isString().isLength({ max: 100 }),
    body('dateOfBirth').optional().isISO8601(),
    
    // Bio validations
    body('bio.description').optional().isString().isLength({ max: 1000 }),
    body('bio.microchipId').optional().isString().isLength({ max: 50 }),
    
    // Medical validations
    body('medical.allergies').optional().isString().isLength({ max: 500 }),
    body('medical.medications').optional().isString().isLength({ max: 500 }),
    body('medical.conditions').optional().isString().isLength({ max: 500 }),
    body('medical.vetName').optional().isString().isLength({ max: 100 }),
    body('medical.vetPhone').optional().isString().isLength({ max: 20 }),
    
    // Other validations
    body('other.favoriteFood').optional().isString().isLength({ max: 200 }),
    body('other.behavior').optional().isString().isLength({ max: 500 }),
    body('other.specialNeeds').optional().isString().isLength({ max: 500 }),
    
    // Story validations
    body('story.content').optional().isString().isLength({ max: 2000 }),
    body('story.location').optional().isString().isLength({ max: 200 }),
    body('story.status').optional().isIn(['protected', 'reunited', 'adopted', 'lost', 'found']),
    
    body('tagId').optional({ nullable: true }).custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) return true;
      throw new Error('Invalid tag ID');
    }),
    body('gallery').optional().isBoolean().withMessage('Gallery must be a boolean'),
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