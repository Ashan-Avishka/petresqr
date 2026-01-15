// src/controllers/PaymentController.ts
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { paymentsApi, ordersApi, customersApi } from '../config/square';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class PaymentController {
  /**
   * Create Square payment and order
   */
  async createPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        sourceId, // Payment token from Square Web Payments SDK
        items, 
        shippingAddress, 
        petId, 
        tagId,
        billingDetails 
      } = req.body;

      // Validate required fields
      if (!sourceId) {
        sendError(res, 'Payment source is required', 400, 'MISSING_PAYMENT_SOURCE');
        return;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        sendError(res, 'Order must contain at least one item', 400, 'INVALID_ITEMS');
        return;
      }

      if (!shippingAddress) {
        sendError(res, 'Shipping address is required', 400, 'MISSING_ADDRESS');
        return;
      }

      // Validate location ID
      const locationId = process.env.SQUARE_LOCATION_ID;
      if (!locationId) {
        console.error('SQUARE_LOCATION_ID environment variable is not set');
        sendError(res, 'Payment configuration error', 500, 'MISSING_LOCATION_ID');
        return;
      }

      // Fetch product details and validate stock
      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          sendError(res, `Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
          return;
        }

        if (!product.isActive) {
          sendError(res, `Product ${product.name} is not available`, 400, 'PRODUCT_INACTIVE');
          return;
        }

        if (product.availability === 'out_of_stock') {
          sendError(res, `Product ${product.name} is out of stock`, 400, 'OUT_OF_STOCK');
          return;
        }

        if (product.stock !== undefined && product.stock < item.quantity) {
          sendError(res, `Insufficient stock for ${product.name}`, 400, 'INSUFFICIENT_STOCK');
          return;
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images && product.images.length > 0 ? product.images[0].url : undefined,
          sku: product.sku,
          size: item.size,
          color: item.color,
        });
      }

      // Get currency from environment or default to CAD
      const currency = process.env.SQUARE_CURRENCY || 'CAD';

      // Helper function to format phone number to E.164
      const formatPhoneNumber = (phone: string | undefined): string | undefined => {
        if (!phone) return undefined;
        
        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '');
        
        console.log('Phone digits:', digits, 'Length:', digits.length);
        
        // Skip numbers starting with 0 (international format that's not US)
        if (digits.startsWith('0')) {
          console.log('Phone starts with 0, not a US number - skipping');
          return undefined;
        }
        
        // For testing purposes, only accept US/Canada numbers (10 digits)
        // Square is very strict about phone number validation
        if (digits.length === 10) {
          return `+1${digits}`;
        }
        
        if (digits.length === 11 && digits.startsWith('1')) {
          return `+${digits}`;
        }
        
        // If it doesn't match US format, skip it
        console.log('Phone number does not match US/Canada format, skipping');
        return undefined;
      };

      // Create or get Square customer
      let squareCustomerId;
      try {
        const phoneNumber = formatPhoneNumber(billingDetails?.phone || shippingAddress.phone);
        
        // Build customer request object conditionally
        const customerRequest: any = {
          givenName: billingDetails?.name?.split(' ')[0] || shippingAddress.fullName?.split(' ')[0],
          familyName: billingDetails?.name?.split(' ').slice(1).join(' ') || shippingAddress.fullName?.split(' ').slice(1).join(' '),
          emailAddress: billingDetails?.email || shippingAddress.email,
          address: {
            addressLine1: shippingAddress.address,
            locality: shippingAddress.city,
            administrativeDistrictLevel1: shippingAddress.state,
            postalCode: shippingAddress.zipCode,
            country: 'US'
          }
        };

        // Only add phone number if it's valid US/Canada format
        if (phoneNumber) {
          customerRequest.phoneNumber = phoneNumber;
          console.log('Adding phone number to customer:', phoneNumber);
        } else {
          console.log('Skipping phone number - not in valid US/Canada format');
        }
        
        const customerResponse = await customersApi.create(customerRequest);
        squareCustomerId = customerResponse.customer?.id;
        console.log('Square customer created:', squareCustomerId);
      } catch (error: any) {
        console.error('Customer creation error:', error);
        // Continue without customer ID if creation fails
      }

      // Create Square Order with taxes included
      // Square calculates taxes automatically based on the tax configuration
      const squareOrderRequest: any = {
        idempotencyKey: uuidv4(),
        order: {
          locationId: locationId,
          lineItems: orderItems.map(item => ({
            name: item.name,
            quantity: item.quantity.toString(),
            basePriceMoney: {
              amount: BigInt(Math.round(item.price * 100)),
              currency: currency
            }
          })),
          // Add taxes at order level - Square will calculate the final total
          taxes: [{
            name: 'Sales Tax',
            percentage: '8.0',
            scope: 'ORDER'
          }],
          ...(squareCustomerId && { customerId: squareCustomerId })
        }
      };

      console.log('Creating Square order...');
      const squareOrderResponse = await ordersApi.create(squareOrderRequest);
      const squareOrder = squareOrderResponse.order;
      const squareOrderId = squareOrder?.id;
      
      console.log('Square order created:', squareOrderId);
      console.log('Square order total:', squareOrder?.totalMoney);

      // Get the actual total from Square's calculation (includes tax)
      const squareOrderTotal = squareOrder?.totalMoney?.amount;
      
      if (!squareOrderTotal) {
        sendError(res, 'Failed to calculate order total', 500, 'ORDER_TOTAL_ERROR');
        return;
      }

      // Calculate our values for database record (match Square's calculation)
      const squareSubtotal = Number(squareOrder?.totalMoney?.amount || 0) / 100;
      const squareTax = Number(squareOrder?.totalTaxMoney?.amount || 0) / 100;
      const baseAmount = squareSubtotal - squareTax;
      
      // Calculate shipping based on our rules
      const shipping = baseAmount > 50 ? 0 : 10.00;
      
      // For database, we'll store the breakdown
      const dbSubtotal = baseAmount;
      const dbTax = squareTax;
      const dbTotal = squareSubtotal;

      console.log('Order breakdown:', {
        squareOrderTotal: Number(squareOrderTotal),
        baseAmount,
        shipping,
        tax: squareTax,
        total: dbTotal
      });

      // Create payment using Square's calculated total
      const paymentRequest: any = {
        sourceId,
        idempotencyKey: uuidv4(),
        amountMoney: {
          amount: squareOrderTotal, // Use Square's calculated total
          currency: currency
        },
        ...(squareOrderId && { orderId: squareOrderId }),
        ...(squareCustomerId && { customerId: squareCustomerId }),
        locationId: locationId,
        note: `Order for ${orderItems.length} item(s)`,
        billingAddress: billingDetails ? {
          addressLine1: billingDetails.address,
          locality: billingDetails.city,
          administrativeDistrictLevel1: billingDetails.state,
          postalCode: billingDetails.zipCode,
          country: 'US'
        } : undefined,
        shippingAddress: {
          addressLine1: shippingAddress.address,
          locality: shippingAddress.city,
          administrativeDistrictLevel1: shippingAddress.state,
          postalCode: shippingAddress.zipCode,
          country: 'US'
        }
      };

      console.log('Creating payment with amount:', squareOrderTotal);
      const paymentResponse = await paymentsApi.create(paymentRequest);
      const payment = paymentResponse.payment;

      if (payment?.status !== 'COMPLETED') {
        sendError(res, 'Payment failed', 400, 'PAYMENT_FAILED');
        return;
      }

      console.log('Payment completed:', payment.id);

      // Update product stock
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
      }

      // Create order in database
      const order = await Order.create({
        userId: req.userId,
        items: orderItems,
        status: 'paid',
        subtotal: parseFloat(dbSubtotal.toFixed(2)),
        tax: parseFloat(dbTax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(dbTotal.toFixed(2)),
        currency: currency,
        shippingAddress: {
          street: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country || 'US'
        },
        paymentMethod: payment.cardDetails?.card?.cardBrand || 'card',
        squareOrderId,
        squarePaymentId: payment.id,
        paidAt: new Date(),
        petId,
        tagId,
      });

      const populatedOrder = await Order.findById(order._id)
        .populate('petId', 'name breed photoUrl')
        .populate('tagId', 'qrCode status');

      sendSuccess(res, {
        order: populatedOrder,
        payment: {
          id: payment.id,
          status: payment.status,
          receiptUrl: payment.receiptUrl,
          receiptNumber: payment.receiptNumber
        }
      }, 201);
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Handle specific Square errors
      if (error.errors) {
        const squareError = error.errors[0];
        sendError(
          res, 
          squareError.detail || 'Payment processing failed', 
          400, 
          squareError.code || 'PAYMENT_ERROR'
        );
        return;
      }

      sendError(res, 'Failed to process payment', 500, 'PAYMENT_PROCESSING_ERROR');
    }
  }

  /**
   * Get payment details from Square
   */
  async getPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      const response = await paymentsApi.get(paymentId);
      const payment = response.payment;

      sendSuccess(res, payment);
    } catch (error: any) {
      console.error('Get payment error:', error);
      sendError(res, 'Failed to fetch payment details', 500, 'FETCH_PAYMENT_ERROR');
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      // Find order and verify ownership
      const order = await Order.findOne({
        _id: orderId,
        userId: req.userId,
      });

      if (!order) {
        sendError(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
        return;
      }

      if (!order.squarePaymentId) {
        sendError(res, 'No payment ID found for this order', 400, 'NO_PAYMENT_ID');
        return;
      }

      if (order.status === 'cancelled') {
        sendError(res, 'Order is already cancelled', 400, 'ALREADY_CANCELLED');
        return;
      }

      // Create refund
      const refundRequest: any = {
        idempotencyKey: uuidv4(),
        amountMoney: {
          amount: BigInt(Math.round(order.total * 100)),
          currency: order.currency || 'CAD'
        },
        paymentId: order.squarePaymentId,
        reason: reason || 'Customer requested refund'
      };

      const refundResponse = await paymentsApi.createRefund(refundRequest);
      const refund = refundResponse.refund;

      // Update order status
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );
      }

      sendSuccess(res, {
        message: 'Refund processed successfully',
        refund: {
          id: refund?.id,
          status: refund?.status,
          amountMoney: refund?.amountMoney
        },
        order
      });
    } catch (error: any) {
      console.error('Refund error:', error);
      
      if (error.errors) {
        const squareError = error.errors[0];
        sendError(
          res, 
          squareError.detail || 'Refund processing failed', 
          400, 
          squareError.code || 'REFUND_ERROR'
        );
        return;
      }

      sendError(res, 'Failed to process refund', 500, 'REFUND_PROCESSING_ERROR');
    }
  }
}