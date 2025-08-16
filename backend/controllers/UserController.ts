// src/controllers/UserController.ts
import { Response } from 'express';
import { User } from '../models/User';
import { Pet } from '../models/Pet';
import { Order } from '../models/Order';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
        return;
      }

      sendSuccess(res, user.toJSON());
    } catch (error) {
      console.error('Get profile error:', error);
      sendError(res, 'Failed to fetch profile', 500, 'FETCH_PROFILE_ERROR');
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { firstName, lastName, phone, address } = req.body;
      
      const user = await User.findById(req.userId);
      
      if (!user) {
        sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
        return;
      }

      // Update fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;

      await user.save();

      sendSuccess(res, user.toJSON());
    } catch (error) {
      console.error('Update profile error:', error);
      sendError(res, 'Failed to update profile', 500, 'UPDATE_PROFILE_ERROR');
    }
  }

  async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
        return;
      }

      // Check for active pets/orders
      const activePets = await Pet.countDocuments({ 
        ownerId: req.userId, 
        isActive: true,
        status: 'active' 
      });

      const activeOrders = await Order.countDocuments({
        userId: req.userId,
        status: { $in: ['paid', 'processing', 'shipped'] }
      });

      if (activePets > 0 || activeOrders > 0) {
        sendError(res, 'Cannot delete account with active pets or orders', 400, 'ACTIVE_RESOURCES');
        return;
      }

      // Soft delete user
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`;
      await user.save();

      // Soft delete all user's pets
      await Pet.updateMany(
        { ownerId: req.userId },
        { isActive: false }
      );

      sendSuccess(res, { message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      sendError(res, 'Failed to delete account', 500, 'DELETE_ACCOUNT_ERROR');
    }
  }
}