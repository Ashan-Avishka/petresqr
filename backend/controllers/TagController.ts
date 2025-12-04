// src/controllers/TagController.ts
import { Response } from 'express';
import { Tag } from '../models/Tag';
import { Pet } from '../models/Pet';
import { Order } from '../models/Order';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { generateUniqueQRCode, generateQRCode, getQRCodeUrl } from '../utils/qrCode';
import { sendSMS } from '../config/twilio';
import { sendEmail, emailTemplates } from '../utils/email';

export class TagController {

async getUserTags(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    // Find all tags directly by userId
    const tags = await Tag.find({
      userId: req.userId,
      isActive: true,
    })
      .populate('petId', 'name breed imageUrl')
      .populate('orderId', 'status total createdAt')
      .sort({ createdAt: -1 });

    // Format response with additional data
    const formattedTags = tags.map(tag => ({
      _id: tag._id,
      qrCode: tag.qrCode,
      qrCodeUrl: getQRCodeUrl(tag.qrCode),
      status: tag.status,
      activatedAt: tag.activatedAt,
      createdAt: tag.createdAt,
      pet: tag.petId,
      order: tag.orderId,
    }));

    sendSuccess(res, {
      tags: formattedTags,
      totalTags: tags.length,
      activeCount: tags.filter(t => t.status === 'active').length,
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

    // Verify pet ownership
    const pet = await Pet.findOne({
      _id: petId,
      ownerId: req.userId,
      isActive: true,
    });

    if (!pet) {
      sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
      return;
    }

    // Check if pet already has an active tag
    const existingTag = await Tag.findOne({
      petId,
      status: { $in: ['active', 'pending'] },
      isActive: true,
    });

    if (existingTag) {
      sendError(res, 'Pet already has an active or pending tag', 400, 'TAG_EXISTS');
      return;
    }

    // Create order
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

    // Create tag(s) with userId
    const tags = [];
    for (let i = 0; i < quantity; i++) {
      const qrCode = generateUniqueQRCode();
      const tag = new Tag({
        userId: req.userId, // ADD THIS LINE
        petId,
        qrCode,
        status: 'pending',
        orderId: order._id,
      });
      
      await tag.save();
      tags.push(tag);
    }

    // Update order with first tag ID
    order.tagId = tags[0]._id;
    await order.save();

    const paymentUrl = `${process.env.FRONTEND_URL}/payment/${order._id}`;

    sendSuccess(res, {
      orderId: order._id,
      tagId: tags[0]._id,
      total,
      quantity,
      paymentUrl,
      qrCode: tags[0].qrCode,
    }, 201);
  } catch (error) {
    console.error('Purchase tag error:', error);
    sendError(res, 'Failed to create tag order', 500, 'PURCHASE_ERROR');
  }
}

  async activateTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { tagCode, petId } = req.body;

      // Find tag
      const tag = await Tag.findOne({
        qrCode: tagCode,
        petId,
        status: 'pending',
        isActive: true,
      });

      if (!tag) {
        sendError(res, 'Tag not found or already activated', 404, 'TAG_NOT_FOUND');
        return;
      }

      // Verify pet ownership
      const pet = await Pet.findOne({
        _id: petId,
        ownerId: req.userId,
        isActive: true,
      }).populate('ownerId');

      if (!pet) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      // Activate tag
      tag.status = 'active';
      tag.activatedAt = new Date();
      await tag.save();

      // Update pet status and link to tag
      pet.status = 'active';
      pet.tagId = tag._id;
      await pet.save();

      // Send activation notification
      const owner = pet.ownerId as any;

      // SMS notification
      if (owner.phone) {
        try {
          await sendSMS(
            owner.phone,
            `✅ Great news! ${pet.name}'s pet tag has been activated and is now protecting your pet with our lost pet recovery service.`
          );
        } catch (error) {
          console.error('SMS sending failed:', error);
        }
      }

      // Email notification
      if (owner.email) {
        try {
          const emailTemplate = emailTemplates.tagActivated(pet.name);
          await sendEmail({
            to: owner.email,
            ...emailTemplate,
          });
        } catch (error) {
          console.error('Email sending failed:', error);
        }
      }

      // Create notification
      const notification = new Notification({
        userId: owner._id,
        type: 'tag_activated',
        title: 'Pet Tag Activated',
        message: `${pet.name}'s pet tag has been successfully activated.`,
        data: {
          petId: pet._id,
          tagId: tag._id,
        },
      });

      await notification.save();

      sendSuccess(res, {
        message: 'Tag activated successfully',
        tag: tag.toJSON(),
        qrCodeUrl: getQRCodeUrl(tag.qrCode),
      });
    } catch (error) {
      console.error('Activate tag error:', error);
      sendError(res, 'Failed to activate tag', 500, 'ACTIVATION_ERROR');
    }
  }

  async getQRCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tag = await Tag.findById(req.params.tagId);

      if (!tag) {
        sendError(res, 'Tag not found', 404, 'TAG_NOT_FOUND');
        return;
      }

      // Verify ownership through pet
      const pet = await Pet.findOne({
        _id: tag.petId,
        ownerId: req.userId,
      });

      if (!pet) {
        sendError(res, 'Unauthorized', 403, 'UNAUTHORIZED');
        return;
      }

      const qrCodeUrl = getQRCodeUrl(tag.qrCode);
      const qrCodeImage = await generateQRCode(qrCodeUrl);

      // Return QR code as base64 data URL
      sendSuccess(res, {
        qrCode: qrCodeImage,
        qrCodeUrl,
        tagId: tag._id,
      });
    } catch (error) {
      console.error('Get QR code error:', error);
      sendError(res, 'Failed to generate QR code', 500, 'QR_CODE_ERROR');
    }
  }
}