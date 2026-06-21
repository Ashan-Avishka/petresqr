'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Dog, ShoppingBag, QrCode, DollarSign, TrendingUp } from 'lucide-react';
import { getAdminStats } from '../../../api/admin-api';
import type { AdminStats } from '../../../api/admin-types';

const STATUS_COLORS: Record<string, string> = {
  delivered: 'text-green-400 bg-green-400/10',
  paid: 'text-green-400 bg-green-400/10',
  active: 'text-green-400 bg-green-400/10',
  processing: 'text-amber-400 bg-amber-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
  shipped: 'text-amber-400 bg-amber-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  inactive: 'text-red-400 bg-red-400/10',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'text-gray-400 bg-gray-400/10'}`}
    >
      {status}
    </span>
  );
}

export default function OverviewPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-red-400 text-center py-10">Failed to load stats.</p>;
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-500/20' },
    { icon: Dog, label: 'Total Pets', value: stats.totalPets, color: 'bg-green-500/20' },
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'bg-purple-500/20' },
    { icon: QrCode, label: 'Total Scans', value: stats.totalScans, color: 'bg-cyan-500/20' },
    {
      icon: DollarSign,
      label: 'Revenue This Month',
      value: `$${stats.revenueThisMonth.toFixed(2)}`,
      color: 'bg-amber-500/20',
    },
    { icon: TrendingUp, label: 'New Users (30d)', value: stats.activeUsers, color: 'bg-pink-500/20' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 p-6 flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{card.label}</p>
                <p className="text-white text-2xl font-bold">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 p-6"
      >
        <h3 className="text-white font-semibold text-lg mb-4">Recent Orders</h3>
        <div className="space-y-1">
          {stats.recentOrders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between py-3 border-b border-white/5 hover:bg-white/5 px-2 rounded-lg transition-colors"
            >
              <div>
                <p className="text-white text-sm font-medium">
                  {order.userId
                    ? `${order.userId.firstName} ${order.userId.lastName}`
                    : 'Unknown User'}
                </p>
                <p className="text-gray-400 text-xs">
                  {order.petId?.name ?? '—'} · {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <span className="text-white text-sm font-medium">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {stats.recentOrders.length === 0 && (
            <p className="text-gray-400 text-center py-4">No recent orders</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
