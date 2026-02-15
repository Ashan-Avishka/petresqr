// src/controllers/TagController.ts
import { Response } from 'express';
import { Tag } from '../models/Tag';
import { QRCode } from '../models/QRCode';
import { Pet } from '../models/Pet';
import { Order } from '../models/Order';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { generateQRCode, getQRCodeUrl } from '../utils/qrCode';
import { sendSMS } from '../config/twilio';
import { sendEmail, emailTemplates } from '../utils/email';

export class TagController {

  async getUserTags(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tags = await Tag.find({
        userId: req.userId,
        isActive: true,
      })
        .populate('petId', 'name breed imageUrl')
        .populate('orderId', 'status total createdAt')
        .sort({ createdAt: -1 });

      // Manually fetch QRCode data for each tag if qrCodeId exists
      const formattedTags = await Promise.all(tags.map(async (tag) => {
        let qrCodeData = null;
        
        // Check if qrCodeId exists and fetch QRCode
        if (tag.qrCodeId) {
          try {
            qrCodeData = await QRCode.findById(tag.qrCodeId).select('tagId qrCodeData websiteUrl');
          } catch (err) {
            console.error('Error fetching QRCode:', err);
          }
        }

        return {
          _id: tag._id,
          qrCode: tag.qrCode || null,
          qrCodeUrl: qrCodeData?.qrCodeData || null,
          websiteUrl: qrCodeData?.websiteUrl || null,
          status: tag.status,
          isActive: tag.isActive,
          activatedAt: tag.activatedAt,
          createdAt: tag.createdAt,
          pet: tag.petId,
          order: tag.orderId,
        };
      }));

      sendSuccess(res, {
        tags: formattedTags,
        totalTags: tags.length,
        activeCount: tags.filter(t => t.status === 'active' && t.isActive).length,
        pendingCount: tags.filter(t => t.status === 'pending').length,
      });
    } catch (error) {
      console.error('Get user tags error:', error);
      sendError(res, 'Failed to retrieve tags', 500, 'GET_TAGS_ERROR');
    }
  }

  async purchaseTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { petId, quantity = 1, shippingAddress } = req.body;

      const pet = await Pet.findOne({
        _id: petId,
        ownerId: req.userId,
        isActive: true,
      });

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      const existingTag = await Tag.findOne({
        petId,
        status: { $in: ['active', 'pending'] },
        isActive: true,
      });

      if (existingTag) {
        sendError(res, 'Pet already has an active or pending tag', 400, 'TAG_EXISTS');
        return;
      }

      const tagPrice = 15.99;
      const total = tagPrice * quantity;

      const order = new Order({
        userId: req.userId,
        petId,
        status: 'pending',
        total,
        quantity,
        shippingAddress,
      });

      await order.save();

      const tags = [];
      for (let i = 0; i < quantity; i++) {
        const tag = new Tag({
          userId: req.userId,
          petId,
          status: 'pending',
          orderId: order._id,
          // qrCode and qrCodeId will be assigned on first activation
        });
        await tag.save();
        tags.push(tag);
      }

      order.tagId = tags[0]._id;
      await order.save();

      const paymentUrl = `${process.env.FRONTEND_URL}/payment/${order._id}`;

      sendSuccess(res, {
        orderId: order._id,
        tagId: tags[0]._id,
        total,
        quantity,
        paymentUrl,
      }, 201);
    } catch (error) {
      console.error('Purchase tag error:', error);
      sendError(res, 'Failed to create tag order', 500, 'PURCHASE_ERROR');
    }
  }

  /**
   * Activate tag - TWO FLOWS:
   * 
   * 1. FIRST-TIME ACTIVATION (tag has no qrCode yet):
   *    - Find an available QRCode from the qrcodes collection
   *    - Assign it to this tag
   *    - Mark QRCode as unavailable
   *    - Set tag status to 'active'
   *    - Set pet status to 'active'
   * 
   * 2. RE-ACTIVATION (tag already has qrCode):
   *    - Just set isActive = true
   *    - Status remains 'active'
   *    - Set pet status to 'active'
   */
  async activateTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { tagId } = req.params;

      const tag = await Tag.findOne({
        _id: tagId,
        userId: req.userId,
      }).populate('petId');

      if (!tag) {
        sendError(res, 'Tag not found', 404, 'TAG_NOT_FOUND');
        return;
      }

      // Check if tag is assigned to a pet
      if (!tag.petId) {
        sendError(res, 'Tag must be assigned to a pet before activation', 400, 'NO_PET_ASSIGNED');
        return;
      }

      const pet = tag.petId as any;

      // ── FLOW 2: Re-activation (already has qrCode) ───────────────────────────
      if (tag.qrCodeId || tag.qrCode) {
        // Already has a QRCode assigned, just toggle isActive
        tag.status = 'active';
        await tag.save();

        // Update pet status to active using findByIdAndUpdate to avoid validation issues
        await Pet.findByIdAndUpdate(pet._id, {
          status: 'active',
          tagId: tag._id,
        }, { runValidators: false });

        sendSuccess(res, {
          message: 'Tag re-activated successfully',
          tag: tag.toJSON(),
        });
        return;
      }

      // ── FLOW 1: First-time activation - Assign QRCode from collection ────────
      
      // Find an available QRCode
      const availableQRCode = await QRCode.findOne({
        availability: 'available',
      });

      if (!availableQRCode) {
        sendError(res, 'No available QR codes in inventory', 503, 'NO_QRCODE_AVAILABLE');
        return;
      }

      // Assign the QRCode to this tag
      tag.qrCodeId = availableQRCode._id;
      tag.qrCode = availableQRCode.tagId;
      tag.status = 'active';
      tag.activatedAt = new Date();
      await tag.save();

      // Mark QRCode as unavailable
      availableQRCode.availability = 'unavailable';
      availableQRCode.assignedTagId = tag._id;
      await availableQRCode.save();

      // Update pet status to active using findByIdAndUpdate to avoid validation issues
      await Pet.findByIdAndUpdate(pet._id, {
        status: 'active',
        tagId: tag._id,
      }, { runValidators: false });

      // Notifications
      const owner = await pet.populate('ownerId');
      const ownerData = owner.ownerId as any;

      if (ownerData?.phone) {
        try {
          await sendSMS(
            ownerData.phone,
            `✅ Great news! ${pet.name}'s pet tag (${availableQRCode.tagId}) has been activated and is now protecting your pet.`
          );
        } catch (error) {
          console.error('SMS sending failed:', error);
        }
      }

      if (ownerData?.email) {
        try {
          const emailTemplate = emailTemplates.tagActivated(pet.name);
          await sendEmail({ to: ownerData.email, ...emailTemplate });
        } catch (error) {
          console.error('Email sending failed:', error);
        }
      }

      const notification = new Notification({
        userId: ownerData._id,
        type: 'tag_activated',
        title: 'Pet Tag Activated',
        message: `${pet.name}'s pet tag ${availableQRCode.tagId} has been successfully activated.`,
        data: { petId: pet._id, tagId: tag._id },
      });
      await notification.save();

      // Fetch updated tag with QRCode data
      const updatedTag = await Tag.findById(tag._id).populate('petId', 'name breed imageUrl');
      const qrCodeDoc = await QRCode.findById(tag.qrCodeId);

      sendSuccess(res, {
        message: 'Tag activated successfully',
        tag: {
          ...updatedTag?.toJSON(),
          qrCodeUrl: qrCodeDoc?.qrCodeData,
          websiteUrl: qrCodeDoc?.websiteUrl,
        },
      });
    } catch (error) {
      console.error('Activate tag error:', error);
      sendError(res, 'Failed to activate tag', 500, 'ACTIVATION_ERROR');
    }
  }

  /**
   * Deactivate tag - Sets isActive to false and pet status to inactive
   */
  async deactivateTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tag = await Tag.findOne({
        _id: req.params.tagId,
        userId: req.userId,
      });

      if (!tag) {
        sendError(res, 'Tag not found', 404, 'TAG_NOT_FOUND');
        return;
      }

      if (!tag.isActive) {
        sendError(res, 'Tag is already inactive', 400, 'TAG_ALREADY_INACTIVE');
        return;
      }

      tag.status = 'inactive';
      await tag.save();

      // Set pet to inactive if tag has a pet assigned, using findByIdAndUpdate to avoid validation issues
      if (tag.petId) {
        await Pet.findByIdAndUpdate(tag.petId, {
          status: 'inactive',
        }, { runValidators: false });
      }

      sendSuccess(res, {
        message: 'Tag deactivated successfully',
        tag: tag.toJSON(),
      });
    } catch (error) {
      console.error('Deactivate tag error:', error);
      sendError(res, 'Failed to deactivate tag', 500, 'DEACTIVATION_ERROR');
    }
  }

  /**
   * Assign a tag to a pet
   * Only assigns to pets with inactive status
   */
  async assignTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { petId } = req.body;

      const tag = await Tag.findOne({
        _id: req.params.tagId,
        userId: req.userId,
      });

      if (!tag) {
        sendError(res, 'Tag not found', 404, 'TAG_NOT_FOUND');
        return;
      }

      if (tag.petId) {
        sendError(res, 'Tag is already assigned to a pet. Unassign it first.', 400, 'TAG_ALREADY_ASSIGNED');
        return;
      }

      const pet = await Pet.findOne({
        _id: petId,
        ownerId: req.userId,
        isActive: true,
      });

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      // Only allow assignment to inactive pets
      if (pet.status !== 'inactive') {
        sendError(res, 'Pet must have inactive status to be assigned a tag', 400, 'PET_NOT_INACTIVE');
        return;
      }

      // Check pet doesn't have another active tag
      const petExistingTag = await Tag.findOne({
        petId,
        _id: { $ne: tag._id },
        status: { $in: ['active', 'pending'] },
      });

      if (petExistingTag) {
        sendError(res, 'Pet already has an active tag', 400, 'PET_HAS_TAG');
        return;
      }

      tag.petId = petId;
      await tag.save();

      // Update pet using findByIdAndUpdate to avoid validation issues
      await Pet.findByIdAndUpdate(pet._id, {
        tagId: tag._id,
      }, { runValidators: false });

      const updatedTag = await Tag.findById(tag._id).populate('petId', 'name breed imageUrl');

      sendSuccess(res, {
        message: 'Tag assigned successfully',
        tag: updatedTag?.toJSON(),
      });
    } catch (error) {
      console.error('Assign tag error:', error);
      sendError(res, 'Failed to assign tag', 500, 'ASSIGN_ERROR');
    }
  }

  /**
   * Unassign a tag from its pet — sets pet status to 'inactive'
   */
  async unassignTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tag = await Tag.findOne({
        _id: req.params.tagId,
        userId: req.userId,
      });

      if (!tag) {
        sendError(res, 'Tag not found', 404, 'TAG_NOT_FOUND');
        return;
      }

      if (!tag.petId) {
        sendError(res, 'Tag is not assigned to any pet', 400, 'TAG_NOT_ASSIGNED');
        return;
      }

      // Set pet to inactive using findByIdAndUpdate to avoid validation issues
      await Pet.findByIdAndUpdate(tag.petId, {
        status: 'inactive',
        tagId: null,
      }, { runValidators: false });

      tag.petId = undefined as any;
      await tag.save();

      sendSuccess(res, {
        message: 'Tag unassigned successfully. Pet status set to inactive.',
        tag: tag.toJSON(),
      });
    } catch (error) {
      console.error('Unassign tag error:', error);
      sendError(res, 'Failed to unassign tag', 500, 'UNASSIGN_ERROR');
    }
  }

  async getQRCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tag = await Tag.findById(req.params.tagId);

      if (!tag) {
        sendError(res, 'Tag not found', 404, 'TAG_NOT_FOUND');
        return;
      }

      const pet = await Pet.findOne({
        _id: tag.petId,
        ownerId: req.userId,
      });

      if (!pet) {
        sendError(res, 'Unauthorized', 403, 'UNAUTHORIZED');
        return;
      }

      // Fetch QRCode if qrCodeId exists
      let qrCodeDoc = null;
      if (tag.qrCodeId) {
        qrCodeDoc = await QRCode.findById(tag.qrCodeId);
      }

      if (!qrCodeDoc) {
        sendError(res, 'QR code not assigned yet', 400, 'NO_QRCODE');
        return;
      }

      const qrCodeImage = await generateQRCode(qrCodeDoc.qrCodeData);

      sendSuccess(res, {
        qrCode: qrCodeImage,
        qrCodeUrl: qrCodeDoc.qrCodeData,
        websiteUrl: qrCodeDoc.websiteUrl,
        tagId: tag._id,
        physicalTagId: qrCodeDoc.tagId,
      });
    } catch (error) {
      console.error('Get QR code error:', error);
      sendError(res, 'Failed to generate QR code', 500, 'QR_CODE_ERROR');
    }
  }
}