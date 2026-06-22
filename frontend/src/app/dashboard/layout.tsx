'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog, Tag, User, Truck, Lock, BarChart2, Users, ShoppingBag, Activity, Package, Menu, X } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

const ADMIN_TABS = [
  { href: '/dashboard/overview', label: 'Overview', icon: BarChart2 },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/pets', label: 'All Pets', icon: Dog },
  { href: '/dashboard/orders', label: 'All Orders', icon: ShoppingBag },
  { href: '/dashboard/tags', label: 'Tags', icon: Tag },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/analytics', label: 'Analytics', icon: Activity },
];

const CUSTOMER_TABS = [
  { href: '/dashboard/pets', label: 'My Pets', icon: Dog },
  { href: '/dashboard/tags', label: 'Tags', icon: Tag },
  { href: '/dashboard/orders', label: 'Orders', icon: Truck },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';
  const tabs = isAdmin ? ADMIN_TABS : CUSTOMER_TABS;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTab = tabs.find(t => pathname === t.href || pathname.startsWith(t.href + '/'));

  const navItems = tabs.map((tab) => {
    const Icon = tab.icon;
    const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
    return (
      <Link key={tab.href} href={tab.href}
        onClick={() => setSidebarOpen(false)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-lg transition-all border-b border-primary/30 ${
          isActive
            ? 'bg-gradient-to-br from-primary via-black via-60% to-black text-white shadow-md shadow-primary/40 scale-110'
            : 'text-gray-300 hover:bg-gradient-to-br hover:from-primary hover:via-black hover:via-40% hover:to-black hover:scale-105'
        }`}>
        <Icon className="w-5 h-5 flex-none" />
        {tab.label}
      </Link>
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-8">Please log in to access your Dashboard.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br bg-primary/60 via-black to-black">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <motion.div
        className="fixed top-0 left-0 h-full w-64 z-50 bg-[#0a0a0a] py-6 px-4 overflow-y-auto md:hidden"
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-primary/80 font-semibold text-sm tracking-wide uppercase">Navigation</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="space-y-5">{navItems}</nav>
      </motion.div>

      <div className="flex max-w-7xl mx-auto h-full pt-[7.5rem] pb-5 gap-4 px-4">
        {/* Desktop sidebar */}
        <div className="w-64 flex-none bg-black py-6 px-4 rounded-xl overflow-y-auto hidden md:block">
          <nav className="space-y-5">{navItems}</nav>
        </div>

        {/* Page content */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* Mobile header bar */}
          <div className="flex md:hidden items-center gap-3 mb-3 flex-none">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-black/40 border border-primary/20 text-gray-400 hover:text-white transition-colors flex-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-white font-bold text-xl truncate">
              {activeTab?.label ?? 'Dashboard'}
            </span>
          </div>

          <div className="flex-1 py-2 md:py-8 px-0 md:px-4 overflow-hidden flex flex-col min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
