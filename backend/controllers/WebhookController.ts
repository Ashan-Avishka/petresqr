// src/controllers/WebhookController.ts
import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Tag } from '../models/Tag';
import { Pet } from '../models/Pet';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';
import { sendSMS } from '../config/twilio';
import { sendEmail, emailTemplates } from '../utils/email';

export class WebhookController {
  async handleSquareWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { type, data } = req.body;

      switch (type) {
        case 'payment.updated':
          await this.handlePaymentUpdate(data.object.payment);
          break;
        case 'order.updated':
          await this.handleOrderUpdate(data.object.order);
          break;
        default:
          console.log('Unhandled webhook type:', type);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Square webhook error:', error);
      res.status(500).send('Error');
    }
  }

  async handleTwilioSmsWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { MessageStatus, MessageSid, ErrorCode } = req.body;
      
      // Log SMS status
      console.log(`SMS ${MessageSid} status: ${MessageStatus}`);
      
      if (ErrorCode) {
        console.error(`SMS error: ${ErrorCode}`);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Twilio webhook error:', error);
      res.status(500).send('Error');
    }
  }

  private async handlePaymentUpdate(payment: any): Promise<void> {
    try {
      const order = await Order.findOne({ squareOrderId: payment.order_id })
        .populate('petId')
        .populate('userId');

      if (!order) return;

      if (payment.status === 'COMPLETED') {
        order.status = 'paid';
        order.paidAt = new Date();
        order.squarePaymentId = payment.id;
        await order.save();

        // Send confirmation notifications
        await this.sendOrderConfirmation(order);
      } else if (payment.status === 'FAILED') {
        order.status = 'cancelled';
        await order.save();
      }
    } catch (error) {
      console.error('Payment update error:', error);
    }
  }

  private async handleOrderUpdate(squareOrder: any): Promise<void> {
    // Handle Square order updates if needed
    console.log('Square order updated:', squareOrder.id);
  }

  private async sendOrderConfirmation(order: any): Promise<void> {
    try {
      const user = order.userId;
      const pet = order.petId;

      // Send SMS
      if (user.phone) {
        await sendSMS(
          user.phone,
          `✅ Payment confirmed! Your pet tag order for ${pet.name} has been received and will be shipped soon. Order ID: ${order._id}`
        );
      }

      // Send email
      if (user.email) {
        const emailTemplate = emailTemplates.orderConfirmation({
          id: order._id,
          petName: pet.name,
          total: order.total,
        });

        await sendEmail({
          to: user.email,
          ...emailTemplate,
        });
      }

      // Create notification
      const notification = new Notification({
        userId: user._id,
        type: 'order_shipped',
        title: 'Order Confirmed',
        message: `Your pet tag order for ${pet.name} has been confirmed and will be shipped soon.`,
        data: {
          orderId: order._id,
          petId: pet._id,
        },
      });

      await notification.save();
    } catch (error) {
      console.error('Order confirmation error:', error);
    }
  }
}