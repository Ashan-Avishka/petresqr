// src/controllers/ProductController.ts
import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { sendSuccess, sendError } from '../utils/response';
import { getPaginationOptions, createPaginationResult } from '../utils/pagination';

export class ProductController {
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      // Build filters
      const filters: any = { isActive: true };

      if (req.query.category) {
        filters.category = req.query.category;
      }

      if (req.query.petCategory) {
        filters.petCategory = req.query.petCategory;
      }

      if (req.query.availability) {
        filters.availability = req.query.availability;
      }

      if (req.query.featured === 'true') {
        filters.isFeatured = true;
      }

      if (req.query.badge) {
        filters.badge = req.query.badge;
      }

      // Price range filter
      if (req.query.minPrice || req.query.maxPrice) {
        filters.price = {};
        if (req.query.minPrice) {
          filters.price.$gte = parseFloat(req.query.minPrice as string);
        }
        if (req.query.maxPrice) {
          filters.price.$lte = parseFloat(req.query.maxPrice as string);
        }
      }

      // Rating filter
      if (req.query.minRating) {
        filters.rating = { $gte: parseFloat(req.query.minRating as string) };
      }

      // Search filter
      if (req.query.search) {
        filters.$text = { $search: req.query.search as string };
      }

      // DEBUG: Log the filters being used
      console.log('🔍 Query filters:', JSON.stringify(filters, null, 2));
      console.log('📊 Pagination:', { page, limit, skip, sortBy, sortOrder });

      // DEBUG: Check total count without isActive filter
      const totalAllProducts = await Product.countDocuments({});
      const totalActiveProducts = await Product.countDocuments({ isActive: true });
      console.log('📈 Total products in DB:', totalAllProducts);
      console.log('✅ Active products in DB:', totalActiveProducts);

      const [products, total] = await Promise.all([
        Product.find(filters)
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(filters)
      ]);

      console.log('🎯 Products found with filters:', products.length);
      console.log('📦 Total matching documents:', total);

      // DEBUG: If no products found, try without isActive filter
      if (products.length === 0) {
        const anyProducts = await Product.find({}).limit(5).lean();
        console.log('🔎 Sample products (any status):', anyProducts);
      }

      const pagination = createPaginationResult(page, limit, total);

