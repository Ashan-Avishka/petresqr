// backend/src/routes/contact.routes.ts
import express, { Request, Response } from 'express';
import { sendEmail } from '../utils/email';

const router = express.Router();

// Contact form endpoint
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, relatedTo, message } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    const relatedToLabels: { [key: string]: string } = {
      pet: 'Pet Management',
      tag: 'Tag Management',
      user: 'User Management',
      gallery: 'Pet Gallery',
      other: 'Other'
    };

    const relatedToLabel = relatedToLabels[relatedTo] || relatedTo || 'General Inquiry';

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'support@petresqr.com',
      subject: `New Contact Form Submission - ${relatedToLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #000 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-left: 3px solid #f59e0b; border-right: 3px solid #f59e0b; }
            .info-row { margin: 15px 0; padding: 12px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #f59e0b; margin-bottom: 5px; }
            .value { color: #333; }
            .message-box { background: white; padding: 20px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #f59e0b; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🐾 New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">From:</div>
                <div class="value">${name}</div>
              </div>
              <div class="info-row">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}" style="color: #f59e0b;">${email}</a></div>
              </div>
              <div class="info-row">
                <div class="label">Related To:</div>
                <div class="value">${relatedToLabel}</div>
              </div>
              ${message ? `
              <div class="message-box">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>This message was sent from the PetResQR contact form</p>
              <p>Received on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Thank You for Contacting PetResQR',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #000 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 48px; margin-bottom: 10px; }
            .content { background: #f9fafb; padding: 40px; border-left: 3px solid #f59e0b; border-right: 3px solid #f59e0b; }
            .summary-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #000 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🐾</div>
              <h2 style="margin: 0;">Thank You for Reaching Out!</h2>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for contacting PetResQR! We've received your message and our team will get back to you as soon as possible.</p>
              
              <div class="summary-box">
                <h3 style="color: #f59e0b; margin-top: 0;">Your Message Summary:</h3>
                <p><strong>Topic:</strong> ${relatedToLabel}</p>
                ${message ? `<p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
              </div>

              <p>We typically respond within 24-48 hours during business days. If your inquiry is urgent, please call us at <strong>03 5432 1234</strong>.</p>

              <center>
                <a href="${process.env.FRONTEND_URL || 'https://petresqr.com'}" class="button">Visit Our Website</a>
              </center>

              <p style="margin-top: 30px;">Best regards,<br><strong>The PetResQR Team</strong><br>Keeping Your Pets Safe 🐕 🐈</p>
            </div>
            <div class="footer">
              <p><strong>PetResQR - Pet Recovery System</strong></p>
              <p>Email: info@marcc.com.au | Phone: 03 5432 1234</p>
              <p style="margin-top: 15px; color: #6b7280;">This is an automated confirmation email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again later.'
    });
  }
});

export default router;