// src/controllers/PetController.ts
import { Response } from 'express';
import { Pet } from '../models/Pet';
import { Tag } from '../models/Tag';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { getPaginationOptions, createPaginationResult } from '../utils/pagination';
import { uploadToS3, deleteFromS3 } from '../config/aws';
import { processImage } from '../middleware/upload';
import { v4 as uuidv4 } from 'uuid';

export class PetController {
  async getPets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      const [pets, total] = await Promise.all([
        Pet.find({ ownerId: req.userId, isActive: true })
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .populate('tagId', 'qrCode status')
          .lean(),
        Pet.countDocuments({ ownerId: req.userId, isActive: true })
      ]);

      const pagination = createPaginationResult(page, limit, total);

      sendSuccess(res, pets, 200, pagination);
    } catch (error) {
      console.error('Get pets error:', error);
      sendError(res, 'Failed to fetch pets', 500, 'FETCH_PETS_ERROR');
    }
  }

  async getPetById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pet = await Pet.findOne({
        _id: req.params.id,
        ownerId: req.userId,
        isActive: true
      }).populate('tagId', 'qrCode status activatedAt');

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      sendSuccess(res, pet);
    } catch (error) {
      console.error('Get pet error:', error);
      sendError(res, 'Failed to fetch pet', 500, 'FETCH_PET_ERROR');
    }
  }

  async createPet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, breed, age, dateOfBirth, medicalConditions } = req.body;
      
      let photoUrl: string | undefined;
      let photoKey: string | undefined;

      // Handle photo upload
      if (req.file) {
        const processedImage = await processImage(req.file.buffer);
        photoKey = `pets/${uuidv4()}-${Date.now()}.jpg`;
        photoUrl = await uploadToS3(processedImage, photoKey, 'image/jpeg');
      }

      const pet = new Pet({
        name,
        breed,
        age,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        medicalConditions,
        photoUrl,
        photoKey,
        ownerId: req.userId,
      });

      await pet.save();

      sendSuccess(res, pet.toJSON(), 201);
    } catch (error) {
      console.error('Create pet error:', error);
      sendError(res, 'Failed to create pet', 500, 'CREATE_PET_ERROR');
    }
  }

  async updatePet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, breed, age, dateOfBirth, medicalConditions } = req.body;
      
      const pet = await Pet.findOne({
        _id: req.params.id,
        ownerId: req.userId,
        isActive: true
      });

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      // Handle photo update
      if (req.file) {
        // Delete old photo if exists
        if (pet.photoKey) {
          try {
            await deleteFromS3(pet.photoKey);
          } catch (error) {
            console.warn('Failed to delete old photo:', error);
          }
        }

        // Upload new photo
        const processedImage = await processImage(req.file.buffer);
        const photoKey = `pets/${uuidv4()}-${Date.now()}.jpg`;
        const photoUrl = await uploadToS3(processedImage, photoKey, 'image/jpeg');
        
        pet.photoUrl = photoUrl;
        pet.photoKey = photoKey;
      }

      // Update other fields
      if (name !== undefined) pet.name = name;
      if (breed !== undefined) pet.breed = breed;
      if (age !== undefined) pet.age = age;
      if (dateOfBirth !== undefined) pet.dateOfBirth = new Date(dateOfBirth);
      if (medicalConditions !== undefined) pet.medicalConditions = medicalConditions;

      await pet.save();

      sendSuccess(res, pet.toJSON());
    } catch (error) {
      console.error('Update pet error:', error);
      sendError(res, 'Failed to update pet', 500, 'UPDATE_PET_ERROR');
    }
  }

  async deletePet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pet = await Pet.findOne({
        _id: req.params.id,
        ownerId: req.userId,
        isActive: true
      });

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      // Check if pet has active tag
      if (pet.tagId) {
        const tag = await Tag.findById(pet.tagId);
        if (tag && tag.status === 'active') {
          sendError(res, 'Cannot delete pet with active tag', 400, 'ACTIVE_TAG_EXISTS');
          return;
        }
      }

      // Soft delete
      pet.isActive = false;
      await pet.save();

      // Delete photo from S3
      if (pet.photoKey) {
        try {
          await deleteFromS3(pet.photoKey);
        } catch (error) {
          console.warn('Failed to delete photo from S3:', error);
        }
      }

      sendSuccess(res, { message: 'Pet deleted successfully' });
    } catch (error) {
      console.error('Delete pet error:', error);
      sendError(res, 'Failed to delete pet', 500, 'DELETE_PET_ERROR');
    }
  }

  async uploadPhoto(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'Photo file is required', 400, 'NO_FILE');
        return;
      }

      const pet = await Pet.findOne({
        _id: req.params.id,
        ownerId: req.userId,
        isActive: true
      });

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      // Delete old photo if exists
      if (pet.photoKey) {
        try {
          await deleteFromS3(pet.photoKey);
        } catch (error) {
          console.warn('Failed to delete old photo:', error);
        }
      }

      // Process and upload new photo
      const processedImage = await processImage(req.file.buffer);
      const photoKey = `pets/${uuidv4()}-${Date.now()}.jpg`;
      const photoUrl = await uploadToS3(processedImage, photoKey, 'image/jpeg');

      pet.photoUrl = photoUrl;
      pet.photoKey = photoKey;
      await pet.save();

      sendSuccess(res, {
        photoUrl: pet.photoUrl,
        message: 'Photo uploaded successfully'
      });
    } catch (error) {
      console.error('Upload photo error:', error);
      sendError(res, 'Failed to upload photo', 500, 'UPLOAD_PHOTO_ERROR');
    }
  }
}