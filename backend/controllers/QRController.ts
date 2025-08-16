// src/controllers/QRController.ts
import { Request, Response } from 'express';
import { Pet } from '../models/Pet';
import { Tag } from '../models/Tag';
import { User } from '../models/User';
import { ScanLog } from '../models/ScanLog';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';
import { sendSMS } from '../config/twilio';
import { sendEmail, emailTemplates } from '../utils/email';
import mongoose from 'mongoose';

export class QRController {
  async scanQR(req: Request, res: Response): Promise<void> {
    try {
      const { qrCode } = req.params;

      // Find tag by QR code
      const tag = await Tag.findOne({ qrCode, status: 'active' });
      
      if (!tag) {
        sendError(res, 'QR code not found or inactive', 404, 'QR_NOT_FOUND');
        return;
      }

      // Find pet and owner
      const pet = await Pet.findById(tag.petId).populate('ownerId', 'firstName lastName email phone');
      
      if (!pet || !pet.isActive) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      // Create scan log
      const scanLog = new ScanLog({
        petId: pet._id,
        tagId: tag._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      await scanLog.save();

      // Return public pet info (no owner contact details)
      sendSuccess(res, {
        pet: {
          name: pet.name,
          breed: pet.breed,
          photoUrl: pet.photoUrl,
          medicalConditions: pet.medicalConditions,
          foundDate: new Date().toISOString(),
        },
        scanId: scanLog._id,
      });
    } catch (error) {
      console.error('QR scan error:', error);
      sendError(res, 'Failed to scan QR code', 500, 'QR_SCAN_ERROR');
    }
  }

  async contactOwner(req: Request, res: Response): Promise<void> {
    try {
      const { qrCode } = req.params;
      const { finderName, finderPhone, message, location, scanId } = req.body;

      // Find tag and pet
      const tag = await Tag.findOne({ qrCode, status: 'active' });
      if (!tag) {
        sendError(res, 'QR code not found', 404, 'QR_NOT_FOUND');
        return;
      }

      const pet = await Pet.findById(tag.petId).populate('ownerId');
      if (!pet || !pet.isActive) {
        sendError(res, 'Pet not found', 404, 'PET_NOT_FOUND');
        return;
      }

      const owner = pet.ownerId as any;

      // Update scan log with finder info
      if (scanId && mongoose.Types.ObjectId.isValid(scanId)) {
        await ScanLog.findByIdAndUpdate(scanId, {
          location,
          finderInfo: {
            name: finderName,
            phone: finderPhone,
            message,
          },
          ownerNotified: true,
          notifiedAt: new Date(),
        });
      }

      // Send SMS to owner
      if (owner.phone) {
        const smsMessage = `🐕 GREAT NEWS! ${pet.name} has been found!\n\nFinder: ${finderName}\nPhone: ${finderPhone}\n${message ? `Message: ${message}\n` : ''}${location ? `Location: ${location}\n` : ''}\nPlease contact them ASAP!`;
        
        try {
          await sendSMS(owner.phone, smsMessage);
        } catch (error) {
          console.error('SMS sending failed:', error);
        }
      }

      // Send email to owner
      if (owner.email) {
        try {
          const emailTemplate = emailTemplates.petFound(pet.name, {
            name: finderName,
            phone: finderPhone,
            message,
            location,
          });
          
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
        type: 'pet_found',
        title: `${pet.name} has been found!`,
        message: `${finderName} found your pet and wants to help return them. Contact: ${finderPhone}`,
        data: {
          petId: pet._id,
          finderInfo: { name: finderName, phone: finderPhone, message, location },
          scanLogId: scanId,
        },
      });
      
      await notification.save();

      sendSuccess(res, {
        message: 'Owner has been notified successfully',
      });
    } catch (error) {
      console.error('Contact owner error:', error);
      sendError(res, 'Failed to contact owner', 500, 'CONTACT_OWNER_ERROR');
    }
  }
}