// src/controllers/PetController.ts
import { Response } from 'express';
import { Pet } from '../models/Pet';
import { Tag } from '../models/Tag';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { getPaginationOptions, createPaginationResult } from '../utils/pagination';
import { processAndSaveImage, deleteImage } from '../middleware/upload';

export class PetController {
  constructor() {
    this.getPets = this.getPets.bind(this);
    this.getPetById = this.getPetById.bind(this);
    this.createPet = this.createPet.bind(this);
    this.updatePet = this.updatePet.bind(this);
    this.deletePet = this.deletePet.bind(this);
    this.uploadPhoto = this.uploadPhoto.bind(this);
    this.toggleGallery = this.toggleGallery.bind(this);
    this.getGalleryPets = this.getGalleryPets.bind(this);
    this.getGalleryPetById = this.getGalleryPetById.bind(this);
  }

  private getTagPopulation(): any {
    return {
      path: 'tagId',
      select: 'qrCode status activatedAt deactivatedAt createdAt',
    };
  }

  async getPets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      const [pets, total] = await Promise.all([
        Pet.find({ ownerId: req.userId, isActive: true })
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .populate(this.getTagPopulation()),
        Pet.countDocuments({ ownerId: req.userId, isActive: true })
      ]);

      const pagination = createPaginationResult(page, limit, total);
      const petsJson = pets.map(pet => pet.toJSON());

