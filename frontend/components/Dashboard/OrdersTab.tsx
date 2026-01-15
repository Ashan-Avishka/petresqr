import React, { useState } from 'react';
import { Package, ChevronDown, ChevronUp, Calendar, CreditCard, MapPin, Tag, XCircle, Image as ImageIcon } from 'lucide-react';
import { useUserContext } from '../../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

const OrdersTab: React.FC = () => {
    const { orders, cancelOrder } = useUserContext();
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState<string | null>(null);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    const toggleOrder = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        setCancelling(orderId);
        const success = await cancelOrder(orderId);
        setCancelling(null);

        if (success) {
            alert('Order cancelled successfully');
        } else {
            alert('Failed to cancel order');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-black text-green-400 shadow-md shadow-green-400';
            case 'shipped':
                return 'bg-black text-blue-400 shadow-md shadow-blue-400';
            case 'processing':
            case 'paid':
                return 'bg-black text-cyan-400 shadow-md shadow-cyan-400';
            case 'pending':
                return 'bg-black text-yellow-400 shadow-md shadow-yellow-400';
            case 'cancelled':
                return 'bg-black text-red-400 shadow-md shadow-red-400';
            default:
                return 'bg-gray-400 text-gray-800';
        }
    };

    const canCancelOrder = (status: string) => {
        return ['pending', 'paid'].includes(status);
    };

    const handleImageLoad = (imageUrl: string) => {
        setLoadedImages(prev => new Set(prev).add(imageUrl));
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-4xl font-bold text-white">My Orders</h2>
                <p className="text-gray-400 mt-1">View and track your order history</p>
            </div>

            <div className="grid gap-4">
                {orders.map(order => (
                    <div 
                        key={order._id} 
                        className="bg-gradient-to-br from-primary via-black to-black rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg"
                    >
                        {/* Order Header */}
                        <div 
                            className="p-6 cursor-pointer"
                            onClick={() => toggleOrder(order._id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-black shadow-md shadow-primary rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white font-mono">
                                            Order #{order._id}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        {order.petId && (
                                            <p className="text-sm text-primary mt-1">
                                                Pet: {order.petId.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-2 w-25 text-center rounded-xl text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    <span className="text-xl text-white">
                                        ${order.total.toFixed(2)}
                                    </span>
                                    {expandedOrderId === order._id ? (
                                        <ChevronUp className="w-6 h-6 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Order Details with Framer Motion */}
                        <AnimatePresence>
                            {expandedOrderId === order._id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6">
                                        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-400">
                                            {/* Items Section */}
                                            <div>
                                                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                    <Tag className="w-5 h-5 text-primary" />
                                                    Items ({order.items.length})
                                                </h4>
                                                <div className="space-y-3">
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="bg-black bg-opacity-50 rounded-lg p-4">
                                                            <div className="flex gap-4">
                                                                {item.image && (
                                                                    <div className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden relative">
                                                                        {!loadedImages.has(item.image) && (
                                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                                <ImageIcon className="w-8 h-8 text-gray-600" />
                                                                            </div>
                                                                        )}
                                                                        <img 
                                                                            src={item.image} 
                                                                            alt={item.name}
                                                                            onLoad={() => handleImageLoad(item.image)}
                                                                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                                                                                loadedImages.has(item.image) ? 'opacity-100' : 'opacity-0'
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-medium text-white">{item.name}</p>
                                                                        <p className="text-sm text-gray-400">Size: {item.size}</p>
                                                                        <p className="text-sm text-gray-400">Color: {item.color}</p>
                                                                        <p className="text-sm text-gray-200">Quantity: {item.quantity}</p>
                                                                    </div>
                                                                    <p className="text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Tag Info */}
                                                {order.tagId && (
                                                    <div className="mt-4">
                                                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                            <Tag className="w-5 h-5 text-primary" />
                                                            Associated Tag
                                                        </h4>
                                                        <div className="bg-black bg-opacity-50 rounded-lg p-4">
                                                            <p className="text-white font-mono">{order.tagId.qrCode}</p>
                                                            <p className="text-sm text-gray-400 mt-1">
                                                                Status: <span className="text-primary">{order.tagId.status}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Info Section */}
                                            <div>
                                                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5 text-primary" />
                                                    Order Information
                                                </h4>
                                                <div className="bg-black bg-opacity-50 rounded-lg p-4 space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Subtotal:</span>
                                                        <span className="text-white">${order.subtotal?.toFixed(2) || order.total.toFixed(2)}</span>
                                                    </div>
                                                    {order.shipping !== undefined && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">Shipping:</span>
                                                            <span className="text-white">${order.shipping.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    {order.tax !== undefined && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">Tax:</span>
                                                            <span className="text-white">${order.tax.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between pt-3 border-t border-gray-700">
                                                        <span className="font-semibold text-white">Total:</span>
                                                        <span className="font-semibold text-primary text-lg">${order.total.toFixed(2)}</span>
                                                    </div>
                                                    {order.paymentMethod && (
                                                        <div className="flex justify-between pt-3 border-t border-gray-700">
                                                            <span className="text-gray-400">Payment Method:</span>
                                                            <span className="text-white capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Shipping Address */}
                                                {order.shippingAddress && (
                                                    <div className="mt-4">
                                                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                            <MapPin className="w-5 h-5 text-primary" />
                                                            Shipping Address
                                                        </h4>
                                                        <div className="bg-black bg-opacity-50 rounded-lg p-4">
                                                            <p className="text-white">{order.shippingAddress.street}</p>
                                                            <p className="text-gray-400">
                                                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                                            </p>
                                                            {order.shippingAddress.country && (
                                                                <p className="text-gray-400">{order.shippingAddress.country}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tracking Info */}
                                                {order.trackingNumber && (
                                                    <div className="mt-4">
                                                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                            <Calendar className="w-5 h-5 text-primary" />
                                                            Tracking
                                                        </h4>
                                                        <div className="bg-black bg-opacity-50 rounded-lg p-4">
                                                            <p className="text-gray-400 text-sm mb-1">Tracking Number</p>
                                                            <p className="text-white font-mono">{order.trackingNumber}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Cancel Order Button */}
                                                {canCancelOrder(order.status) && (
                                                    <div className="mt-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelOrder(order._id);
                                                            }}
                                                            disabled={cancelling === order._id}
                                                            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                            {cancelling === order._id ? 'Cancelling...' : 'Cancel Order'}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Cancelled Info */}
                                                {order.status === 'cancelled' && order.cancelledAt && (
                                                    <div className="mt-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4">
                                                        <p className="text-red-400 text-sm">
                                                            Cancelled on {new Date(order.cancelledAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="text-center py-16">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                    <p className="text-gray-400">Your order history will appear here</p>
                </div>
            )}
        </div>
    );
};

export default OrdersTab;