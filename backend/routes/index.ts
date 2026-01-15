// src/routes/index.ts

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Users
 *     description: User profile management
 *   - name: Pets
 *     description: Pet management
 *   - name: Orders
 *     description: Order management
 *   - name: Tags
 *     description: Pet tag management
 *   - name: QR
 *     description: QR code scanning operations
 *   - name: Gallery
 *     description: Public pet gallery
 *   - name: Admin
 *     description: Admin operations
 *   - name: Webhooks
 *     description: Webhook endpoints
 * 
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import petRoutes from './pets';
import orderRoutes from './orders';
import productRoutes from './products';
import tagRoutes from './tags';
import qrRoutes from './qr';
import foundPetRoutes from './foundPet';
import galleryRoutes from './gallery';
import paymentRoutes from './payments';
import adminRoutes from './admin';
import webhookRoutes from './webhooks';
import newsletterRoutes from './newsletter';
import contactRoutes from './contact';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/pets', petRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/tags', tagRoutes);
router.use('/qr', qrRoutes);
router.use('/foundPet', foundPetRoutes);
router.use('/gallery', galleryRoutes);
router.use('/payments', paymentRoutes); 
router.use('/admin', adminRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/contact', contactRoutes);


export default router;