      sendSuccess(res, petsJson, 200, pagination);
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
      }).populate(this.getTagPopulation());

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      sendSuccess(res, pet.toJSON());
    } catch (error) {
      console.error('Get pet error:', error);
      sendError(res, 'Failed to fetch pet', 500, 'FETCH_PET_ERROR');
    }
  }

  async createPet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        name,
        type,
        breed,
        age,
        weight,
        gender,
        color,
        dateOfBirth,
        tagId,
        gallery
      } = req.body;

      console.log('Create pet request body:', req.body);

      let photoUrl: string | undefined;
      let photoFilename: string | undefined;

      // Handle photo upload
      if (req.file) {
        try {
          const imageData = await processAndSaveImage(req.file.buffer);
          photoUrl = imageData.url;
          photoFilename = imageData.filename;
          console.log('Photo saved:', imageData);
        } catch (error) {
          console.error('Image processing error:', error);
          sendError(res, 'Failed to process image', 500, 'IMAGE_PROCESSING_ERROR');
          return;
        }
      }

      // Validate tag if provided
      if (tagId) {
        const tag = await Tag.findOne({
          _id: tagId,
          userId: req.userId,
          status: 'active'
        });

        if (!tag) {
          sendError(res, 'Invalid or unavailable tag', 400, 'INVALID_TAG');
          return;
        }

        // Check if tag is already assigned to a pet
        if (tag.petId) {
          sendError(res, 'Tag is already assigned to another pet', 400, 'TAG_ALREADY_ASSIGNED');
          return;
        }

        // Also check if any other pet is using this tag
        const existingPetWithTag = await Pet.findOne({
          tagId: tagId,
          isActive: true
        });

        if (existingPetWithTag) {
          sendError(res, 'Tag is already assigned to another pet', 400, 'TAG_ALREADY_ASSIGNED');
          return;
        }
      }

      const pet = new Pet({
        name,
        type: type || 'dog',
        breed,
        age,
        weight: weight || 0,
        gender,
        color: color || '',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        bio: {
          description: req.body['bio.description'] || '',
          microchipId: req.body['bio.microchipId'] || '',
        },
        medical: {
          allergies: req.body['medical.allergies'] || '',
          medications: req.body['medical.medications'] || '',
          conditions: req.body['medical.conditions'] || '',
          vetName: req.body['medical.vetName'] || '',
          vetPhone: req.body['medical.vetPhone'] || '',
        },
        other: {
          favoriteFood: req.body['other.favoriteFood'] || '',
          behavior: req.body['other.behavior'] || '',
          specialNeeds: req.body['other.specialNeeds'] || '',
        },
        story: {
          content: req.body['story.content'] || '',
          location: req.body['story.location'] || '',
          status: req.body['story.status'] || 'protected',
        },
        photoUrl,
        photoKey: photoFilename,
        ownerId: req.userId,
        tagId: tagId || null,
        status: tagId ? 'active' : 'inactive',
        gallery: gallery === true || gallery === 'true' ? true : false,
      });

      await pet.save();

      if (tagId) {
        await Tag.findByIdAndUpdate(tagId, {
          status: 'active',
          activatedAt: new Date(),
          petId: pet._id
        });
      }

      const populatedPet = await Pet.findById(pet._id)
        .populate(this.getTagPopulation());

      sendSuccess(res, populatedPet?.toJSON(), 201);
    } catch (error) {
      console.error('Create pet error:', error);
      sendError(res, 'Failed to create pet', 500, 'CREATE_PET_ERROR');
    }
  }

  async updatePet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        name,
        type,
        breed,
        age,
        weight,
        gender,
        color,
        dateOfBirth,
        tagId,
        gallery
      } = req.body;

      const pet = await Pet.findOne({
        _id: req.params.id,
        ownerId: req.userId,
        isActive: true
      });

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      // Handle tag assignment/update
      if (tagId !== undefined) {
        if (tagId === null || tagId === '') {
          // Removing tag assignment
          if (pet.tagId) {
            await Tag.findByIdAndUpdate(pet.tagId, {
              petId: null
            });
          }
          pet.tagId = null;
          pet.status = 'inactive';
        } else if (tagId !== pet.tagId?.toString()) {
          // Assigning new tag
          const newTag = await Tag.findOne({
            _id: tagId,
            userId: req.userId,
            status: 'active'
          });

          if (!newTag) {
            sendError(res, 'Invalid or unavailable tag', 400, 'INVALID_TAG');
            return;
          }

          // Check if tag is already assigned
          if (newTag.petId) {
            sendError(res, 'Tag is already assigned to another pet', 400, 'TAG_ALREADY_ASSIGNED');
            return;
          }

          const existingPetWithTag = await Pet.findOne({
            tagId: tagId,
            isActive: true,
            _id: { $ne: pet._id }
          });

          if (existingPetWithTag) {
            sendError(res, 'Tag is already assigned to another pet', 400, 'TAG_ALREADY_ASSIGNED');
            return;
          }

          // Remove old tag assignment
          if (pet.tagId) {
            await Tag.findByIdAndUpdate(pet.tagId, {
              petId: null
            });
          }

          // Assign new tag
          pet.tagId = tagId;
          pet.status = 'active';
          await Tag.findByIdAndUpdate(tagId, {
            petId: pet._id
          });
        }
      }

      // Handle photo update
      if (req.file) {
        // Delete old photo if exists
        if (pet.photoKey) {
          try {
            await deleteImage(pet.photoKey);
          } catch (error) {
            console.warn('Failed to delete old photo:', error);
          }
        }

        // Save new photo
        try {
          const imageData = await processAndSaveImage(req.file.buffer);
          pet.photoUrl = imageData.url;
          pet.photoKey = imageData.filename;
        } catch (error) {
          console.error('Image processing error:', error);
          sendError(res, 'Failed to process image', 500, 'IMAGE_PROCESSING_ERROR');
          return;
        }
      }

      // Update basic fields
      if (name !== undefined) pet.name = name;
      if (type !== undefined) pet.type = type;
      if (breed !== undefined) pet.breed = breed;
      if (age !== undefined) pet.age = age;
      if (weight !== undefined) pet.weight = weight;
      if (gender !== undefined) pet.gender = gender;
      if (color !== undefined) pet.color = color;
      if (dateOfBirth !== undefined) pet.dateOfBirth = new Date(dateOfBirth);
      if (gallery !== undefined) pet.gallery = gallery === true || gallery === 'true';

      // Update bio using bracket notation for FormData keys
      if (req.body['bio.description'] !== undefined) pet.bio.description = req.body['bio.description'];
      if (req.body['bio.microchipId'] !== undefined) pet.bio.microchipId = req.body['bio.microchipId'];

      // Update medical using bracket notation
      if (req.body['medical.allergies'] !== undefined) pet.medical.allergies = req.body['medical.allergies'];
      if (req.body['medical.medications'] !== undefined) pet.medical.medications = req.body['medical.medications'];
      if (req.body['medical.conditions'] !== undefined) pet.medical.conditions = req.body['medical.conditions'];
      if (req.body['medical.vetName'] !== undefined) pet.medical.vetName = req.body['medical.vetName'];
      if (req.body['medical.vetPhone'] !== undefined) pet.medical.vetPhone = req.body['medical.vetPhone'];

      // Update other using bracket notation
      if (req.body['other.favoriteFood'] !== undefined) pet.other.favoriteFood = req.body['other.favoriteFood'];
      if (req.body['other.behavior'] !== undefined) pet.other.behavior = req.body['other.behavior'];
      if (req.body['other.specialNeeds'] !== undefined) pet.other.specialNeeds = req.body['other.specialNeeds'];

      // Update story using bracket notation
      if (req.body['story.content'] !== undefined) pet.story.content = req.body['story.content'];
      if (req.body['story.location'] !== undefined) pet.story.location = req.body['story.location'];
      if (req.body['story.status'] !== undefined) pet.story.status = req.body['story.status'];

      await pet.save();

      const updatedPet = await Pet.findById(pet._id)
        .populate(this.getTagPopulation());

      sendSuccess(res, updatedPet?.toJSON());
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

      if (pet.tagId) {
        await Tag.findByIdAndUpdate(pet.tagId, {
          status: 'available',
          deactivatedAt: new Date(),
          petId: null
        });
      }

      pet.isActive = false;
      await pet.save();

      // Delete photo file if exists
      if (pet.photoKey) {
        try {
          await deleteImage(pet.photoKey);
        } catch (error) {
          console.warn('Failed to delete photo:', error);
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
          await deleteImage(pet.photoKey);
        } catch (error) {
          console.warn('Failed to delete old photo:', error);
        }
      }

      // Save new photo
      const imageData = await processAndSaveImage(req.file.buffer);
      pet.photoUrl = imageData.url;
      pet.photoKey = imageData.filename;
      await pet.save();

      const updatedPet = await Pet.findById(pet._id)
        .populate(this.getTagPopulation());

      sendSuccess(res, {
        ...updatedPet?.toJSON(),
        message: 'Photo uploaded successfully'
      });
    } catch (error) {
      console.error('Upload photo error:', error);
      sendError(res, 'Failed to upload photo', 500, 'UPLOAD_PHOTO_ERROR');
    }
  }

  async toggleGallery(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gallery } = req.body;

      const pet = await Pet.findOne({
        _id: req.params.id,
        ownerId: req.userId,
        isActive: true
      });

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      pet.gallery = gallery === true || gallery === 'true' || gallery === '1';
      pet.markModified('gallery');

      await pet.save();

      const updatedPet = await Pet.findById(pet._id)
        .populate(this.getTagPopulation());

      sendSuccess(res, updatedPet?.toJSON());
    } catch (error) {
      console.error('Toggle gallery error:', error);
      sendError(res, 'Failed to toggle gallery', 500, 'TOGGLE_GALLERY_ERROR');
    }
  }

  async getGalleryPets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = getPaginationOptions(req.query);
      const skip = (page - 1) * limit;

      const [pets, total] = await Promise.all([
        Pet.find({ gallery: true, isActive: true })
          .sort({ [sortBy!]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .populate(this.getTagPopulation())
          .populate('ownerId', 'firstName lastName email phone'),
        Pet.countDocuments({ gallery: true, isActive: true })
      ]);

      const pagination = createPaginationResult(page, limit, total);
      const petsJson = pets.map(pet => pet.toJSON());

      sendSuccess(res, petsJson, 200, pagination);
    } catch (error) {
      console.error('Get gallery pets error:', error);
      sendError(res, 'Failed to fetch gallery pets', 500, 'FETCH_GALLERY_PETS_ERROR');
    }
  }

  async getGalleryPetById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pet = await Pet.findOne({
        _id: req.params.id,
        gallery: true,
        isActive: true
      })
        .select('name type breed age weight gender color dateOfBirth photoUrl bio story createdAt')
        .populate('ownerId', 'firstName lastName');

      if (!pet) {
        sendError(res, 'Pet not found in gallery', 404, 'PET_NOT_FOUND');
        return;
      }

      const publicPetData = {
        id: pet._id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        gender: pet.gender,
        color: pet.color,
        dateOfBirth: pet.dateOfBirth,
        image: pet.photoUrl,
        bio: {
          description: pet.bio?.description || '',
        },
        story: {
          content: pet.story?.content || '',
          location: pet.story?.location || '',
          status: pet.story?.status || 'protected',
        },
        createdAt: pet.createdAt,
        owner: pet.ownerId ? {
          firstName: (pet.ownerId as any).firstName || '',
          lastName: (pet.ownerId as any).lastName || '',
        } : null
      };

      sendSuccess(res, publicPetData);
    } catch (error) {
      console.error('Get gallery pet error:', error);
      sendError(res, 'Failed to fetch pet', 500, 'FETCH_PET_ERROR');
    }
  }
}