      sendSuccess(res, products, 200, pagination);
    } catch (error) {
      console.error('Get products error:', error);
      sendError(res, 'Failed to fetch products', 500, 'FETCH_PRODUCTS_ERROR');
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 Looking for product ID:', req.params.id);
      
      const product = await Product.findOne({
        _id: req.params.id,
        isActive: true,
      });

      if (!product) {
        // DEBUG: Check if product exists but is inactive
        const inactiveProduct = await Product.findById(req.params.id);
        if (inactiveProduct) {
          console.log('⚠️ Product exists but isActive =', inactiveProduct.isActive);
        } else {
          console.log('❌ Product not found in database');
        }
        
        sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
        return;
      }

      console.log('✅ Product found:', product._id);
      sendSuccess(res, product);
    } catch (error) {
      console.error('Get product error:', error);
      sendError(res, 'Failed to fetch product', 500, 'FETCH_PRODUCT_ERROR');
    }
  }

  async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      console.log('🔍 Looking for product slug:', slug);
      
      const product = await Product.findOne({
        slug,
        isActive: true,
      });

      if (!product) {
        console.log('❌ Product not found with slug:', slug);
        sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
        return;
      }

      console.log('✅ Product found:', product._id);
      sendSuccess(res, product);
    } catch (error) {
      console.error('Get product by slug error:', error);
      sendError(res, 'Failed to fetch product', 500, 'FETCH_PRODUCT_ERROR');
    }
  }

  async getFeaturedProducts(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;

      console.log('🌟 Fetching featured products, limit:', limit);

      const products = await Product.find({
        isActive: true,
        isFeatured: true,
      })
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      console.log('📦 Featured products found:', products.length);

      sendSuccess(res, products);
    } catch (error) {
      console.error('Get featured products error:', error);
      sendError(res, 'Failed to fetch featured products', 500, 'FETCH_FEATURED_ERROR');
    }
  }

  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      console.log('🏷️ Fetching products for category:', category);

      const [products, total] = await Promise.all([
        Product.find({ category, isActive: true })
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments({ category, isActive: true })
      ]);

      console.log('📦 Products found:', products.length);

      const pagination = createPaginationResult(page, limit, total);

      sendSuccess(res, products, 200, pagination);
    } catch (error) {
      console.error('Get products by category error:', error);
      sendError(res, 'Failed to fetch products', 500, 'FETCH_CATEGORY_ERROR');
    }
  }

  async getProductsByPetCategory(req: Request, res: Response): Promise<void> {
    try {
      const { petCategory } = req.params;
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      console.log('🐾 Fetching products for pet category:', petCategory);

      const [products, total] = await Promise.all([
        Product.find({ petCategory, isActive: true })
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments({ petCategory, isActive: true })
      ]);

      console.log('📦 Products found:', products.length);

      const pagination = createPaginationResult(page, limit, total);

      sendSuccess(res, products, 200, pagination);
    } catch (error) {
      console.error('Get products by pet category error:', error);
      sendError(res, 'Failed to fetch products', 500, 'FETCH_PET_CATEGORY_ERROR');
    }
  }

  async getProductCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            avgRating: { $avg: '$rating' },
          }
        },
        { $sort: { _id: 1 } }
      ]);

      console.log('📂 Categories found:', categories);

      sendSuccess(res, categories);
    } catch (error) {
      console.error('Get categories error:', error);
      sendError(res, 'Failed to fetch categories', 500, 'FETCH_CATEGORIES_ERROR');
    }
  }

  async getPetCategories(req: Request, res: Response): Promise<void> {
    try {
      const petCategories = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$petCategory',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
          }
        },
        { $sort: { _id: 1 } }
      ]);

      console.log('🐾 Pet categories found:', petCategories);

      sendSuccess(res, petCategories);
    } catch (error) {
      console.error('Get pet categories error:', error);
      sendError(res, 'Failed to fetch pet categories', 500, 'FETCH_PET_CATEGORIES_ERROR');
    }
  }

  async getBestSellers(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;

      console.log('🏆 Fetching bestsellers, limit:', limit);

      const products = await Product.find({
        isActive: true,
        badge: 'bestseller',
      })
        .limit(limit)
        .sort({ rating: -1, reviews: -1 })
        .lean();

      console.log('📦 Bestsellers found:', products.length);

      sendSuccess(res, products);
    } catch (error) {
      console.error('Get bestsellers error:', error);
      sendError(res, 'Failed to fetch bestsellers', 500, 'FETCH_BESTSELLERS_ERROR');
    }
  }

  async getRelatedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;

      console.log('🔗 Fetching related products for:', id);

      // First, get the current product
      const currentProduct = await Product.findById(id);
      
      if (!currentProduct) {
        sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
        return;
      }

      // Find related products (same category, excluding current product)
      const products = await Product.find({
        _id: { $ne: id },
        category: currentProduct.category,
        isActive: true,
      })
        .limit(limit)
        .sort({ rating: -1, reviews: -1 })
        .lean();

      console.log('📦 Related products found:', products.length);

      sendSuccess(res, products);
    } catch (error) {
      console.error('Get related products error:', error);
      sendError(res, 'Failed to fetch related products', 500, 'FETCH_RELATED_ERROR');
    }
  }

  async checkStock(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { quantity } = req.query;

      const product = await Product.findOne({
        _id: productId,
        isActive: true,
      });

      if (!product) {
        sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
        return;
      }

      const requestedQty = quantity ? parseInt(quantity as string) : 1;
      const isAvailable = product.availability === 'in_stock' && 
                         (product.stock || 0) >= requestedQty;

      sendSuccess(res, {
        available: isAvailable,
        stock: product.stock || 0,
        availability: product.availability,
      });
    } catch (error) {
      console.error('Check stock error:', error);
      sendError(res, 'Failed to check stock', 500, 'CHECK_STOCK_ERROR');
    }
  }
}