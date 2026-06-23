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

      // Send Email
      if (owner.email) {
        try {
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

          // Build absolute image URL — fall back to branded placeholder for localhost (not reachable by Gmail)
          const rawImageUrl = pet.photoUrl
            ? pet.photoUrl.startsWith('http')
              ? pet.photoUrl
              : `${backendUrl}${pet.photoUrl.startsWith('/') ? '' : '/'}${pet.photoUrl}`
            : null;
          const petImageUrl = rawImageUrl && !rawImageUrl.includes('localhost')
            ? rawImageUrl
            : `https://placehold.co/560x300/FABC3F/1a1a1a?text=${encodeURIComponent(pet.name)}`;

          const conditionColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
            HEALTHY: { bg: '#F0FDF4', border: '#22C55E', text: '#15803D', label: '✅ Healthy' },
            INJURED: { bg: '#FFF1F2', border: '#F43F5E', text: '#BE123C', label: '🤕 Injured' },
            SICK:    { bg: '#FFF7ED', border: '#F97316', text: '#C2410C', label: '🤒 Sick'    },
            UNKNOWN: { bg: '#F8FAFC', border: '#94A3B8', text: '#475569', label: '❓ Unknown' },
          };
          const cond = conditionColors[condition] || conditionColors.UNKNOWN;

          await sendEmail({
            to: owner.email,
            subject: `🎉 ${pet.name} has been found!`,
            html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${pet.name} has been found!</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);">

  <!-- Gradient header -->
  <tr>
    <td style="background:linear-gradient(135deg,#000000 0%,#1a1200 50%,#FABC3F 100%);padding:36px 36px 28px;text-align:center;">
      <p style="margin:0 0 10px;display:inline-block;background:rgba(250,188,63,0.18);color:#FABC3F;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid rgba(250,188,63,0.35);">PetResQR</p>
      <h1 style="margin:8px 0 6px;color:#ffffff;font-size:30px;font-weight:700;line-height:1.2;">🎉 Great News!</h1>
      <p style="margin:0;color:rgba(255,255,255,0.80);font-size:16px;"><strong style="color:#FABC3F;">${pet.name}</strong> has been found!</p>
    </td>
  </tr>

  <!-- Pet image -->
  <tr>
    <td style="padding:0;line-height:0;">
      <img src="${petImageUrl}" alt="${pet.name}" width="560"
        style="width:100%;max-width:560px;height:300px;object-fit:cover;object-position:center top;display:block;" />
    </td>
  </tr>

  <!-- Pet name strip — gradient -->
  <tr>
    <td style="background:linear-gradient(90deg,#000000 0%,#3a2000 60%,#FABC3F 100%);padding:14px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${pet.name}</p>
            <p style="margin:2px 0 0;color:rgba(250,188,63,0.75);font-size:13px;">${pet.breed || ''}${pet.breed && pet.age ? ' · ' : ''}${pet.age ? pet.age + ' yrs' : ''}</p>
          </td>
          <td align="right">
            <span style="display:inline-block;background:#FABC3F;color:#000;font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px;">Found 🐾</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:28px 28px 8px;">

      <!-- Greeting -->
      <p style="margin:0 0 22px;color:#374151;font-size:15px;line-height:1.7;">
        Hi <strong style="color:#111827;">${owner.firstName}</strong>, someone found <strong style="color:#111827;">${pet.name}</strong> and scanned their QR tag.
        Reach out to the finder as soon as possible to bring ${pet.name} home!
      </p>

      <!-- Condition -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="background:${cond.bg};border:1px solid ${cond.border};border-radius:10px;padding:12px 16px;">
            <p style="margin:0;color:${cond.text};font-size:14px;font-weight:700;">Condition: ${cond.label}</p>
          </td>
        </tr>
      </table>

      ${finderContact?.name || finderContact?.phone || finderContact?.email ? `
      <!-- Finder contact — gradient, most prominent -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="background:linear-gradient(135deg,#000000 0%,#1a1200 55%,#FABC3F 100%);border-radius:14px;padding:20px 22px;">
            <p style="margin:0 0 10px;color:rgba(250,188,63,0.75);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">👤 Finder Contact</p>
            ${finderContact?.name ? `<p style="margin:0 0 10px;color:#ffffff;font-size:17px;font-weight:700;">${finderContact.name}</p>` : ''}
            ${finderContact?.phone ? `
            <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
              <tr>
                <td style="background:#FABC3F;border-radius:8px;padding:10px 20px;">
                  <a href="tel:${finderContact.phone}" style="color:#000;font-size:15px;font-weight:700;text-decoration:none;">📞 ${finderContact.phone}</a>
                </td>
              </tr>
            </table>` : ''}
            ${finderContact?.email ? `<p style="margin:0;font-size:13px;"><a href="mailto:${finderContact.email}" style="color:rgba(250,188,63,0.85);text-decoration:underline;">${finderContact.email}</a></p>` : ''}
          </td>
        </tr>
      </table>
      ` : ''}

      ${location?.address ? `
      <!-- Location -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:16px 18px;">
            <p style="margin:0 0 6px;color:#6B7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📍 Found at</p>
            <p style="margin:0 0 ${(location.latitude && location.longitude) ? '12px' : '0'};color:#374151;font-size:14px;line-height:1.5;">${location.address}</p>
            ${location.latitude && location.longitude ? `
            <a href="https://www.google.com/maps?q=${location.latitude},${location.longitude}"
              style="display:inline-block;background:#4285F4;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;">
              Open in Google Maps →
            </a>` : ''}
          </td>
        </tr>
      </table>
      ` : ''}

      ${additionalNotes ? `
      <!-- Notes -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:16px 18px;">
            <p style="margin:0 0 6px;color:#92400E;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">💬 Note from finder</p>
            <p style="margin:0;color:#78350F;font-size:14px;line-height:1.6;font-style:italic;">"${additionalNotes}"</p>
          </td>
        </tr>
      </table>
      ` : ''}

      <!-- Divider -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;">
        <tr><td style="border-top:1px solid #E5E7EB;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td align="center">
            <a href="${frontendUrl}"
              style="display:inline-block;background:linear-gradient(135deg,#000000 0%,#FABC3F 100%);color:#ffffff;padding:14px 44px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:700;">
              Open PetResQR
            </a>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:20px 28px;text-align:center;border-radius:0 0 20px 20px;">
      <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.7;">
        PetResQR — Keeping pets safe and families connected 🐾<br>
        You received this because someone scanned <strong>${pet.name}</strong>'s QR tag.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`,
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