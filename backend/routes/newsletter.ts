// backend/src/routes/newsletter.routes.ts
import express, { Request, Response } from 'express';
import { sendEmail } from '../utils/email';

const router = express.Router();

// Newsletter subscription endpoint
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
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

    // Send notification to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'support@petresqr.com',
      subject: 'New Newsletter Subscription',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #000 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-left: 3px solid #f59e0b; border-right: 3px solid #f59e0b; }
            .email-box { background: white; padding: 20px; border-radius: 5px; text-align: center; border: 2px solid #f59e0b; margin: 20px 0; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">📧 New Newsletter Subscriber</h2>
            </div>
            <div class="content">
              <p>A new user has subscribed to your newsletter!</p>
              <div class="email-box">
                <h3 style="color: #f59e0b; margin-top: 0;">Subscriber Email:</h3>
                <p style="font-size: 18px; font-weight: bold;"><a href="mailto:${email}" style="color: #f59e0b;">${email}</a></p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Add this email to your newsletter mailing list.</p>
            </div>
            <div class="footer">
              <p>Subscribed on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // Send welcome email to subscriber
    await sendEmail({
      to: email,
      subject: 'Welcome to PetResQR Newsletter! 🐾',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #000 100%); color: white; padding: 50px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 64px; margin-bottom: 15px; }
            .content { background: #f9fafb; padding: 40px; border-left: 3px solid #f59e0b; border-right: 3px solid #f59e0b; }
            .welcome-box { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; text-align: center; }
            .benefits { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
            .benefit-item { padding: 15px; margin: 10px 0; border-left: 4px solid #f59e0b; background: #fef3c7; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #000 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🐾</div>
              <h1 style="margin: 0; font-size: 32px;">Welcome to Our Community!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for joining PetResQR</p>
            </div>
            <div class="content">
              <div class="welcome-box">
                <h2 style="color: #f59e0b; margin-top: 0;">You're All Set! 🎉</h2>
                <p style="font-size: 16px;">We're excited to have you as part of the PetResQR family. You'll now receive exclusive updates, tips, and offers straight to your inbox.</p>
              </div>

              <div class="benefits">
                <h3 style="color: #f59e0b; text-align: center;">What to Expect:</h3>
                
                <div class="benefit-item">
                  <strong>🔔 Product Updates</strong>
                  <p style="margin: 5px 0 0 0;">Be the first to know about new pet tag designs and features</p>
                </div>
                
                <div class="benefit-item">
                  <strong>💡 Pet Safety Tips</strong>
                  <p style="margin: 5px 0 0 0;">Expert advice on keeping your furry friends safe and healthy</p>
                </div>
                
                <div class="benefit-item">
                  <strong>🎁 Exclusive Offers</strong>
                  <p style="margin: 5px 0 0 0;">Special discounts and promotions just for our subscribers</p>
                </div>
                
                <div class="benefit-item">
                  <strong>📖 Success Stories</strong>
                  <p style="margin: 5px 0 0 0;">Heartwarming tales of pets reunited with their families</p>
                </div>
              </div>

              <center>
                <a href="${process.env.FRONTEND_URL || 'https://petresqr.com'}" class="button">Explore Our Products</a>
              </center>

              <p style="margin-top: 30px; text-align: center; color: #6b7280;">Thank you for trusting us to help keep your pets safe! 🐕 🐈</p>
            </div>
            <div class="footer">
              <p><strong>PetResQR - Pet Recovery System</strong></p>
              <p>Email: info@marcc.com.au | Phone: 03 5432 1234</p>
              <p style="margin-top: 15px; color: #6b7280;">You're receiving this email because you subscribed to our newsletter.</p>
              <p style="margin-top: 10px;"><a href="${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #f59e0b;">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // Optional: Save subscriber to database
    // await NewsletterSubscriber.create({ email });

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to subscribe. Please try again later.'
    });
  }
});

export default router;