'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { getAdminOrders, updateAdminOrderStatus } from '../../../api/admin-api';
import type { AdminOrder, AdminPagination, OrderStatus } from '../../../api/admin-types';

const STATUS_COLORS: Record<string, string> = {
  delivered: 'text-green-400 bg-green-400/10',
  paid: 'text-green-400 bg-green-400/10',
  processing: 'text-amber-400 bg-amber-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
  shipped: 'text-amber-400 bg-amber-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        STATUS_COLORS[status] ?? 'text-gray-400 bg-gray-400/10'
      }`}
    >
      {status}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm"
      >
        Previous
      </button>
      <span className="text-gray-400 text-sm">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm"
      >
        Next
      </button>
    </div>
  );
}

const ALL_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

interface UpdateModalProps {
  order: AdminOrder;
  onClose: () => void;
  onSuccess: (updated: AdminOrder) => void;
}

function UpdateStatusModal({ order, onClose, onSuccess }: UpdateModalProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const updated = await updateAdminOrderStatus(
      order._id,
      status,
      trackingNumber || undefined
    );
    setSaving(false);
    if (updated) {
      onSuccess(updated);
    } else {
      setError('Failed to update order status. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-black/90 border border-primary/20 rounded-2xl p-6 w-full max-w-md"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-white font-bold text-xl mb-1">Update Order Status</h3>
        <p className="text-gray-400 text-sm mb-6">
          Order #{order._id.slice(-8).toUpperCase()} &middot;{' '}
          {order.userId
            ? `${order.userId.firstName} ${order.userId.lastName}`
            : 'Unknown'}
        </p>

        <label className="block text-gray-400 text-sm mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="w-full bg-black/60 border border-primary/20 text-white rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:border-primary/60"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <label className="block text-gray-400 text-sm mb-1">
          Tracking Number (optional)
        </label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. 1Z999AA10123456784"
          className="w-full bg-black/60 border border-primary/20 text-white rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:border-primary/60"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-white/20 text-white rounded-full text-sm hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gradient-to-br from-primary via-black to-black text-white rounded-full text-sm font-medium disabled:opacity-50 hover:shadow-primary/30 hover:shadow-lg transition-all"
          >
            {saving ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const fetchOrders = (p: number, s: string) => {
    setLoading(true);
    getAdminOrders(p, s || undefined).then((result) => {
      if (result) {
        setOrders(result.data);
        setPagination(result.pagination);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders(page, statusFilter);
  }, [page, statusFilter]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleUpdateSuccess = (updated: AdminOrder) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    setSelectedOrder(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Orders</h3>
          <p className="text-gray-400 text-sm mt-1">
            {pagination ? `${pagination.total} total` : ''}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="bg-black/40 border border-primary/20 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/60"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white font-semibold">No orders found</p>
          <p className="text-gray-400 text-sm">Try a different filter</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Order ID</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Customer</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Pet</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Total</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Date</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {order.userId
                      ? `${order.userId.firstName} ${order.userId.lastName}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{order.petId?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1 bg-gradient-to-br from-primary via-black to-black text-white rounded-full text-xs hover:shadow-primary/30 hover:shadow-md transition-all"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.pages > 1 && (
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                totalPages={pagination.pages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              />
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <UpdateStatusModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
