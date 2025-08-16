// src/controllers/OrderController.ts
import { Response } from 'express';
import { Order } from '../models/Order';
import { Tag } from '../models/Tag';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { getPaginationOptions, createPaginationResult } from '../utils/pagination';

export class OrderController {
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
          .populate('tagId', 'qrCode status')
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

  async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.userId,
      })
        .populate('petId', 'name breed photoUrl')
        .populate('tagId', 'qrCode status activatedAt');

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

      sendSuccess(res, {
        message: 'Order cancelled successfully',
        order: order.toJSON(),
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      sendError(res, 'Failed to cancel order', 500, 'CANCEL_ORDER_ERROR');
    }
  }
}
