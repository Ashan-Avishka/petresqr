// src/controllers/AdminController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Pet } from '../models/Pet';
import { Order } from '../models/Order';
import { ScanLog } from '../models/ScanLog';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';
import { getPaginationOptions, createPaginationResult } from '../utils/pagination';
import { sendSMS } from '../config/twilio';
import { sendEmail, emailTemplates } from '../utils/email';

export class AdminController {
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        totalPets,
        totalOrders,
        totalScans,
        revenueThisMonth,
        activeUsers,
        activePets,
        recentOrders
      ] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Pet.countDocuments({ isActive: true }),
        Order.countDocuments(),
        ScanLog.countDocuments(),
        Order.aggregate([
          {
            $match: {
              status: { $in: ['paid', 'delivered'] },
              createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]).then(result => result[0]?.total || 0),
        User.countDocuments({
          isActive: true,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        Pet.countDocuments({ 
          isActive: true, 
          status: 'active',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'firstName lastName email')
          .populate('petId', 'name breed')
          .lean()
      ]);

      sendSuccess(res, {
        totalUsers,
        totalPets,
        totalOrders,
        totalScans,
        revenueThisMonth,
        activeUsers,
        activePets,
        recentOrders,
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      sendError(res, 'Failed to fetch dashboard stats', 500, 'DASHBOARD_STATS_ERROR');
    }
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      const search = req.query.search as string;
      let filter: any = {};

      if (search) {
        filter.$or = [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter)
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(filter)
      ]);

      const pagination = createPaginationResult(page, limit, total);

      sendSuccess(res, users, 200, pagination);
    } catch (error) {
      console.error('Get users error:', error);
      sendError(res, 'Failed to fetch users', 500, 'FETCH_USERS_ERROR');
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
        return;
      }

      // Get user's pets and orders
      const [pets, orders] = await Promise.all([
        Pet.find({ ownerId: user._id }).populate('tagId'),
        Order.find({ userId: user._id }).populate('petId').populate('tagId')
      ]);

      sendSuccess(res, {
        user: user.toJSON(),
        pets,
        orders,
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      sendError(res, 'Failed to fetch user', 500, 'FETCH_USER_ERROR');
    }
  }

  async getPets(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      const status = req.query.status as string;
      let filter: any = { isActive: true };

      if (status) {
        filter.status = status;
      }

      const [pets, total] = await Promise.all([
        Pet.find(filter)
          .populate('ownerId', 'firstName lastName email')
          .populate('tagId', 'qrCode status')
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Pet.countDocuments(filter)
      ]);

      const pagination = createPaginationResult(page, limit, total);

      sendSuccess(res, pets, 200, pagination);
    } catch (error) {
      console.error('Get pets error:', error);
      sendError(res, 'Failed to fetch pets', 500, 'FETCH_PETS_ERROR');
    }
  }

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      const status = req.query.status as string;
      let filter: any = {};

      if (status) {
        filter.status = status;
      }

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('userId', 'firstName lastName email phone')
          .populate('petId', 'name breed photoUrl')
          .populate('tagId', 'qrCode status')
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(filter)
      ]);

      const pagination = createPaginationResult(page, limit, total);

      sendSuccess(res, orders, 200, pagination);
    } catch (error) {
      console.error('Get orders error:', error);
      sendError(res, 'Failed to fetch orders', 500, 'FETCH_ORDERS_ERROR');
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, trackingNumber } = req.body;
      
      const order = await Order.findById(req.params.id)
        .populate('userId')
        .populate('petId');

      if (!order) {
        sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
        return;
      }

      const oldStatus = order.status;
      order.status = status;
      
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }

      // Set status timestamps
      switch (status) {
        case 'shipped':
          order.shippedAt = new Date();
          break;
        case 'delivered':
          order.deliveredAt = new Date();
          break;
        case 'cancelled':
          order.cancelledAt = new Date();
          break;
      }

      await order.save();

      // Send notifications on status change
      if (oldStatus !== status && ['shipped', 'delivered'].includes(status)) {
        await this.sendOrderStatusNotification(order, status);
      }

      sendSuccess(res, order.toJSON());
    } catch (error) {
      console.error('Update order status error:', error);
      sendError(res, 'Failed to update order status', 500, 'UPDATE_ORDER_STATUS_ERROR');
    }
  }

  async getScanAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [
        totalScans,
        uniquePets,
        scansByDay,
        topScannedPets,
        scansByLocation
      ] = await Promise.all([
        ScanLog.countDocuments({ createdAt: { $gte: startDate } }),
        ScanLog.distinct('petId', { createdAt: { $gte: startDate } }).then(pets => pets.length),
        ScanLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        ScanLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: '$petId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'pets',
              localField: '_id',
              foreignField: '_id',
              as: 'pet'
            }
          }
        ]),
        ScanLog.aggregate([
          { 
            $match: { 
              createdAt: { $gte: startDate },
              location: { $ne: null }
            }
          },
          { $group: { _id: '$location', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      sendSuccess(res, {
        totalScans,
        uniquePets,
        scansByDay,
        topScannedPets,
        scansByLocation,
        period: `${days} days`,
      });
    } catch (error) {
      console.error('Get scan analytics error:', error);
      sendError(res, 'Failed to fetch scan analytics', 500, 'SCAN_ANALYTICS_ERROR');
    }
  }

  private async sendOrderStatusNotification(order: any, status: string): Promise<void> {
    try {
      const user = order.userId;
      const pet = order.petId;
      
      let message = '';
      let emailSubject = '';
      
      if (status === 'shipped') {
        message = `📦 Your pet tag order for ${pet.name} has shipped! ${order.trackingNumber ? `Tracking: ${order.trackingNumber}` : ''}`;
        emailSubject = 'Your Pet Tag Order Has Shipped';
      } else if (status === 'delivered') {
        message = `✅ Your pet tag for ${pet.name} has been delivered! Remember to activate it when you receive it.`;
        emailSubject = 'Your Pet Tag Has Been Delivered';
      }

      // Send SMS
      if (user.phone && message) {
        try {
          await sendSMS(user.phone, message);
        } catch (error) {
          console.error('SMS notification failed:', error);
        }
      }

      // Send email
      if (user.email && emailSubject) {
        try {
          await sendEmail({
            to: user.email,
            subject: emailSubject,
            html: `<h2>${emailSubject}</h2><p>${message}</p>`,
          });
        } catch (error) {
          console.error('Email notification failed:', error);
        }
      }

      // Create notification
      const notification = new Notification({
        userId: user._id,
        type: status === 'shipped' ? 'order_shipped' : 'order_delivered',
        title: emailSubject,
        message,
        data: {
          orderId: order._id,
          petId: pet._id,
          trackingNumber: order.trackingNumber,
        },
      });

      await notification.save();
    } catch (error) {
      console.error('Order status notification error:', error);
    }
  }
}