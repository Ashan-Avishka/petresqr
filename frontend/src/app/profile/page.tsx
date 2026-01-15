"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dog, Tag, User, Truck, Lock } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useUserContext } from '../../../contexts/UserContext';
import PetsTab from '../../../components/Dashboard/PetsTab';
import TagsTab from '../../../components/Dashboard/TagsTab';
import OrdersTab from '../../../components/Dashboard/OrdersTab';
import ProfileTab from '../../../components/Dashboard/ProfileTab';

const CustomerDashboard = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuthContext();
    const { loading, error } = useUserContext();
    const [activeTab, setActiveTab] = useState('pets');

    const tabs = [
        { id: 'pets', label: 'My Pets', icon: Dog },
        { id: 'tags', label: 'Tags', icon: Tag },
        { id: 'orders', label: 'Orders', icon: Truck },
        { id: 'profile', label: 'Profile', icon: User }
    ];

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
            Please log in to access your Dashboard to manage your pets, tags, orders, and profile.
          </p>
        </motion.div>
      </div>
    );
  }

    return (
        <div className="min-h-screen bg-gradient-to-br bg-primary/60 via-black to-black pb-20">
            <div className="flex max-w-7xl mx-auto pt-30">
                {/* Left Sidebar Navigation */}
                <div className="w-64 h-[800px] bg-black p-6 rounded-xl">
                    <nav className="space-y-5">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-lg transition-all border-b-1 border-primary ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-br from-primary via-black via-60% to-black text-white shadow-md shadow-primary/40 scale-110'
                                            : 'text-gray-300 hover:bg-gradient-to-br from-primary via-black via-40% to-black hover:scale-105'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}

                    {activeTab === 'pets' && <PetsTab />}
                    {activeTab === 'tags' && <TagsTab />}
                    {activeTab === 'orders' && <OrdersTab />}
                    {activeTab === 'profile' && <ProfileTab />}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;