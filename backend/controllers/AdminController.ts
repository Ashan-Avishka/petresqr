// src/controllers/AdminController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Pet } from '../models/Pet';
import { Order } from '../models/Order';
import { Tag } from '../models/Tag';
import { Product } from '../models/Product';
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

      // Get user's pets and orders (lean keeps _id as-is, consistent with other admin endpoints)
      const [pets, orders] = await Promise.all([
        Pet.find({ ownerId: user._id }).populate('tagId', 'qrCode status').lean(),
        Order.find({ userId: user._id }).populate('petId', 'name breed').populate('tagId', 'qrCode').lean(),
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
      const name = req.query.name as string;
      let filter: any = { isActive: true };

      if (status) filter.status = status;
      if (name) filter.name = { $regex: name, $options: 'i' };

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

  // ── User CRUD ──────────────────────────────────────────────────────────────

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { role, isActive } = req.body;
      const update: any = {};
      if (role !== undefined) update.role = role;
      if (isActive !== undefined) update.isActive = isActive;

      const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!user) { sendError(res, 'User not found', 404, 'USER_NOT_FOUND'); return; }
      sendSuccess(res, user.toJSON());
    } catch (error) {
      console.error('Update user error:', error);
      sendError(res, 'Failed to update user', 500, 'UPDATE_USER_ERROR');
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) { sendError(res, 'User not found', 404, 'USER_NOT_FOUND'); return; }
      sendSuccess(res, { message: 'User deleted' });
    } catch (error) {
      console.error('Delete user error:', error);
      sendError(res, 'Failed to delete user', 500, 'DELETE_USER_ERROR');
    }
  }

  // ── Pet CRUD ───────────────────────────────────────────────────────────────

  async getPetById(req: Request, res: Response): Promise<void> {
    try {
      const pet = await Pet.findById(req.params.id)
        .populate('ownerId', 'firstName lastName email')
        .populate('tagId', 'qrCode status isActive activatedAt')
        .lean();
      if (!pet) { sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND'); return; }
      sendSuccess(res, pet);
    } catch (error) {
      console.error('Get pet by ID error:', error);
      sendError(res, 'Failed to fetch pet', 500, 'FETCH_PET_ERROR');
    }
  }

  async updatePet(req: Request, res: Response): Promise<void> {
    try {
      const { name, breed, type, status } = req.body;
      const update: any = {};
      if (name !== undefined) update.name = name;
      if (breed !== undefined) update.breed = breed;
      if (type !== undefined) update.type = type;
      if (status !== undefined) update.status = status;

      const pet = await Pet.findByIdAndUpdate(req.params.id, update, { new: true })
        .populate('ownerId', 'firstName lastName email')
        .populate('tagId', 'qrCode status');
      if (!pet) { sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND'); return; }
      sendSuccess(res, pet.toJSON());
    } catch (error) {
      console.error('Update pet error:', error);
      sendError(res, 'Failed to update pet', 500, 'UPDATE_PET_ERROR');
    }
  }

  async deletePet(req: Request, res: Response): Promise<void> {
    try {
      const pet = await Pet.findByIdAndDelete(req.params.id);
      if (!pet) { sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND'); return; }
      sendSuccess(res, { message: 'Pet deleted' });
    } catch (error) {
      console.error('Delete pet error:', error);
      sendError(res, 'Failed to delete pet', 500, 'DELETE_PET_ERROR');
    }
  }

  // ── Tag CRUD ───────────────────────────────────────────────────────────────

  async getTags(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      const status = req.query.status as string;
      const search = req.query.search as string;
      const filter: any = {};
      if (status) filter.status = status;
      if (search) filter.qrCode = { $regex: search, $options: 'i' };

      const [tags, total] = await Promise.all([
        Tag.find(filter)
          .populate('userId', 'firstName lastName email')
          .populate('petId', 'name breed')
          .populate('productId', 'name images')
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Tag.countDocuments(filter),
      ]);

      const processed = tags.map((t: any) => ({
        ...t,
        productImage: t.productId?.images?.[0]?.url ?? null,
        productId: undefined,
      }));

      const pagination = createPaginationResult(page, limit, total);
      sendSuccess(res, processed, 200, pagination);
    } catch (error) {
      console.error('Get tags error:', error);
      sendError(res, 'Failed to fetch tags', 500, 'FETCH_TAGS_ERROR');
    }
  }

  async updateTag(req: Request, res: Response): Promise<void> {
    try {
      const { status, isActive } = req.body;
      const update: any = {};
      if (status !== undefined) update.status = status;
      if (isActive !== undefined) update.isActive = isActive;

      const tag = await Tag.findByIdAndUpdate(req.params.id, update, { new: true })
        .populate('userId', 'firstName lastName email')
        .populate('petId', 'name breed')
        .lean();
      if (!tag) { sendError(res, 'Tag not found', 404, 'TAG_NOT_FOUND'); return; }
      sendSuccess(res, tag);
    } catch (error) {
      console.error('Update tag error:', error);
      sendError(res, 'Failed to update tag', 500, 'UPDATE_TAG_ERROR');
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const order = await Order.findById(req.params.id)
        .populate('userId', 'firstName lastName email phone')
        .populate('petId', 'name breed photoUrl')
        .populate('tagId', 'qrCode status')
        .lean();
      if (!order) { sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND'); return; }
      sendSuccess(res, order);
    } catch (error) {
      console.error('Get order by id error:', error);
      sendError(res, 'Failed to fetch order', 500, 'FETCH_ORDER_ERROR');
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;
      const search = req.query.search as string;
      const category = req.query.category as string;

      const filter: any = {};
      if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }];
      if (category) filter.category = category;

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter),
      ]);

      sendSuccess(res, products, 200, createPaginationResult(page, limit, total));
    } catch (error) {
      console.error('Get products error:', error);
      sendError(res, 'Failed to fetch products', 500, 'FETCH_PRODUCTS_ERROR');
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const allowed = ['name', 'description', 'price', 'compareAtPrice', 'availability', 'stock',
        'availableColors', 'availableSizes', 'keyFeatures', 'badge', 'isFeatured', 'isActive',
        'petCategory', 'specifications', 'weight'];
      const update: any = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) update[key] = req.body[key];
      }

      const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
      if (!product) { sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND'); return; }
      sendSuccess(res, product);
    } catch (error) {
      console.error('Update product error:', error);
      sendError(res, 'Failed to update product', 500, 'UPDATE_PRODUCT_ERROR');
    }
  }

  async deleteTag(req: Request, res: Response): Promise<void> {
    try {
      const tag = await Tag.findByIdAndDelete(req.params.id);
      if (!tag) { sendError(res, 'Tag not found', 404, 'TAG_NOT_FOUND'); return; }
      sendSuccess(res, { message: 'Tag deleted' });
    } catch (error) {
      console.error('Delete tag error:', error);
      sendError(res, 'Failed to delete tag', 500, 'DELETE_TAG_ERROR');
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