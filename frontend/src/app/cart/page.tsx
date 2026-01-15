"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Package, CreditCard, MapPin, Check, Tag, AlertCircle, Lock } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import { useSquarePayment } from '../../../hooks/useSquarePayment';
import { paymentAPI } from '../../../api/payment-api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import config from '../../../config/env';
import { useAuthContext } from '../../../contexts/AuthContext';

const SQUARE_APPLICATION_ID = config.square.applicationId;
const SQUARE_LOCATION_ID = config.square.locationId;

export default function CartPage() {
  const router = useRouter();
  const {
    items: cartItems,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    itemCount,
    removeItem,
    updateItem,
    applyDiscount,
    clearCart
  } = useCart();

  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const [containerReady, setContainerReady] = useState(false);

  const { isLoaded: squareLoaded, error: squareError, tokenize } = useSquarePayment(
    SQUARE_APPLICATION_ID,
    SQUARE_LOCATION_ID,
    containerReady
  );

  const cardContainerRef = (element: HTMLDivElement | null) => {
    console.log('🔵 Ref callback called:', {
      element,
      elementId: element?.id,
      containerReady
    });
    if (element) {
      console.log('✅ Setting containerReady to true');
      setContainerReady(true);
    } else {
      console.log('❌ Element is null');
    }
  };

  // Also add a log to see when step 3 renders
  useEffect(() => {
    console.log('📍 Current step changed to:', currentStep);
    if (currentStep !== 3) {
      console.log('🔄 Resetting containerReady');
      setContainerReady(false);
    }
  }, [currentStep]);

  // Add cleanup effect
  useEffect(() => {
    if (currentStep !== 3) {
      setContainerReady(false);
    }
  }, [currentStep]);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const steps = [
    { number: 1, title: 'Cart', icon: ShoppingCart },
    { number: 2, title: 'Shipping', icon: MapPin },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Confirm', icon: Check }
  ];

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Lock className="w-10 h-10 text-amber-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-8">
            Please log in to access your shopping cart and complete your purchase.
          </p>
        </motion.div>
      </div>
    );
  }

  // Cart functions
  const updateQuantity = (id: string, change: number) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateItem({ id, quantity: newQuantity });
      }
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      applyDiscount(subtotal * 0.1);
      setAppliedPromo(true);
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      applyDiscount(subtotal * 0.2);
      setAppliedPromo(true);
    } else {
      alert('Invalid promo code. Try SAVE10 or SAVE20');
    }
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    if (currentStep === 2) {
      return Object.values(shippingInfo).every(val => val.trim() !== '');
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(Math.min(4, currentStep + 1));
    } else {
      alert('Please fill in all fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Tokenize payment method
      const tokenResult = await tokenize();

      if (!tokenResult) {
        setPaymentError('Failed to process payment method. Please check your card details.');
        setIsProcessing(false);
        return;
      }

      // Prepare order data
      const orderData = {
        sourceId: tokenResult.token,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          ...shippingInfo,
        },
        billingDetails: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
        }
      };

      // Create payment
      const response = await paymentAPI.createPayment(orderData);

      if (response.ok && response.data) {
        setOrderDetails(response.data);
        clearCart();
        nextStep();
      } else {
        setPaymentError(response.error?.message || 'Payment failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black shadow-md py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl px-4 mx-auto py-30">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.number
                      ? 'bg-gradient-to-br shadow-primary from-primary to-black text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all'
                      : 'bg-transparent text-white shadow-lg shadow-primary'
                      }
                    ${currentStep === step.number
                        ? 'scale-115 mb-2' : ''
                      }
                    `}
                  >
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.div>
                  <span className={`mt-2 text-xs sm:text-sm font-medium ${currentStep >= step.number ? 'text-white' : 'text-gray-400'
                    }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 sm:mx-4">
                    <div className={`h-full rounded transition-all duration-500 -mt-3 ${currentStep > step.number ? 'bg-primary' : 'bg-white'
                      }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Cart */}
              {currentStep === 1 && (
                <motion.div
                  key="cart"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -50 }}
                  variants={staggerContainer}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl text-white">Shopping Cart</h2>
                    <span className="bg-white text-black px-3 py-1 ml-4 rounded-full text-sm font-semibold">
                      {itemCount} items
                    </span>
                  </div>

                  {cartItems.length === 0 ? (
                    <motion.div
                      variants={fadeInUp}
                      className="text-center py-12"
                    >
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-white text-lg mb-6">Your cart is empty</p>
                      <Link href="/tags">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-gradient-to-br from-primary to-black text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                          Continue Shopping
                        </motion.button>
                      </Link>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {cartItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={fadeInUp}
                          custom={index}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-br from-primary via-black to-black rounded-xl hover:bg-gray-100 shadow-md shadow-primary transition-colors"
                        >
                          <Link href={`/tags/${item.slug}`}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link href={`/tags/${item.slug}`}>
                              <h3 className="text-white text-xl mb-1 hover:text-primary transition-colors cursor-pointer">
                                {item.name}
                              </h3>
                            </Link>
                            <div className="text-sm text-gray-400 mb-2 space-y-1">
                              {item.color && <p>Color: {item.color}</p>}
                              {item.size && <p>Size: {item.size}</p>}
                              {item.engraving && <p>Engraving: {item.engraving}</p>}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 bg-black rounded-lg border border-primary px-2 py-1">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="text-gray-300 hover:text-primary"
                                >
                                  <Minus className="w-4 h-4" />
                                </motion.button>
                                <span className="w-8 text-center font-semibold text-white">{item.quantity}</span>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="text-gray-300 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                              </div>
                              <span className="font-bold text-primary">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 self-start sm:self-center"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Shipping */}
              {currentStep === 2 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl text-white">Shipping Information</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="sm:col-span-2"
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="john@example.com"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="(555) 123-4567"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="sm:col-span-2"
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="123 Main Street"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="New York"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="NY"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="10001"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 bg-white/10 text-white border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="United States"
                        required
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl text-white">Payment Information</h2>
                  </div>

                  {squareError && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{squareError}</p>
                    </div>
                  )}

                  {paymentError && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{paymentError}</p>
                    </div>
                  )}

                  {/* Always render the container, show loader on top if not loaded */}
                  <div className="relative">
                    <div
                      id="card-container"
                      ref={cardContainerRef}
                      className="mb-6"
                    ></div>

                    {!squareLoaded && (
                      <div className="absolute inset-0 flex justify-center items-center bg-white/5 backdrop-blur-sm rounded-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 border border-white/20 rounded-lg p-4"
                  >
                    <p className="text-sm text-primary">
                      🔒 Your payment information is secure and encrypted
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && orderDetails && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-green-400" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h2>
                  <p className="text-gray-300 mb-6">
                    Thank you for your purchase. Your order has been successfully placed.
                  </p>
                  <div className="bg-white/10 rounded-lg p-6 mb-6 text-left">
                    <h3 className="font-semibold text-white mb-4">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Order Number:</span>
                        <span className="font-semibold text-white">#{orderDetails.order.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Email:</span>
                        <span className="font-semibold text-white">{shippingInfo.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Amount:</span>
                        <span className="font-semibold text-primary">${orderDetails.order.total.toFixed(2)}</span>
                      </div>
                      {orderDetails.payment.receiptUrl && (
                        <div className="pt-4 border-t border-white/20">
                          <a
                            href={orderDetails.payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline"
                          >
                            View Receipt
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Link href="/tags">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                      >
                        Continue Shopping
                      </motion.button>
                    </Link>
                    <Link href={`/orders/${orderDetails.order._id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-gradient-to-br from-primary to-black text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        View Order Details
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between mt-6"
              >
                {currentStep > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevStep}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-2 w-45 px-10 py-3 bg-white/10 text-gray-300 rounded-full hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={currentStep === 3 ? handlePayment : nextStep}
                  disabled={(cartItems.length === 0 && currentStep === 1) || isProcessing || (currentStep === 3 && !squareLoaded)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full justify-center w-45 ${(cartItems.length === 0 && currentStep === 1) || isProcessing || (currentStep === 3 && !squareLoaded)
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-primary to-black shadow-primary text-white shadow-sm hover:shadow-md hover:scale-101'
                    } transition-all`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : currentStep === 3 ? (
                    <>
                      Place Order
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-6 h-fit"
          >
            <div className="bg-gradient-to-br from-primary to-black shadow-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

              {/* Promo Code */}
              {currentStep < 4 && (
                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag className="w-5 h-5 text-white absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Promo code"
                        disabled={appliedPromo}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={applyPromoCode}
                      disabled={appliedPromo}
                      className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Apply
                    </motion.button>
                  </div>
                  {appliedPromo && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-green-400 mt-2"
                    >
                      ✓ Promo code applied!
                    </motion.p>
                  )}
                  <p className="text-xs text-gray-300 mt-2">Try: SAVE10 or SAVE20</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-white/20">
                <div className="flex justify-between text-white">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between text-green-400"
                  >
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </motion.div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-white">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Free Shipping Banner */}
              {subtotal < 50 && subtotal > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6"
                >
                  <p className="text-sm text-white">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping! 🎉
                  </p>
                  <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(subtotal / 50) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-primary to-white h-full"
                    />
                  </div>
                </motion.div>
              )}

              {/* Items in Cart */}
              {currentStep < 4 && cartItems.length > 0 && (
                <div className="pt-6 border-t border-white/20">
                  <h4 className="font-semibold text-white mb-4">Items ({itemCount})</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-white truncate">
                            {item.name}
                          </h5>
                          <p className="text-xs text-gray-300">Qty: {item.quantity}</p>
                          <p className="text-sm text-white font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 pt-6 border-t border-white/20 text-center"
              >
                <p className="text-xs text-gray-300 flex items-center justify-center gap-2">
                  <span className="text-green-400">🔒</span>
                  Secure SSL Encrypted Payment
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}