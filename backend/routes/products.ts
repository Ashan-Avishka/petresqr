// src/routes/products.ts
import { Router } from 'express';
import { param, query } from 'express-validator';
import { ProductController } from '../controllers/ProductController';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();
const productController = new ProductController();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [tag, accessory, bundle, merchandise]
 *       - in: query
 *         name: petCategory
 *         schema:
 *           type: string
 *           enum: [dogs, cats, others]
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [in_stock, out_of_stock, pre_order, discontinued]
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: badge
 *         schema:
 *           type: string
 *           enum: [bestseller, new, sale, limited]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *     responses:
 *       200:
 *         description: List of featured products
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @swagger
 * /products/bestsellers:
 *   get:
 *     summary: Get bestselling products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *     responses:
 *       200:
 *         description: List of bestselling products
 */
router.get('/bestsellers', productController.getBestSellers);

/**
 * @swagger
 * /products/categories:
 *   get:
 *     summary: Get product categories with counts
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', productController.getProductCategories);

/**
 * @swagger
 * /products/pet-categories:
 *   get:
 *     summary: Get pet categories with counts
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of pet categories
 */
router.get('/pet-categories', productController.getPetCategories);

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [tag, accessory, bundle, merchandise]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of products in category
 */
router.get('/category/:category',
  [param('category').isIn(['tag', 'accessory', 'bundle', 'merchandise'])],
  handleValidationErrors,
  productController.getProductsByCategory
);

/**
 * @swagger
 * /products/pet-category/{petCategory}:
 *   get:
 *     summary: Get products by pet category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: petCategory
 *         required: true
 *         schema:
 *           type: string
 *           enum: [dogs, cats, others]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of products for pet category
 */
router.get('/pet-category/:petCategory',
  [param('petCategory').isIn(['dogs', 'cats', 'others'])],
  handleValidationErrors,
  productController.getProductsByPetCategory
);

/**
 * @swagger
 * /products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/slug/:slug',
  [param('slug').isString().trim().notEmpty()],
  handleValidationErrors,
  productController.getProductBySlug
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id',
  [param('id').isMongoId()],
  handleValidationErrors,
  productController.getProductById
);

/**
 * @swagger
 * /products/{id}/related:
 *   get:
 *     summary: Get related products
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *     responses:
 *       200:
 *         description: List of related products
 */
router.get('/:id/related',
  [
    param('id').isMongoId(),
    query('limit').optional().isInt({ min: 1, max: 20 }),
  ],
  handleValidationErrors,
  productController.getRelatedProducts
);

/**
 * @swagger
 * /products/{productId}/stock:
 *   get:
 *     summary: Check product stock availability
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Stock availability info
 */
router.get('/:productId/stock',
  [
    param('productId').isMongoId(),
    query('quantity').optional().isInt({ min: 1 }),
  ],
  handleValidationErrors,
  productController.checkStock
);

export default router;