// src/routes/webhooks.ts
import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();
const webhookController = new WebhookController();

/**
 * @swagger
 * /webhooks/square:
 *   post:
 *     summary: Handle Square payment webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Square webhook payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook payload
 *       401:
 *         description: Invalid webhook signature
 */
router.post('/square', webhookController.handleSquareWebhook);

/**
 * @swagger
 * /webhooks/twilio-sms:
 *   post:
 *     summary: Handle Twilio SMS status webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               MessageSid:
 *                 type: string
 *               MessageStatus:
 *                 type: string
 *                 enum: [accepted, queued, sending, sent, failed, delivered, undelivered, receiving, received, read]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook payload
 */
router.post('/twilio-sms', webhookController.handleTwilioSmsWebhook);

export default router;