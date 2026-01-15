// src/controllers/FoundPetController.ts
import { Request, Response } from 'express';
import { Tag } from '../models/Tag';
import { Pet } from '../models/Pet';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';
import { sendSMS, formatPhoneNumber, isValidPhoneNumber } from '../config/twilio';
import { sendEmail } from '../utils/email';

export class FoundPetController {
  /**
   * Get pet details by tag QR code (public endpoint for finders)
   */
  async getPetByTag(req: Request, res: Response): Promise<void> {
    try {
      const { qrCode } = req.params;

      // Find the tag
      const tag = await Tag.findOne({
        qrCode: qrCode.toUpperCase(),
        status: 'active',
        isActive: true,
      });

      if (!tag) {
        sendError(res, 'Tag not found or inactive', 404, 'TAG_NOT_FOUND');
        return;
      }

      // Find the owner
      const owner = await User.findById(tag.userId);
      if (!owner) {
        sendError(res, 'Tag owner not found', 404, 'OWNER_NOT_FOUND');
        return;
      }

      // Find the pet
      const pet = await Pet.findOne({
        tagId: tag._id,
        isActive: true,
      });

      if (!pet) {
        sendError(
          res,
          'No pet is currently assigned to this tag',
          404,
          'PET_NOT_FOUND'
        );
        return;
      }

      // Return public pet information for the finder
      const publicPetInfo = {
        pet: {
          name: pet.name,
          breed: pet.breed,
          photoUrl: pet.photoUrl,
          age: pet.age,
          gender: pet.gender,
          color: pet.color,
          medical: {
            conditions: pet.medical?.conditions || 'None',
            allergies: pet.medical?.allergies || 'None',
          },
        },
        tag: {
          qrCode: tag.qrCode,
          status: tag.status,
        },
        owner: {
          name: `${owner.firstName} ${owner.lastName}`,
          phone: owner.phone,
          email: owner.email,
        },
      };

      sendSuccess(res, publicPetInfo);
    } catch (error) {
      console.error('Get pet by tag error:', error);
      sendError(
        res,
        'Failed to fetch pet information',
        500,
        'FETCH_PET_BY_TAG_ERROR'
      );
    }
  }

