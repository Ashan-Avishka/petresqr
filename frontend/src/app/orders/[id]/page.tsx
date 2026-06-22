'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, ArrowLeft, Truck, Check, Clock, XCircle } from 'lucide-react';
import { orderAPI } from '../../../../api/order-api';
import type { Order } from '../../../../api/order-types';
import { getImageUrl } from '../../../../api/config';
import Link from 'next/link';

const STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'] as const;

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  paid: <CreditCard className="w-5 h-5" />,
  processing: <Package className="w-5 h-5" />,
  shipped: <Truck className="w-5 h-5" />,
  delivered: <Check className="w-5 h-5" />,
  cancelled: <XCircle className="w-5 h-5" />,
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await orderAPI.getOrderById(params.id as string);
      if (res.ok && res.data) {
        setOrder(res.data);
      } else {
        setError('Order not found.');
      }
      setLoading(false);
    };
    if (params.id) load();
  }, [params.id]);

  const handleCancel = async () => {
    if (!order || !confirm('Cancel this order?')) return;
    setCancelling(true);
    const res = await orderAPI.cancelOrder(order._id);
    if (res.ok && res.data) setOrder(res.data.order);
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading order...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">{error || 'Order not found'}</h2>
          <button onClick={() => router.push('/shop')} className="px-6 py-2 bg-primary text-white rounded-full">
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.indexOf(order.status as any);
  const isCancelled = order.status === 'cancelled';
  const canCancel = order.status === 'pending' || order.status === 'paid';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mt-10 flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Order Details</h1>
                <p className="text-gray-400 text-sm font-mono">#{order._id}</p>
                <p className="text-gray-500 text-sm mt-1">
                  Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {STATUS_ICONS[order.status]}
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  isCancelled ? 'bg-red-500/20 text-red-400' :
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                  'bg-primary/20 text-primary'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          {!isCancelled && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-6">Order Progress</h2>
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                        i <= currentStatusIndex
                          ? 'bg-primary border-primary text-white'
                          : 'border-white/20 text-gray-500'
                      }`}>
                        {i < currentStatusIndex ? <Check className="w-4 h-4" /> : STATUS_ICONS[step]}
                      </div>
                      <span className={`text-xs mt-2 capitalize text-center w-16 ${
                        i <= currentStatusIndex ? 'text-primary' : 'text-gray-500'
                      }`}>
                        {step}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-5 ${i < currentStatusIndex ? 'bg-primary' : 'bg-white/10'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {order.trackingNumber && (
                <p className="text-gray-400 text-sm mt-4">
                  Tracking: <span className="text-white font-mono">{order.trackingNumber}</span>
                </p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  {item.image && (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-white/10 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <p className="text-gray-400 text-sm">
                      {[item.size, item.color].filter(Boolean).join(' · ')}
                      {(item.size || item.color) ? ' · ' : ''}
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="text-white font-semibold">Shipping Address</h2>
              </div>
              <div className="text-gray-300 text-sm space-y-1">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-primary" />
                <h2 className="text-white font-semibold">Payment Summary</h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
              {order.paymentMethod && (
                <p className="text-gray-500 text-xs mt-3 capitalize">Paid via {order.paymentMethod}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                Continue Shopping
              </motion.button>
            </Link>
            {canCancel && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                disabled={cancelling}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
