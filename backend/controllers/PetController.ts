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
  constructor() {
    this.getPets = this.getPets.bind(this);
    this.getPetById = this.getPetById.bind(this);
    this.createPet = this.createPet.bind(this);
    this.updatePet = this.updatePet.bind(this);
    this.deletePet = this.deletePet.bind(this);
    this.uploadPhoto = this.uploadPhoto.bind(this);
    this.getPetByTag = this.getPetByTag.bind(this);
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
        bio,
        medical,
        other,
        tagId
      } = req.body;
      
      let photoUrl: string | undefined;
      let photoKey: string | undefined;

      // Handle photo upload
      if (req.file) {
        const processedImage = await processImage(req.file.buffer);
        photoKey = `pets/${uuidv4()}-${Date.now()}.jpg`;
        photoUrl = await uploadToS3(processedImage, photoKey, 'image/jpeg');
      }

      // Validate tag if provided
      if (tagId) {
        const tag = await Tag.findOne({ 
          _id: tagId,
          userId: req.userId,
          status: 'available'
        });
        
        if (!tag) {
          sendError(res, 'Invalid or unavailable tag', 400, 'INVALID_TAG');
          return;
        }

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
          description: bio?.description || '',
          microchipId: bio?.microchipId || '',
        },
        medical: {
          allergies: medical?.allergies || '',
          medications: medical?.medications || '',
          conditions: medical?.conditions || '',
          vetName: medical?.vetName || '',
          vetPhone: medical?.vetPhone || '',
        },
        other: {
          favoriteFood: other?.favoriteFood || '',
          behavior: other?.behavior || '',
          specialNeeds: other?.specialNeeds || '',
        },
        photoUrl,
        photoKey,
        ownerId: req.userId,
        tagId: tagId || null,
        status: tagId ? 'active' : 'inactive',
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
        bio,
        medical,
        other,
        tagId
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
          if (pet.tagId) {
            await Tag.findByIdAndUpdate(pet.tagId, { 
              status: 'available',
              deactivatedAt: new Date(),
              petId: null
            });
          }
          pet.tagId = null;
          pet.status = 'inactive';
        } else if (tagId !== pet.tagId?.toString()) {
          const newTag = await Tag.findOne({ 
            _id: tagId,
            userId: req.userId,
            status: 'available' 
          });
          
          if (!newTag) {
            sendError(res, 'Invalid or unavailable tag', 400, 'INVALID_TAG');
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

          if (pet.tagId) {
            await Tag.findByIdAndUpdate(pet.tagId, { 
              status: 'available',
              deactivatedAt: new Date(),
              petId: null
            });
          }

          pet.tagId = tagId;
          pet.status = 'active';
          await Tag.findByIdAndUpdate(tagId, { 
            status: 'active',
            activatedAt: new Date(),
            petId: pet._id
          });
        }
      }

      // Handle photo update
      if (req.file) {
        if (pet.photoKey) {
          try {
            await deleteFromS3(pet.photoKey);
          } catch (error) {
            console.warn('Failed to delete old photo:', error);
          }
        }

        const processedImage = await processImage(req.file.buffer);
        const photoKey = `pets/${uuidv4()}-${Date.now()}.jpg`;
        const photoUrl = await uploadToS3(processedImage, photoKey, 'image/jpeg');
        
        pet.photoUrl = photoUrl;
        pet.photoKey = photoKey;
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

      // Update bio
      if (bio) {
        if (bio.description !== undefined) pet.bio.description = bio.description;
        if (bio.microchipId !== undefined) pet.bio.microchipId = bio.microchipId;
      }

      // Update medical
      if (medical) {
        if (medical.allergies !== undefined) pet.medical.allergies = medical.allergies;
        if (medical.medications !== undefined) pet.medical.medications = medical.medications;
        if (medical.conditions !== undefined) pet.medical.conditions = medical.conditions;
        if (medical.vetName !== undefined) pet.medical.vetName = medical.vetName;
        if (medical.vetPhone !== undefined) pet.medical.vetPhone = medical.vetPhone;
      }

      // Update other
      if (other) {
        if (other.favoriteFood !== undefined) pet.other.favoriteFood = other.favoriteFood;
        if (other.behavior !== undefined) pet.other.behavior = other.behavior;
        if (other.specialNeeds !== undefined) pet.other.specialNeeds = other.specialNeeds;
      }

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

      if (pet.photoKey) {
        try {
          await deleteFromS3(pet.photoKey);
        } catch (error) {
          console.warn('Failed to delete old photo:', error);
        }
      }

      const processedImage = await processImage(req.file.buffer);
      const photoKey = `pets/${uuidv4()}-${Date.now()}.jpg`;
      const photoUrl = await uploadToS3(processedImage, photoKey, 'image/jpeg');

      pet.photoUrl = photoUrl;
      pet.photoKey = photoKey;
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

  async getPetByTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { qrCode } = req.params;

      const tag = await Tag.findOne({ qrCode, status: 'active' });
      if (!tag) {
        sendError(res, 'Tag not found or inactive', 404, 'TAG_NOT_FOUND');
        return;
      }

      const pet = await Pet.findOne({
        tagId: tag._id,
        isActive: true
      }).populate(this.getTagPopulation());

      if (!pet) {
        sendError(res, 'Pet not found for this tag', 404, 'PET_NOT_FOUND');
        return;
      }

      // Return limited info for public access
      const publicPetInfo = {
        name: pet.name,
        breed: pet.breed,
        photoUrl: pet.photoUrl,
        medical: {
          conditions: pet.medical.conditions,
          allergies: pet.medical.allergies,
        },
        tag: {
          qrCode: tag.qrCode,
          status: tag.status
        }
      };

      sendSuccess(res, publicPetInfo);
    } catch (error) {
      console.error('Get pet by tag error:', error);
      sendError(res, 'Failed to fetch pet by tag', 500, 'FETCH_PET_BY_TAG_ERROR');
    }
  }
}