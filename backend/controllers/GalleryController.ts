// src/controllers/GalleryController.ts
import { Request, Response } from 'express';
import { Pet } from '../models/Pet';
import { sendSuccess, sendError } from '../utils/response';
import { getPaginationOptions, createPaginationResult } from '../utils/pagination';

export class GalleryController {
  async getGallery(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      // Filter options
      const breed = req.query.breed as string;
      const search = req.query.search as string;

      let filter: any = {
        isActive: true,
        photoUrl: { $ne: null },
        status: 'active', // Only show pets with active tags
      };

      if (breed) {
        filter.breed = new RegExp(breed, 'i');
      }

      if (search) {
        filter.$or = [
          { name: new RegExp(search, 'i') },
          { breed: new RegExp(search, 'i') },
        ];
      }

      const [pets, total] = await Promise.all([
        Pet.find(filter)
          .select('name breed photoUrl age createdAt')
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Pet.countDocuments(filter)
      ]);

      const pagination = createPaginationResult(page, limit, total);

      sendSuccess(res, pets, 200, pagination);
    } catch (error) {
      console.error('Get gallery error:', error);
      sendError(res, 'Failed to fetch gallery', 500, 'FETCH_GALLERY_ERROR');
    }
  }

  async getPublicPetProfile(req: Request, res: Response): Promise<void> {
    try {
      const pet = await Pet.findOne({
        _id: req.params.petId,
        isActive: true,
        status: 'active',
        photoUrl: { $ne: null },
      }).select('name breed photoUrl age medicalConditions createdAt');

      if (!pet) {
        sendError(res, 'Pet not found in gallery', 404, 'PET_NOT_FOUND');
        return;
      }

      sendSuccess(res, pet);
    } catch (error) {
      console.error('Get public pet profile error:', error);
      sendError(res, 'Failed to fetch pet profile', 500, 'FETCH_PET_PROFILE_ERROR');
    }
  }
}