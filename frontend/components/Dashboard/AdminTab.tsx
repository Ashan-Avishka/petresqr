'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, BarChart2, Users, Dog, ShoppingBag, Activity } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import OverviewPanel from './Admin/OverviewPanel';
import UsersPanel from './Admin/UsersPanel';
import PetsPanel from './Admin/PetsPanel';
import OrdersPanel from './Admin/OrdersPanel';
import AnalyticsPanel from './Admin/AnalyticsPanel';

const SUB_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'pets', label: 'Pets', icon: Dog },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'analytics', label: 'Analytics', icon: Activity },
] as const;

type SubTabId = (typeof SUB_TABS)[number]['id'];

export default function AdminTab() {
  const { user } = useAuthContext();
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('overview');

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Not Authorized</h2>
        <p className="text-gray-400">You do not have admin access.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white mb-1">Admin</h2>
        <p className="text-gray-400">Platform management</p>
      </div>

      {/* Horizontal sub-tab bar */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all border-b border-primary ${
                active
                  ? 'bg-gradient-to-br from-primary via-black via-60% to-black text-white shadow-md shadow-primary/40 scale-105'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeSubTab === 'overview' && <OverviewPanel />}
        {activeSubTab === 'users' && <UsersPanel />}
        {activeSubTab === 'pets' && <PetsPanel />}
        {activeSubTab === 'orders' && <OrdersPanel />}
        {activeSubTab === 'analytics' && <AnalyticsPanel />}
      </motion.div>
    </div>
  );
}