  /**
   * Notify owner with finder details and location
   */
  async notifyOwner(req: Request, res: Response): Promise<void> {
    try {
      const { qrCode, finderContact, location, condition, additionalNotes } =
        req.body;

      // Find tag
      const tag = await Tag.findOne({
        qrCode: qrCode.toUpperCase(),
        status: 'active',
        isActive: true,
      });

      if (!tag) {
        sendError(res, 'Tag not found or inactive', 404, 'TAG_NOT_FOUND');
        return;
      }

      // Find pet
      const pet = await Pet.findOne({
        tagId: tag._id,
        isActive: true,
      });

      if (!pet) {
        sendError(
          res,
          'No pet assigned to this tag',
          404,
          'PET_NOT_ASSIGNED'
        );
        return;
      }

      // Find owner
      const owner = await User.findById(tag.userId);
      if (!owner) {
        sendError(res, 'Pet owner not found', 404, 'OWNER_NOT_FOUND');
        return;
      }

      // Update pet status
      // pet.status = 'found';
      pet.lastSeenAt = new Date();
      if (location?.address) {
        pet.lastSeenLocation = location.address;
      }
      await pet.save();

      // Build notification messages
      const conditionEmoji = {
        HEALTHY: '✅',
        INJURED: '🤕',
        SICK: '🤒',
        UNKNOWN: '❓',
      };

      const emoji = conditionEmoji[condition as keyof typeof conditionEmoji] || '📍';

      // Build finder info text
      const finderInfo = [];
      if (finderContact?.name) finderInfo.push(`Name: ${finderContact.name}`);
      if (finderContact?.phone)
        finderInfo.push(`Phone: ${finderContact.phone}`);
      if (finderContact?.email)
        finderInfo.push(`Email: ${finderContact.email}`);

      // Build location text
      let locationText = '';
      if (location?.address) {
        locationText = `📍 Location: ${location.address}`;
        if (location.latitude && location.longitude) {
          const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
          locationText += `\n🗺️  Maps: ${mapsUrl}`;
        }
      }

      // SMS Message (shorter version)
      const smsMessage = [
        `🎉 ${pet.name} has been found!`,
        `${emoji} Condition: ${condition || 'Unknown'}`,
        locationText,
        finderInfo.length > 0 ? `\n👤 Finder:\n${finderInfo.join('\n')}` : '',
        additionalNotes ? `\n💬 Note: ${additionalNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      // Send SMS
      const notificationResults = {
        sms: false,
        email: false,
        inApp: false,
      };

      if (owner.phone) {
        try {
          const formattedPhone = formatPhoneNumber(owner.phone);
          if (isValidPhoneNumber(formattedPhone)) {
            await sendSMS(formattedPhone, smsMessage);
            notificationResults.sms = true;
            console.log(`✅ SMS sent to: ${formattedPhone}`);
          } else {
            console.warn(`⚠️  Invalid phone number format: ${owner.phone}`);
          }
        } catch (error) {
          console.error('Failed to send SMS:', error);
        }
      }

      // Send Email (detailed version)
      if (owner.email) {
        try {
          const mapsLink =
            location?.latitude && location?.longitude
              ? `<a href="https://www.google.com/maps?q=${location.latitude},${location.longitude}" 
                   style="background: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
                  📍 View on Google Maps
                </a>`
              : '';

          await sendEmail({
            to: owner.email,
            subject: `🎉 Great News! ${pet.name} Has Been Found!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FABC3F 0%, #000000 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Great News!</h1>
                  <p style="color: white; margin-top: 10px; font-size: 20px;">
                    ${pet.name} has been found!
                  </p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  ${
                    pet.photoUrl
                      ? `
                    <div style="text-align: center; margin-bottom: 20px;">
                      <img src="${pet.photoUrl}" alt="${pet.name}" style="max-width: 250px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
                    </div>
                  `
                      : ''
                  }
                  
                  <div style="background: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #065F46; font-weight: bold;">
                      ${emoji} Pet Condition: ${condition || 'Unknown'}
                    </p>
                  </div>

                  ${
                    location?.address
                      ? `
                    <h3 style="color: #333; margin-top: 20px;">📍 Location Found</h3>
                    <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; border-left: 4px solid #FABC3F;">
                      <p style="margin: 0; color: #666;">${location.address}</p>
                      ${mapsLink}
                    </div>
                  `
                      : ''
                  }
                  
                  ${
                    finderInfo.length > 0
                      ? `
                    <h3 style="color: #333; margin-top: 20px;">👤 Finder Contact Information</h3>
                    <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
                      ${finderInfo.map((info) => `<p style="margin: 5px 0; color: #666;">${info}</p>`).join('')}
                    </div>
                  `
                      : ''
                  }
                  
                  ${
                    additionalNotes
                      ? `
                    <h3 style="color: #333; margin-top: 20px;">💬 Additional Notes</h3>
                    <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
                      <p style="margin: 0; color: #92400E; font-style: italic;">"${additionalNotes}"</p>
                    </div>
                  `
                      : ''
                  }
                  
                  <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/pets/${pet._id}" 
                       style="background: linear-gradient(135deg, #FABC3F 0%, #000000 100%); 
                              color: white; 
                              padding: 15px 40px; 
                              text-decoration: none; 
                              border-radius: 25px; 
                              display: inline-block;
                              font-weight: bold;
                              box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      View Full Details
                    </a>
                  </div>
                  
                  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                    PetResQR - Keeping pets safe and families connected 🐾
                  </p>
                </div>
              </div>
            `,
          });
          notificationResults.email = true;
          console.log(`✅ Email sent to: ${owner.email}`);
        } catch (error) {
          console.error('Failed to send email:', error);
        }
      }

      // Create in-app notification
      try {
        const notification = new Notification({
          userId: owner._id,
          type: 'pet_found',
          title: `${pet.name} Found!`,
          message: `${pet.name} has been found! ${location?.address ? `Location: ${location.address}` : ''}`,
          data: {
            petId: pet._id,
            tagId: tag._id,
            location: location?.address,
            finderContact,
            condition,
          },
        });
        await notification.save();
        notificationResults.inApp = true;
      } catch (error) {
        console.error('Failed to create in-app notification:', error);
      }

      // Log the event
      console.log({
        event: 'PET_FOUND_NOTIFICATION',
        petId: pet._id,
        petName: pet.name,
        tagId: tag.qrCode,
        ownerId: owner._id,
        notifications: notificationResults,
        timestamp: new Date(),
      });

      sendSuccess(res, {
        message: 'Owner has been notified successfully',
        pet: {
          name: pet.name,
          breed: pet.breed,
          photoUrl: pet.photoUrl,
        },
        notificationsSent: notificationResults,
      });
    } catch (error) {
      console.error('Notify owner error:', error);
      sendError(
        res,
        'Failed to notify owner',
        500,
        'NOTIFY_OWNER_ERROR'
      );
    }
  }
}

// Export instance
export const foundPetController = new FoundPetController();