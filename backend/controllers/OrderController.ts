// src/controllers/OrderController.ts
import { Response } from 'express';
import { Order } from '../models/Order';
import { Tag } from '../models/Tag';
import { Product } from '../models/Product';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { getPaginationOptions, createPaginationResult } from '../utils/pagination';

export class OrderController {
  /**
   * Get all orders for the authenticated user
   */
  async getOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      const statusFilter = req.query.status ? { status: req.query.status } : {};

      const [orders, total] = await Promise.all([
        Order.find({ userId: req.userId, ...statusFilter })
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .populate('petId', 'name breed photoUrl')
          .populate('tagId', 'qrCode status activatedAt')
          .lean(),
        Order.countDocuments({ userId: req.userId, ...statusFilter })
      ]);

      const pagination = createPaginationResult(page, limit, total);

      sendSuccess(res, orders, 200, pagination);
    } catch (error) {
      console.error('Get orders error:', error);
      sendError(res, 'Failed to fetch orders', 500, 'FETCH_ORDERS_ERROR');
    }
  }

  /**
   * Get a specific order by ID
   */
  async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.userId,
      })
        .populate('petId', 'name breed photoUrl')
        .populate('tagId', 'qrCode status activatedAt')
        .populate('items.productId', 'name images sku');

      if (!order) {
        sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
        return;
      }

      sendSuccess(res, order);
    } catch (error) {
      console.error('Get order error:', error);
      sendError(res, 'Failed to fetch order', 500, 'FETCH_ORDER_ERROR');
    }
  }

  /**
   * Create a new order
   */
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { items, shippingAddress, paymentMethod, petId, tagId } = req.body;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        sendError(res, 'Order must contain at least one item', 400, 'INVALID_ITEMS');
        return;
      }

      if (!shippingAddress) {
        sendError(res, 'Shipping address is required', 400, 'MISSING_ADDRESS');
        return;
      }

      // Fetch product details and validate stock
      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          sendError(res, `Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
          return;
        }

        if (!product.isActive) {
          sendError(res, `Product ${product.name} is not available`, 400, 'PRODUCT_INACTIVE');
          return;
        }

        if (product.availability === 'out_of_stock') {
          sendError(res, `Product ${product.name} is out of stock`, 400, 'OUT_OF_STOCK');
          return;
        }

        if (product.stock !== undefined && product.stock < item.quantity) {
          sendError(res, `Insufficient stock for ${product.name}`, 400, 'INSUFFICIENT_STOCK');
          return;
        }

        // Validate size and color if provided
        if (item.size && product.availableSizes && !product.availableSizes.includes(item.size)) {
          sendError(res, `Invalid size for ${product.name}`, 400, 'INVALID_SIZE');
          return;
        }

        if (item.color && product.availableColors) {
          const colorExists = product.availableColors.some(c => c.name === item.color);
          if (!colorExists) {
            sendError(res, `Invalid color for ${product.name}`, 400, 'INVALID_COLOR');
            return;
          }
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images && product.images.length > 0 ? product.images[0].url : undefined,
          sku: product.sku,
          size: item.size,
          color: item.color,
        });

        // Update product stock
        if (product.stock !== undefined) {
          product.stock -= item.quantity;
          await product.save();
        }
      }

      // Calculate shipping and tax
      const shipping = subtotal > 50 ? 0 : 10.00;
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + shipping + tax;

      // Create the order
      const order = await Order.create({
        userId: req.userId,
        items: orderItems,
        status: 'pending',
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        currency: 'USD',
        shippingAddress,
        paymentMethod,
        petId,
        tagId,
      });

      const populatedOrder = await Order.findById(order._id)
        .populate('petId', 'name breed photoUrl')
        .populate('tagId', 'qrCode status');

      sendSuccess(res, populatedOrder, 201);
    } catch (error) {
      console.error('Create order error:', error);
      sendError(res, 'Failed to create order', 500, 'CREATE_ORDER_ERROR');
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!order) {
        sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
        return;
      }

      if (!['pending', 'paid'].includes(order.status)) {
        sendError(res, 'Order cannot be cancelled', 400, 'CANNOT_CANCEL');
        return;
      }

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );
      }

      // Update order status
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();

      // Deactivate associated tags
      if (order.tagId) {
        await Tag.findByIdAndUpdate(order.tagId, {
          status: 'inactive',
          isActive: false,
        });
      }

      const populatedOrder = await Order.findById(order._id)
        .populate('petId', 'name breed photoUrl')
        .populate('tagId', 'qrCode status activatedAt');

      sendSuccess(res, {
        message: 'Order cancelled successfully',
        order: populatedOrder?.toJSON(),
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      sendError(res, 'Failed to cancel order', 500, 'CANCEL_ORDER_ERROR');
    }
  }

  /**
   * Get order statistics for the user
   */
  async getOrderStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await Order.aggregate([
        { $match: { userId: req.userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' },
          },
        },
      ]);

      const totalOrders = await Order.countDocuments({ userId: req.userId });
      const totalSpent = await Order.aggregate([
        { 
          $match: { 
            userId: req.userId, 
            status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]);

      sendSuccess(res, {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        byStatus: stats,
      });
    } catch (error) {
      console.error('Get order stats error:', error);
      sendError(res, 'Failed to fetch order statistics', 500, 'FETCH_STATS_ERROR');
    }
  }
}